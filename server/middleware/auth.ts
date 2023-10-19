import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import userModel from "../models/user.models";
import { redis } from "../utils/redis";
import jwt, { Secret } from "jsonwebtoken";

export const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = req.cookies.access_token;
      if (!access_token) {
        return next(new ErrorHandler("please login first ! ", 400));
      }
      const decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as Secret
      );
      if (!decode) {
        return next(new ErrorHandler("invalid access token! ", 400));
      }
      const user = await redis.get(decode?.id); //this is will edit after
      if (!user) {
        return next(new ErrorHandler("user not found ! ", 404));
      }
      req.user = JSON.parse(user);
      next();
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

export const authorizedRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!roles.includes(req.user?.role || "")) {
        next(
          new ErrorHandler(
            `${req.user?.role} is now allowed to access this !`,
            400
          )
        );
      }
      next()
    } catch (error: any) {
      next(new ErrorHandler(error.message, 403));
    }
  };
};
