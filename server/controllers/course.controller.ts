import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary";
import {
  createCourseCollection,
  getAllCoursesService,
} from "../services/service.course";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import sendEmail from "../utils/sendMail";
import ejs from "ejs";
import path from "path";
import NotificationModel from "../models/notificaton.model";
// only admin can create course
export const createCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req.body;
      data.admin = req.user;
      const thumbnail = data.thumbnail as string;
      if (!data) {
        next(new ErrorHandler("please fill all the fields", 400));
      }
      if (thumbnail) {
        const cloudImage = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "coursethumbnails",
          width: 150,
        });
        data.thumbnail = {
          public_id: cloudImage?.public_id,
          url: cloudImage?.secure_url,
        };
      }
      // now create a course
      createCourseCollection(data, res);
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);
// only admin can edit this
export const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      const courseId = req.params.id;

      const courseData = (await CourseModel.findById(courseId)) as any;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "coursethumbnails",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      // now update a course

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        {
          new: true,
        }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);
// get single course video
export const getSingleCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isRedisExist = await redis.get(courseId);

      if (isRedisExist) {
        const course = await JSON.parse(isRedisExist);

        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        await redis.set(courseId, JSON.stringify(course));
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);
// anyone can access this
export const getAllCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isRedisExist = await redis.get("allCourses");

      if (isRedisExist) {
        const allCourse = await JSON.parse(isRedisExist);

        res.status(200).json({
          success: true,
          allCourse,
        });
      } else {
        const allCourse = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        await redis.set("allCourses", JSON.stringify(allCourse));

        res.status(200).json({
          success: true,
          allCourse,
        });
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);
interface addQuestions extends Document {
  courseId: string;
  contentId: string;
  question: string;
}
// only purchased user can access this
export const getPurchasedCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404)
        );
      }

      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
  //add comment in video comment section
);
// when user like the video

// add a review
interface AddLike {
  contentId: string;
}
// here user like the video
export const likeCourseContent = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.body as AddLike;

      const courseId = req.params.id;

      const course = await CourseModel.findById(courseId);

      const courseContent = course?.courseData.find(
        (
          item: any //this is single video content
        ) => item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler(" content not found ", 404));
      }
      const user: any = {
        user: req.user,
      };

      const likeExist = courseContent.likes.some(
        (item: any) => item._id === req.user?._id //herer we check is user already give a like ?
      );

      if (likeExist) {
        courseContent.likes = courseContent.likes.filter(
          (item) => item._id !== req.user?._id //if already like exist then remove it
        );
      } else {
        courseContent.likes.push(user.user); //here we push req.user in array
      }

      await course?.save();

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
interface addQuestions extends Document {
  courseId: string;
  contentId: string;
  question: string;
}
// here anyone can asked question under a video
export const addQuestionOnVideo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, contentId, question } = req.body as addQuestions;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid content id", 400));
      }
      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("invalid content id", 400));
      }

      const newQuesion: any = {
        user: req.user,
        comment: question,
        questionReplies: [],
        // likes: [],
      };
      courseContent.questions.push(newQuesion);

      await NotificationModel.create({
        userId: req.user?._id,
        title: "new Question received",
        message: `You have a new question in ${courseContent.title}`,
      });

      await course?.save();

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface AddAnswer extends Document {
  courseId: string;
  contentId: string;
  answer: string;
  questionId: string;
}
// here anyone can asked question under a video
export const answerReplyOnVideoQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, contentId, questionId, answer } = req.body as AddAnswer;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid content id", 400));
      }
      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("invalid content id", 400));
      }
      // array of all questions
      const question = courseContent.questions.find((ques: any) =>
        ques._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
        likes: [],
      };

      question.commentReplies.push(newAnswer);

      await course?.save();

      if (question.user?._id === req.user?._id) {
        // create a notification
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new question reply in ${courseContent.title}`,
        });
      } else {
        const data: any = {
          title: courseContent.title,
          name: question.user.name,
          senderName: req.user?.name,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          sendEmail({
            email: question?.user?.email,
            subject: "Question reply ",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          next(new ErrorHandler(error.message, 404));
        }
      }

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface AddReview {
  userId: string;
  rating: number;
  review: string;
}
// add a review
export const addReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rating, review } = req.body as AddReview;

      const userCourseList = req.user?.courses;

      const courseId = req.params.id;

      const course = await CourseModel.findById(courseId);

      // check if courseId already exists in userCourseList based on _id
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExists) {
        return next(
          new ErrorHandler(
            "You are not eligible to add review on this course",
            404
          )
        );
      }
      // // check if review already exists in userCourseList based on _id
      // const reviewExists = course?.reviews?.some(
      //   (rev: any) => rev?.user._id.toString() === req.user?._id
      // );
      // if (!reviewExists) {
      //   return next(new ErrorHandler("you already give a reveiw ", 404));
      // }

      const reviewData: any = {
        user: req.user,
        reviewComment: review,
        rating,
        likes: [],
      };

      course?.reviews.push(reviewData);

      let avg = 0;

      course?.reviews.forEach((rat: any) => {
        avg += rat.rating;
      });

      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();

      // sendEmail({
      //   email: question.user.email,
      //   subject: "Question reply ",
      //   template: "question-reply.ejs",
      //   data,
      // });
      // }

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
interface ReplyReview {
  reviewId: string;
  reply: string;
  courseId: string;
}
// only admin reply this comment
export const adminReplyReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply, courseId, reviewId } = req.body as ReplyReview;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("course not found ", 404));
      }

      // check if courseId already exists in userCourseList based on _id
      const review = course.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("review not found ", 404));
      }

      const replyData: any = {
        user: req.user,
        comment: reply,
        likes: [],
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies.push(replyData);

      await course?.save();

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses --- only for admin
export const getAdminAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
