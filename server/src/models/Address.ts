import { Schema, model, Types } from "mongoose";

export interface IAddress {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
  ownerUserId?: Types.ObjectId | null;
  residentCount: number;
  createdAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    town: { type: String, required: true },
    postcode: { type: String, required: true, uppercase: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    residentCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

addressSchema.index({ postcode: 1, line1: 1 }, { unique: true });

export const Address = model<IAddress>("Address", addressSchema);
