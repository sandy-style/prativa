import express from "express";

import {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from "../controllers/userController.js";

import userAuth from "../middlewares/userAuth.js";

import {
  registerLimiter,
  loginLimiter,
  verificationLimiter,
  resendLimiter,
  passwordResetLimiter,
} from "../middlewares/ratelimiter.js";

const userRouter = express.Router();

// Authentication
userRouter.post("/register", registerLimiter, register);
userRouter.post("/login", loginLimiter, login);
userRouter.post("/google-login", loginLimiter, googleLogin);
userRouter.post("/logout", logout);

// Email verification
userRouter.post("/verify", verificationLimiter, verifyEmail);
userRouter.post("/resend", resendLimiter, resendVerification);

// Password reset
userRouter.post("/forgot-password", passwordResetLimiter, forgotPassword);
userRouter.post("/reset-password", passwordResetLimiter, resetPassword);

// Logged-in user
userRouter.get("/me", userAuth, getMe);

export default userRouter;
