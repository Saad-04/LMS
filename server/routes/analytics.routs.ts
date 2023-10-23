import express from "express";

import { authorizedRole, isAuthenticated } from "../middleware/auth";

import { getCourseAnalytics, getOrdersAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = express.Router();

analyticsRouter
  .route("/user-analytics")
  .get(isAuthenticated, authorizedRole("admin"), getUsersAnalytics);
analyticsRouter
  .route("/course-analytics")
  .get(isAuthenticated, authorizedRole("admin"), getCourseAnalytics);
analyticsRouter
  .route("/order-analytics")
  .get(isAuthenticated, authorizedRole("admin"), getOrdersAnalytics);

// authorizedRole()

export default analyticsRouter;
