import { Schema, model, Types } from "mongoose";

export interface IComment {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

commentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = model<IComment>("Comment", commentSchema);
