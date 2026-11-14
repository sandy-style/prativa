import userAuth from "./userAuth.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Administrator privileges required.",
    });
  }

  return next();
};

export const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!["admin", "moderator"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Moderator or Administrator privileges required.",
    });
  }

  return next();
};

export default [userAuth, requireAdmin];
