import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleWare } from './middleware/error';
import userRouter from './routes/user.routs';
import courseRouter from './routes/course.routs';
import orderRouter from './routes/order.routs';
import notificationRouter from './routes/notification.routs';
import analyticsRouter from './routes/analytics.routs';
import layoutsRouter from './routes/layouts.routs';
export const app = express();
require('dotenv').config();
// body-parser
app.use(express.json({ limit: '50mb' }));
// cookie-parser
app.use(cookieParser());
// add-cors
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// userRouter
app.use('/api/v1', userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutsRouter);

// rout for not found routs
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`your page ${req.originalUrl} was not found !`) as any;
  err.statusCode - 404;
  next(err);
});
app.use(errorMiddleWare);
