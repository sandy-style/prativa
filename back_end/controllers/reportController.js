import mongoose from "mongoose";
import Report from "../models/reportModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import AuditLog from "../models/auditLogModel.js";
import { createNotification } from "../services/notificationService.js";

// SUBMIT REPORT (USER)
export const createReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Target type, ID, and reason are required.",
      });
    }

    if (!["post", "user"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target type. Must be 'post' or 'user'.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID.",
      });
    }

    let targetPost = null;
    let targetUser = null;
    let contentSnapshot = {};

    if (targetType === "post") {
      targetPost = await Post.findById(targetId).populate("author", "name email");
      if (!targetPost) {
        return res.status(404).json({
          success: false,
          message: "Reported post does not exist.",
        });
      }

      if (targetPost.author?._id?.toString() === reporterId.toString()) {
        return res.status(400).json({
          success: false,
          message: "You cannot report your own post.",
        });
      }

      contentSnapshot = {
        title: targetPost.title,
        description: targetPost.description,
        content: targetPost.content,
        media: targetPost.media,
        category: targetPost.category,
        authorId: targetPost.author?._id,
        authorName: targetPost.author?.name,
      };
    } else {
      targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Reported user does not exist.",
        });
      }

      if (targetId.toString() === reporterId.toString()) {
        return res.status(400).json({
          success: false,
          message: "You cannot report yourself.",
        });
      }

      const prof = await Profile.findOne({ user: targetId });
      contentSnapshot = {
        name: targetUser.name,
        email: targetUser.email,
        username: prof?.username || "",
        bio: prof?.bio || "",
      };
    }

    // Check duplicate report
    const duplicateQuery = {
      reporter: reporterId,
      targetType,
      ...(targetType === "post" ? { targetPost: targetId } : { targetUser: targetId }),
    };

    const existingReport = await Report.findOne(duplicateQuery);
    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a report for this content.",
      });
    }

    const report = await Report.create({
      reporter: reporterId,
      targetType,
      targetPost: targetType === "post" ? targetId : null,
      targetUser: targetType === "user" ? targetId : null,
      contentSnapshot,
      reason,
      description: description?.trim() || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for helping keep PRATIVA safe. Your report has been submitted to the moderation team.",
      reportId: report._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a report for this content.",
      });
    }
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit report.",
    });
  }
};

// GET REPORTS (ADMIN/MODERATOR)
export const getReports = async (req, res) => {
  try {
    const { status, targetType, reason } = req.query;
    const filter = {};

    if (status && status !== "all") filter.status = status;
    if (targetType && targetType !== "all") filter.targetType = targetType;
    if (reason && reason !== "all") filter.reason = reason;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [reports, total, pendingCount] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reporter", "name email")
        .populate("targetPost")
        .populate("targetUser", "name email status")
        .populate("resolvedBy", "name")
        .lean(),
      Report.countDocuments(filter),
      Report.countDocuments({ status: "pending" }),
    ]);

    return res.status(200).json({
      success: true,
      reports,
      pendingCount,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + reports.length < total,
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch reports.",
    });
  }
};

// UPDATE REPORT STATUS & RESOLUTION (ADMIN)
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, moderatorNotes, actionTaken } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (status) report.status = status;
    if (moderatorNotes !== undefined) report.moderatorNotes = moderatorNotes;
    if (actionTaken) report.actionTaken = actionTaken;

    if (status === "resolved" || status === "dismissed") {
      report.resolvedBy = req.user.id;
      report.resolvedAt = new Date();
    }

    await report.save();

    await AuditLog.create({
      admin: req.user.id,
      action: `report_${status || "updated"}`,
      targetType: "report",
      targetId: report._id,
      details: { status: report.status, actionTaken: report.actionTaken, notes: moderatorNotes },
    });

    return res.status(200).json({
      success: true,
      message: "Report updated successfully.",
      report,
    });
  } catch (error) {
    console.error("Update report error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update report.",
    });
  }
};

// TAKE MODERATION ACTION (ADMIN)
// e.g. remove post, suspend user, issue warning
export const takeModerationAction = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, moderatorNotes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (action === "remove_post" && report.targetPost) {
      const post = await Post.findById(report.targetPost);
      if (post) {
        await Post.findByIdAndDelete(post._id);

        await createNotification({
          recipient: post.author,
          type: "admin_notice",
          title: "Post Removed by Moderation",
          message: `Your post "${post.title || "untitled"}" was removed for violating community guidelines (${report.reason}).`,
        });
      }

      report.actionTaken = "post_removed";
      report.status = "resolved";
    } else if (action === "suspend_user") {
      const targetUserId = report.targetType === "user"
        ? report.targetUser
        : report.contentSnapshot?.authorId;

      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, {
          status: "suspended",
          suspensionReason: moderatorNotes || `Violation of community guidelines (${report.reason})`,
        });

        await createNotification({
          recipient: targetUserId,
          type: "admin_notice",
          title: "Account Suspended",
          message: `Your account has been suspended by administration: ${moderatorNotes || "Community guideline violations"}.`,
        });
      }

      report.actionTaken = "user_suspended";
      report.status = "resolved";
    } else if (action === "issue_warning") {
      const targetUserId = report.targetType === "user"
        ? report.targetUser
        : report.contentSnapshot?.authorId;

      if (targetUserId) {
        await createNotification({
          recipient: targetUserId,
          type: "admin_notice",
          title: "Community Guidelines Warning",
          message: `Warning from PRATIVA Moderation: ${moderatorNotes || "Please review our guidelines regarding " + report.reason}.`,
        });
      }

      report.actionTaken = "warning_issued";
      report.status = "resolved";
    } else if (action === "dismiss") {
      report.actionTaken = "dismissed";
      report.status = "dismissed";
    }

    report.moderatorNotes = moderatorNotes || report.moderatorNotes;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    await AuditLog.create({
      admin: req.user.id,
      action: `moderation_${action}`,
      targetType: "report",
      targetId: report._id,
      details: { action, notes: moderatorNotes },
    });

    return res.status(200).json({
      success: true,
      message: `Moderation action "${action}" executed successfully.`,
      report,
    });
  } catch (error) {
    console.error("Take moderation action error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to execute moderation action.",
    });
  }
};
