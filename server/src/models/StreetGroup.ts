import { Schema, model } from "mongoose";

export interface IStreetGroup {
  name: string;
  townId: Schema.Types.ObjectId;
  memberCount: number;
}

const streetGroupSchema = new Schema<IStreetGroup>(
  {
    name: { type: String, required: true },
    townId: { type: Schema.Types.ObjectId, ref: "Town", required: true, index: true },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

streetGroupSchema.index({ townId: 1, name: 1 }, { unique: true });

export const StreetGroup = model<IStreetGroup>("StreetGroup", streetGroupSchema);
