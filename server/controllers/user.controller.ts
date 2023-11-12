import { Request, Response, NextFunction } from 'express';
import userModel from '../models/user.models';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import { Iuser } from '../models/user.models';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import sendEmail from '../utils/sendMail';
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';
import { redis } from '../utils/redis';
import { getAllUsersService, getUserById, updateUserRoleService } from '../services/service.user';
import cloudinary from 'cloudinary';
require('dotenv').config();
interface RegisterUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export const registerUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const emailExist = await userModel.findOne({ email });
    if (emailExist) {
      return next(new ErrorHandler('this email already exist ', 400));
    }
    const user: RegisterUser = { email, name, password };
    // activation token
    const activationToken = createActivationToken(user);
    let activationCode = activationToken.activationCode;
    let data = { user: { name: user.name }, activationCode };
    let html = ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);
    try {
      sendEmail({
        email: user.email,
        subject: 'activate your account',
        data,
        template: 'activation-mail.ejs',
      });
      res.status(201).json({
        success: true,
        message: `please check ${user.email} to activate acount`,
        activationToken: activationToken.token,
        activationCode,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400));
  }
});
// interface for activationToken
interface IativationToken {
  token: string;
  activationCode: string;
}
// create activationToken
const createActivationToken = (user: any): IativationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRETE as Secret,
    {
      expiresIn: '5m',
    }
  );
  return { token, activationCode };
};

// user activate request
interface ActivateRequest {
  activation_Code: string;
  activation_Token: string;
} // now activate user using opt code which send on user gmail which they entered !
export const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { activation_Code, activation_Token } = req.body as ActivateRequest; //-----
  const newUser: { user: Iuser; activationCode: string } = jwt.verify(
    activation_Token,
    process.env.ACTIVATION_SECRETE as string
  ) as { user: Iuser; activationCode: string };
  if (newUser.activationCode !== activation_Code) {
    return next(new ErrorHandler('activation_Code not matching!', 400));
  }
  const { email, name, password } = newUser.user;
  const emailExist = await userModel.findOne({ email });
  if (emailExist) {
    return next(new ErrorHandler('this email already exist!', 400));
  }
  const user = await userModel.create({ email, name, password });
  res.status(201).json({
    success: true,
    user,
  });
});

// LOGIN USER FUNCTION
interface IUserLogin {
  email: string;
  password: string;
}
export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as IUserLogin;

    if (!email || !password) {
      return next(new ErrorHandler('Please enter email and password', 400));
    }

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler('Invalid email or password', 400));
    }

    sendToken(user, 200, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const logoutUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });
    // remove user from redis
    const user = req.user?._id;
    await redis.del(user);
    await redis.del();
    res.status(200).json({
      success: true,
      message: 'logged out successfully!',
    });
  } catch (error: any) {
    next(new ErrorHandler(error.message, 400));
  }
});
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh_token = req.cookies.refresh_token as string;

    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

    const message = 'Could not refresh token';

    if (!decoded) {
      return next(new ErrorHandler(message, 400));
    }

    const userInRedis = await redis.get(decoded.id as string);

    if (!userInRedis) {
      return next(new ErrorHandler('Please login for access this resources!', 400));
    }

    const user = JSON.parse(userInRedis);

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: '5m',
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
      expiresIn: '3d',
    });

    req.user = user;

    res.cookie('access_token', accessToken, accessTokenOptions);

    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    await redis.set(user._id, JSON.stringify(user), 'EX', 604800); // 7days
    return next();
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get user/ info
export const getUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    getUserById(userId, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// social register account
interface SocialRegiter {
  email: string;
  name: string;
  avatar: string;
}
export const socialRegister = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, avatar } = req.body as SocialRegiter;
    const user = await userModel.findOne({ email });
    if (!user) {
      const newUser = await userModel.create({ email, name, avatar });
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// update user info
interface IUpdateUserInfo {
  name?: string;
}
export const updateUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as IUpdateUserInfo;
    const user = await userModel.findById(req.user?._id);

    if (name && user) {
      user.name = name;
    }
    await user?.save();
    await redis.del(req.user?._id);
    await redis.set(req.user?._id, JSON.stringify(user));
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// update user password
interface IUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body as IUpdateUserPassword;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler('Please enter old and new password', 400));
    }

    const user = await userModel.findById(req.user?._id).select('+password');

    if (user?.password === undefined) {
      return next(new ErrorHandler('Invalid user', 400));
    }

    const isPasswordMatch = await user?.comparePassword(oldPassword);

    if (!isPasswordMatch) {
      return next(new ErrorHandler('wrong old password', 400));
    }

    user.password = newPassword;

    await user.save();

    await redis.set(req.user?._id, JSON.stringify(user));

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
interface IUpdateUserPicture {
  avatar: string;
}
export const updateUserPicture = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body as IUpdateUserPicture;

    let userId = req.user?._id;

    const user = await userModel.findById(userId).select('+password');

    if (user && avatar) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

        const cloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: 'user-avatar',
          widtch: 150,
        });

        user.avatar = {
          public_id: cloud.public_id,
          url: cloud.secure_url,
        };
      } else {
        const cloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: 'user-avatar',
          widtch: 150,
        });
        user.avatar = {
          public_id: cloud.public_id,
          url: cloud.secure_url,
        };
      }
    }
    await user?.save();

    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get all orders --- only for admin
export const getAdminAllUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getAllUsersService(res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

interface UpdateUserRole extends Document {
  email: string;
  role: string;
}
// update user role --- only for admin
export const updateUserRole = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body as UpdateUserRole;
    const isUserExist = await userModel.findOne({ email });
    if (isUserExist) {
      const id = isUserExist._id;
      updateUserRoleService(res, id, role);
    } else {
      res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// delete user  --- only for admin
export const deleteUserByAdmin = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);

    if (!user) {
      next(new ErrorHandler('user not found ', 404));
    } else {
      await user.deleteOne({ id }); //-------deleted user
      await redis.del(id); //------also from user cache

      res.status(200).json({
        success: false,
        message: 'user deleted successfully',
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 404));
  }
});
