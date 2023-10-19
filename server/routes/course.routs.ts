import express from "express";
import {
  addQuestionOnVideo,
  addReview,
  adminReplyReview,
  answerReplyOnVideoQuestion,
  createCourse,
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
  .route("/createCourse")
  .post(isAuthenticated, authorizedRole("admin"), createCourse);
courseRouter
  .route("/updateCourse/:id")
  .put(isAuthenticated, authorizedRole("admin"), editCourse);
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
  .route("/adminReplyReview")
  .put(isAuthenticated, authorizedRole("admin"), adminReplyReview);
  courseRouter.get(
    "/get-admin-courses",
    isAuthenticated,
    authorizedRole("admin"),
    getAdminAllCourses
  );
courseRouter
  .route("/likeCourseContent/:id")
  .put(isAuthenticated, likeCourseContent);

// authorizedRole()

export default courseRouter;
