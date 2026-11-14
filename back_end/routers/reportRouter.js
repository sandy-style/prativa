import express from "express";
import {
  createReport,
  getReports,
  updateReport,
  takeModerationAction,
} from "../controllers/reportController.js";
import userAuth from "../middlewares/userAuth.js";
import { requireAdmin, requireStaff } from "../middlewares/adminAuth.js";

const reportRouter = express.Router();

// User submission
reportRouter.post("/", userAuth, createReport);

// Staff/Admin moderation endpoints
reportRouter.get("/", userAuth, requireStaff, getReports);
reportRouter.patch("/:reportId", userAuth, requireStaff, updateReport);
reportRouter.post("/:reportId/action", userAuth, requireAdmin, takeModerationAction);

export default reportRouter;
