import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: "Too many registration attempts. Try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many verification attempts. Try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: "Too many requests. Try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many password reset attempts. Try again later." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
