import express from "express";

import {
  likePost,
  unlikePost,
  getLikeStatus,
} from "../controllers/likeController.js";

import userAuth from "../middlewares/userAuth.js";

const likeRouter = express.Router();

// Like a post
likeRouter.post("/:postId", userAuth, likePost);

// Unlike a post
likeRouter.delete("/:postId", userAuth, unlikePost);

// Get like status and count
likeRouter.get("/:postId", userAuth, getLikeStatus);

export default likeRouter;
