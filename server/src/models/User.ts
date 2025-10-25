import { Schema, model, Types } from "mongoose";

export type AddressRole = "OWNER" | "RESIDENT" | null;

export interface IUser {
  email: string;
  passwordHash: string;
  firstName: string;
  emailVerifiedAt: Date | null;
  postcode: string;
  streetGroupId?: Types.ObjectId | null;
  townId?: Types.ObjectId | null;
  addressId?: Types.ObjectId | null;
  addressRole: AddressRole;
  isAdmin: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    postcode: { type: String, required: true, uppercase: true, index: true },
    streetGroupId: { type: Schema.Types.ObjectId, ref: "StreetGroup", default: null },
    townId: { type: Schema.Types.ObjectId, ref: "Town", default: null },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    addressRole: { type: String, enum: ["OWNER", "RESIDENT", null], default: null },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const User = model<IUser>("User", userSchema);
