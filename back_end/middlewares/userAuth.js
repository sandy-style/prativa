import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Bearer token authentication
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    const user = await User.findById(decoded.id).select(
      "_id isVerified role status suspensionReason",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: user.suspensionReason
          ? `Your account has been suspended: ${user.suspensionReason}`
          : "Your account has been suspended. Please contact support.",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role || "user",
      status: user.status || "active",
    };

    return next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please log in again.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default userAuth;
