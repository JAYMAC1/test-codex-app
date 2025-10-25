import { Schema, model, Types } from "mongoose";

export type PostCategory =
  | "FOR_SALE"
  | "FREE"
  | "SERVICES"
  | "LOST_FOUND"
  | "ANNOUNCEMENT"
  | "EVENT";

export type PostVisibility = "STREET" | "STREET_AND_TOWN";
export type PostStatus = "ACTIVE" | "HIDDEN" | "DELETED";

export interface IPost {
  authorId: Types.ObjectId;
  streetGroupId: Types.ObjectId;
  townId: Types.ObjectId;
  category: PostCategory;
  title: string;
  body: string;
  visibility: PostVisibility;
  images?: string[];
  status: PostStatus;
  createdAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    streetGroupId: { type: Schema.Types.ObjectId, ref: "StreetGroup", required: true, index: true },
    townId: { type: Schema.Types.ObjectId, ref: "Town", required: true, index: true },
    category: {
      type: String,
      enum: ["FOR_SALE", "FREE", "SERVICES", "LOST_FOUND", "ANNOUNCEMENT", "EVENT"],
      default: "ANNOUNCEMENT",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    visibility: { type: String, enum: ["STREET", "STREET_AND_TOWN"], default: "STREET" },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["ACTIVE", "HIDDEN", "DELETED"], default: "ACTIVE", index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

postSchema.index({ streetGroupId: 1, createdAt: -1 });
postSchema.index({ townId: 1, createdAt: -1 });

export const Post = model<IPost>("Post", postSchema);
