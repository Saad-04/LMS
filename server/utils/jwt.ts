import { Response } from "express";
import { Iuser } from "../models/user.models";
import { redis } from './redis'

interface ITokenOptions {
    expires: Date,
    httpOnly: boolean,
    maxAge: number,
    sameSite: 'lax' | 'strict' | 'none' | undefined,
    secure?: boolean
}

const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || '300', 10);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || '1200', 10);
// options 
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: accessTokenExpires * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: true
    
}
export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: true
}
export const sendToken = (user: Iuser, statusCode: number, res: Response) => {
    const accessToken = user.SIGN_ACCESS_TOKEN();
    const refreshToken = user.SIGN_REFRESH_TOKEN();

    // upload user to redis 
    redis.set(user._id, JSON.stringify(user) as any)

    // parse environment variable to integrate fallback value

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true
    }
    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', refreshToken, refreshTokenOptions)
    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    });

}