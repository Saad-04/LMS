import mongoose, { Schema, model, Document, Model } from "mongoose";

interface FaqItem extends Document {
  answer: string;
  question: string;
}
interface Category extends Document {
  title: string;
}
export interface ImageBanner extends Document {
  public_id: string;
  url: string;
}
interface Layouts extends Document {
  type: string;
  faq: FaqItem[];
  category: Category[];
  banner: {
    image: ImageBanner;
    title: string;
    subtitle: string;
  };
}

export const faqSchema = new Schema<FaqItem>({
  answer: { type: String },
  question: { type: String },
});

export const categorySchema = new Schema<Category>({
  title: { type: String },
});

export const ImageBannerSchema = new Schema<ImageBanner>({
  public_id: { type: String },
  url: { type: String },
});

export const layoutsSchema = new Schema<Layouts>({
  type: { type: String },
  faq: [faqSchema],
  category: [categorySchema],
  banner: {
    image: ImageBannerSchema,
    title: { type: String },
    subtitle: { type: String },
  },
});

const LayoutModel: Model<Layouts> = mongoose.model("Layouts", layoutsSchema);

export default LayoutModel;
