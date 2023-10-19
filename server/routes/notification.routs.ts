import express from "express";

import { authorizedRole, isAuthenticated } from "../middleware/auth";
import {
  getAllNotifications,
  updateNotification,
} from "../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter
  .route("/getAllNotifications")
  .get(isAuthenticated, authorizedRole("admin"), getAllNotifications);
notificationRouter
  .route("/updateNotification/:id")
  .put(isAuthenticated, authorizedRole("admin"), updateNotification);

// authorizedRole()

export default notificationRouter;
