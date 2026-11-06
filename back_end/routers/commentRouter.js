import express from "express";

import {
  createComment,
  getPostComments,
  deleteComment,
} from "../controllers/commentController.js";

import userAuth from "../middlewares/userAuth.js";

const commentRouter = express.Router();

// Get comments for a post
commentRouter.get("/:postId", getPostComments);

// Add a comment
commentRouter.post("/:postId", userAuth, createComment);

// Delete own comment
commentRouter.delete("/:commentId", userAuth, deleteComment);

export default commentRouter;
