import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit verification code
const generateCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Hash verification codes
const hashCode = (code) => {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET || process.env.JWT_SECRET)
    .update(code)
    .digest("hex");
};

// Compare code hashes safely
const compareCodes = (code, hashedCode) => {
  const inputHash = Buffer.from(hashCode(code), "hex");
  const storedHash = Buffer.from(hashedCode, "hex");

  return (
    inputHash.length === storedHash.length &&
    crypto.timingSafeEqual(inputHash, storedHash)
  );
};

// Send verification or password reset email
const sendCodeEmail = async (email, code, purpose) => {
  const isVerification = purpose === "verification";

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: isVerification
      ? "Verify your Prativa account"
      : "Reset your Prativa password",
    text: `Your ${
      isVerification ? "verification" : "password reset"
    } code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>${isVerification ? "Welcome to Prativa!" : "Password Reset"}</h2>
        <p>Your code is:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

// Create JWT and set authentication cookie
const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Safe user response
// IMPORTANT: Include role so the frontend can identify admins/moderators.
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  isVerified: user.isVerified,
});

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const code = generateCode();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      verificationCodeHash: hashCode(code),
      verificationCodeExpires: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendCodeEmail(normalizedEmail, code, "verification");

      return res.status(201).json({
        message: "Account created. Please verify your email.",
        email: user.email,
        emailSent: true,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      return res.status(201).json({
        message:
          "Account created, but the verification email could not be sent. Please request another code.",
        email: user.email,
        emailSent: false,
      });
    }
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Unable to register. Please try again.",
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+verificationCodeHash +verificationCodeExpires");

    if (!user || !user.verificationCodeHash) {
      return res.status(400).json({
        message: "Invalid verification request.",
      });
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Verification code has expired.",
      });
    }

    if (!compareCodes(code, user.verificationCodeHash)) {
      return res.status(400).json({
        message: "Incorrect verification code.",
      });
    }

    user.isVerified = true;
    user.verificationCodeHash = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    setTokenCookie(res, user._id);

    return res.json({
      message: "Email verified successfully.",
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      message: "Unable to verify email.",
    });
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified.",
      });
    }

    const code = generateCode();

    user.verificationCodeHash = hashCode(code);
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendCodeEmail(user.email, code, "verification");

    return res.json({
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Unable to resend verification code.",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
        needsVerification: true,
      });
    }

    setTokenCookie(res, user._id);

    return res.json({
      message: "Login successful.",
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to login.",
    });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Google email could not be verified.",
      });
    }

    const email = payload.email.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || "Prativa User",
        email,
        googleId: payload.sub,
        isVerified: true,
      });
    } else {
      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(401).json({
          message: "Unable to authenticate this Google account.",
        });
      }

      user.googleId = payload.sub;
      user.isVerified = true;

      await user.save();
    }

    setTokenCookie(res, user._id);

    return res.json({
      message: "Google login successful.",
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      message: "Google authentication failed.",
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isVerified: true,
    });

    if (!user || !user.password) {
      return res.json({
        message: "If the account exists, a reset code has been sent.",
      });
    }

    const code = generateCode();

    user.resetCodeHash = hashCode(code);
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendCodeEmail(user.email, code, "reset");

    return res.json({
      message: "If the account exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to process password reset.",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, code and new password are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+resetCodeHash +resetCodeExpires");

    if (!user || !user.resetCodeHash) {
      return res.status(400).json({
        message: "Invalid password reset request.",
      });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({
        message: "Reset code has expired.",
      });
    }

    if (!compareCodes(code, user.resetCodeHash)) {
      return res.status(400).json({
        message: "Incorrect reset code.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetCodeHash = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    return res.json({
      message: "Password reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
};

// GET LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Unable to get user.",
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({
    message: "Logged out successfully.",
  });
};
