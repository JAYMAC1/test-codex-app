import { Schema, model, Types } from "mongoose";

export interface IStreetChatMessage {
  streetGroupId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const streetChatMessageSchema = new Schema<IStreetChatMessage>(
  {
    streetGroupId: { type: Schema.Types.ObjectId, ref: "StreetGroup", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

streetChatMessageSchema.index({ streetGroupId: 1, createdAt: -1 });

export const StreetChatMessage = model<IStreetChatMessage>("StreetChatMessage", streetChatMessageSchema);
