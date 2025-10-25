import { Schema, model, Types } from "mongoose";

export type ReportTarget = "POST" | "COMMENT" | "USER";
export type ReportStatus = "OPEN" | "ACTIONED" | "DISMISSED";

export interface IReport {
  reporterId: Types.ObjectId;
  targetType: ReportTarget;
  targetId: Types.ObjectId;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["POST", "COMMENT", "USER"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "ACTIONED", "DISMISSED"], default: "OPEN", index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = model<IReport>("Report", reportSchema);
