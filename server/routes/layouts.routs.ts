

import express from "express";

import { authorizedRole, isAuthenticated } from "../middleware/auth";

import { getCourseAnalytics, getOrdersAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";
import { createLayout, getAllLayout, updateLayout } from "../controllers/layouts.controller";

const layoutsRouter = express.Router();

layoutsRouter
  .route("/create-layout")
  .post(isAuthenticated, authorizedRole("admin"), createLayout);
layoutsRouter
  .route("/update-layout")
  .put(isAuthenticated, authorizedRole("admin"), updateLayout);
layoutsRouter
  .route("/getAllLayout/:type")
  .get(isAuthenticated, getAllLayout);


export default layoutsRouter;

