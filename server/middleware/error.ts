import { Request, Response, NextFunction } from 'express'
import ErrorHandler from '../utils/errorHandler';
export  const errorMiddleWare = async (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'internal server error !';

    if (err.name === 'CastError') {
        const message = `resource not found invalid ! ${err.path} `
        err = new ErrorHandler(message, 400);
    }
    if (err.code === 11000) {
        const message = `duplicate ! ${Object.keys(err.KeyValue)} entered ! `
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = `json web token is invalid ! try again `;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `json web token is Expired ! try again `;
        err = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

