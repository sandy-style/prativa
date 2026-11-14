import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  getSubscribedCreators,
  getCreatorSubscribers,
} from "../controllers/subscriptionController.js";
import userAuth from "../middlewares/userAuth.js";

const subscriptionRouter = express.Router();

subscriptionRouter.get("/mine", userAuth, getSubscribedCreators);
subscriptionRouter.get("/creator/:creatorId/subscribers", getCreatorSubscribers);
subscriptionRouter.get("/creator/:creatorId/status", userAuth, getSubscriptionStatus);
subscriptionRouter.post("/:creatorId", userAuth, subscribe);
subscriptionRouter.delete("/:creatorId", userAuth, unsubscribe);

export default subscriptionRouter;
