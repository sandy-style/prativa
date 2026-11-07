  import express from "express";

  import {
    createPost,
    getFeed,
    getUserPosts,
    getPost,
    deletePost,
  } from "../controllers/postController.js";

  import userAuth from "../middlewares/userAuth.js";
  import upload from "../middlewares/uploadMiddleware.js";

  const postRouter = express.Router();

  // Explore feed
  postRouter.get("/feed", getFeed);

  // Posts belonging to a particular user
  postRouter.get("/user/:userId", getUserPosts);

  // Create a post
  postRouter.post("/create", userAuth, upload.single("media"), createPost);

  // Get one post
  postRouter.get("/:postId", getPost);

  // Delete own post
  postRouter.delete("/:postId", userAuth, deletePost);

  export default postRouter;
