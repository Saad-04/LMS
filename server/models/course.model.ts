import mongoose, { Document, Model, Schema } from "mongoose";
import { Iuser, userSchema } from "./user.models";

// export interface ICommentReply extends Document {
//   user: Iuser;
//   answer: string;
//   likes?: Iuser[];
// }
export interface IComment extends Document {
  user: Iuser;
  comment: string;
  commentReplies: IComment[];
  likes?: Iuser[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

export interface ICourseData extends Document {
  admin: object;
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
  likes: Iuser[];
}

export interface ICourse extends Document {
  admin: Iuser;
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased: number;
}

const commentSchema = new Schema<IComment>(
  {
    user: Object,
    comment: String,
    commentReplies: [Object],
    likes: [Object],
  },
  { timestamps: true }
);

interface IReview extends Document {
  user: Iuser;
  rating?: number;
  likes?: Iuser[];
  reviewComment: string;
  commentReplies?: IComment[]; //only admin can reply this comment
}
const reviewSchema = new Schema<IReview>(
  {
    user: Object,
    reviewComment: String,
    rating: {
      type: Number,
      default: 0,
    },
    commentReplies: [Object],
    likes: [Object],
  },
  { timestamps: true }
);

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});
export const courseDataSchema = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: Object,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
  likes: [],
});
export const courseSchema = new Schema<ICourse>(
  {
    admin: Object,
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;
