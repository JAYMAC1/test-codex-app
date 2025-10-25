import { Schema, model } from "mongoose";

export interface ITown {
  name: string;
  county?: string;
  lat?: number;
  lon?: number;
  memberCount: number;
}

const townSchema = new Schema<ITown>(
  {
    name: { type: String, required: true, unique: true },
    county: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

townSchema.index({ name: 1 });

export const Town = model<ITown>("Town", townSchema);
