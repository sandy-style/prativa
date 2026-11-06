import express from "express";

import {
  createProfile,
  getMyProfile,
  getUserProfile,
  updateProfile,
} from "../controllers/profileController.js";

import userAuth from "../middlewares/userAuth.js";
import upload from "../middlewares/uploadMiddleware.js";

const profileRouter = express.Router();

profileRouter.post(
  "/create",
  userAuth,
  upload.single("profileImage"),
  createProfile,
);

profileRouter.get("/me", userAuth, getMyProfile);

profileRouter.get("/:userId", getUserProfile);

profileRouter.put(
  "/update",
  userAuth,
  upload.single("profileImage"),
  updateProfile,
);

export default profileRouter;
