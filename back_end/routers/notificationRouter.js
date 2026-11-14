import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import userAuth from "../middlewares/userAuth.js";

const notificationRouter = express.Router();

notificationRouter.get("/", userAuth, getMyNotifications);
notificationRouter.patch("/read-all", userAuth, markAllNotificationsRead);
notificationRouter.patch("/:notificationId/read", userAuth, markNotificationRead);
notificationRouter.delete("/:notificationId", userAuth, deleteNotification);

export default notificationRouter;
