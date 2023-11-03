import express from "express";
import {
  // addCourseToWishList,
  addQuestionOnVideo,
  addReview,
  adminReplyReview,
  answerReplyOnVideoQuestion,
  createCourse,
  deleteCourseByAdmin,
  editCourse,
  getAdminAllCourses,
  getAllCourse,
  getPurchasedCourse,
  getSingleCourse,
  likeCourseContent,
} from "../controllers/course.controller";
import { authorizedRole, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();
courseRouter
  .route("/getPurchasedCourse/:id")
  .get(isAuthenticated, getPurchasedCourse);
courseRouter
  .route("/addQuestionOnVideo")
  .put(isAuthenticated, addQuestionOnVideo);
courseRouter.route("/addReview/:id").put(isAuthenticated, addReview);
courseRouter
  .route("/replyAnswerQuestion")
  .put(isAuthenticated, answerReplyOnVideoQuestion);
courseRouter.route("/getSingleCourse/:id").get(getSingleCourse);
courseRouter.route("/getAllCourse").get(getAllCourse);
courseRouter
  .route("/likeCourseContent/:id")
  .put(isAuthenticated, likeCourseContent);
// courseRouter
//   .route("/addCourseToWishList")
//   .post(isAuthenticated, addCourseToWishList);

// ----------------------admin routes start from here--------------------
courseRouter
  .route("/createCourse")
  .post(isAuthenticated, authorizedRole("admin"), createCourse);
courseRouter
  .route("/adminReplyReview")
  .put(isAuthenticated, authorizedRole("admin"), adminReplyReview);
courseRouter
  .route("/get-admin-courses")
  .get(isAuthenticated, authorizedRole("admin"), getAdminAllCourses);
courseRouter
  .route("/deleteCourseByAdmin/:id")
  .delete(isAuthenticated, authorizedRole("admin"), deleteCourseByAdmin);
courseRouter
  .route("/updateCourse/:id")
  .put(isAuthenticated, authorizedRole("admin"), editCourse);

// authorizedRole()

export default courseRouter;
