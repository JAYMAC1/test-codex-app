import { Schema, model, Types } from "mongoose";

export interface IStreetMembership {
  userId: Types.ObjectId;
  streetGroupId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date | null;
}

const streetMembershipSchema = new Schema<IStreetMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    streetGroupId: { type: Schema.Types.ObjectId, ref: "StreetGroup", required: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
  },
  { timestamps: false }
);

streetMembershipSchema.index({ userId: 1, streetGroupId: 1, joinedAt: -1 });

export const StreetMembership = model<IStreetMembership>("StreetMembership", streetMembershipSchema);
