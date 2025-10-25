import { Schema, model, Types } from "mongoose";

export interface IConversation {
  memberIds: Types.ObjectId[];
  memberHash: string;
  lastMessageAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    memberIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
    memberHash: { type: String, required: true, unique: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

conversationSchema.index({ memberHash: 1 }, { unique: true });

export const Conversation = model<IConversation>("Conversation", conversationSchema);
