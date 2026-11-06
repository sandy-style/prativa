import express from "express";
import {
  savePost,
  unsavePost,
  getSaveStatus,
  getSavedPosts,
} from "../controllers/savedPostController.js";
import userAuth from "../middlewares/userAuth.js";

const savedPostRouter = express.Router();

savedPostRouter.get("/", userAuth, getSavedPosts);
savedPostRouter.post("/:postId", userAuth, savePost);
savedPostRouter.delete("/:postId", userAuth, unsavePost);
savedPostRouter.get("/:postId", userAuth, getSaveStatus);

export default savedPostRouter;
