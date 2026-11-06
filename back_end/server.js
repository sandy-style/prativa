import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./configs/db.js";
import dns, { ALL } from "dns";
import connectCloudinary from "./configs/cloudinary.js";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter.js";
import profileRouter from "./routers/profileRouter.js";
import postRouter from "./routers/postRouter.js";
import likeRouter from "./routers/likeRouter.js";
import commentRouter from "./routers/commentRouter.js";
import savedPostRouter from "./routers/savedPostRouter.js";
const app = express();
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
const PORT = process.env.PORT;
app.get("/", (req, res) => {
  res.status(200).send("Api is working....");
});
//dns setupp
dns.setServers(["1.1.1.1", "8.8.8.8"]);
//middleware

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://volunteers-surgeons-divide-engaging.trycloudflare.com",
].filter(Boolean);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/profile", profileRouter);
app.use("/api/like", likeRouter);
app.use("/api/comment", commentRouter);
app.use("/api/saved", savedPostRouter);
//server startup
const startServer = async () => {
  try {
    await connectdb();
    connectCloudinary();
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("server startup failed", error);
    process.exit(1);
  }
};

startServer();
