import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ICourse, ICourseData, courseDataSchema, courseSchema } from "./course.model";
const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  isVarified: boolean;
  courses: Array<{ courseId: string }>;
  wishList: object[];
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  SIGN_ACCESS_TOKEN: () => string;
  SIGN_REFRESH_TOKEN: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}
export const userSchema: Schema<Iuser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please entered a valid email !",
      },
    },
    password: {
      type: String,
      minlength: [6, "password must be greater than 6 digits"],
      select: false,
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    courses: [{ courseId: String }],
    wishList: [Object],
    role: {
      type: String,
      default: "user",
    },
    avatar: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);

// hashed password before save
userSchema.pre<Iuser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
// create access token when user login
userSchema.methods.SIGN_ACCESS_TOKEN = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string);
};
// create refresh token when user refresh the page
userSchema.methods.SIGN_REFRESH_TOKEN = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string);
};

const userModel: Model<Iuser> = mongoose.model("user", userSchema);
export default userModel;
