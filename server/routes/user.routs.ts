import express from "express";
import {
  activateUser,
  getAdminAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialRegister,
  updateAccessToken,
  updateUserPassword,
  updateUserPicture,
} from "../controllers/user.controller";
import { authorizedRole, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.route("/registerUser").post(registerUser);
userRouter.route("/activateUser").post(activateUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/logoutUser").get(isAuthenticated, logoutUser);
userRouter.route("/refresh").get(updateAccessToken);
userRouter.route("/me").get(isAuthenticated, getUserInfo);
userRouter.route("/socialRegister").post(socialRegister);
userRouter.route("/updateUserInfo").put(isAuthenticated, socialRegister);
userRouter
  .route("/updateUserPassword")
  .put(isAuthenticated, updateUserPassword);
userRouter.route("/updateUserPicture").put(isAuthenticated, updateUserPicture);
userRouter.get(
  "/get-admin-users",
  isAuthenticated,
  authorizedRole("admin"),
  getAdminAllUsers
);
// authorizedRole()

export default userRouter;
