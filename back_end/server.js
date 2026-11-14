import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "dns";
import cookieParser from "cookie-parser";

import connectdb from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

// Existing routers
import userRouter from "./routers/userRouter.js";
import profileRouter from "./routers/profileRouter.js";
import postRouter from "./routers/postRouter.js";
import likeRouter from "./routers/likeRouter.js";
import commentRouter from "./routers/commentRouter.js";
import savedPostRouter from "./routers/savedPostRouter.js";

// Additional routers
import notificationRouter from "./routers/notificationRouter.js";
import subscriptionRouter from "./routers/subscriptionRouter.js";
import leaderboardRouter from "./routers/leaderboardRouter.js";
import eventRouter from "./routers/eventRouter.js";
import reportRouter from "./routers/reportRouter.js";
import adminRouter from "./routers/adminRouter.js";

// Services
import { startEventPublicationScheduler } from "./services/eventPublicationService.js";

const app = express();

const PORT = process.env.PORT || 4000;

// ==========================================
// SECURITY HEADERS
// ==========================================

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  next();
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.status(200).send("PRATIVA API is running...");
});

// ==========================================
// DNS SETUP FOR MONGODB ATLAS
// ==========================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://volunteers-surgeons-divide-engaging.trycloudflare.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Preserve existing origin behavior.
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/profile", profileRouter);
app.use("/api/like", likeRouter);
app.use("/api/comment", commentRouter);
app.use("/api/saved", savedPostRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/events", eventRouter);
app.use("/api/reports", reportRouter);
app.use("/api/admin", adminRouter);

// ==========================================
// GLOBAL 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found.",
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================

const startServer = async () => {
  try {
    // 1. Connect to MongoDB.
    await connectdb();

    console.log("[Database] Connected successfully.");

    // 2. Initialize Cloudinary.
    await connectCloudinary();

    console.log("[Cloudinary] Initialized.");

    // 3. Start automatic Event publication
    // and expired Event finalization.
    startEventPublicationScheduler();

    // 4. Start Express server.
    app.listen(PORT, () => {
      console.log(`PRATIVA API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Startup failed:", error);

    process.exit(1);
  }
};

startServer();
