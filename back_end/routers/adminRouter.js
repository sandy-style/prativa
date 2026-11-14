import express from "express";
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getAdminPosts,
  getAuditLogs,
  sendAnnouncement,
} from "../controllers/adminController.js";
import userAuth from "../middlewares/userAuth.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.use(userAuth, requireAdmin);

adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/users", getUsers);
adminRouter.get("/users/:userId", getUserDetails);
adminRouter.patch("/users/:userId", updateUserStatus);
adminRouter.get("/posts", getAdminPosts);
adminRouter.get("/audit-logs", getAuditLogs);
adminRouter.post("/announcements", sendAnnouncement);

export default adminRouter;
