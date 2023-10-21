import express from "express";
import {
  activateUser,
  deleteUserByAdmin,
  getAdminAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialRegister,
  updateAccessToken,
  updateUserPassword,
  updateUserPicture,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizedRole, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.route("/registerUser").post(registerUser);
userRouter.route("/activateUser").post(activateUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/refresh").get(updateAccessToken);
userRouter.route("/socialRegister").post(socialRegister);
// ---------------------------authenticated routes start here----------------------------
userRouter.route("/logoutUser").get(isAuthenticated, logoutUser);
userRouter.route("/me").get(isAuthenticated, getUserInfo);
userRouter.route("/updateUserInfo").put(isAuthenticated, socialRegister);
userRouter
  .route("/updateUserPassword")
  .put(isAuthenticated, updateUserPassword);
userRouter.route("/updateUserPicture").put(isAuthenticated, updateUserPicture);

// ---------------------------admin routes start here----------------------------
userRouter.get(
  "/get-admin-users",
  isAuthenticated,
  authorizedRole("admin"),
  getAdminAllUsers
);
userRouter.put(
  "/updateUserRole",
  isAuthenticated,
  authorizedRole("admin"),
  updateUserRole
);
userRouter.delete(
  "/deleteUserByAdmin/:id",
  isAuthenticated,
  authorizedRole("admin"),
  deleteUserByAdmin
);

export default userRouter;
