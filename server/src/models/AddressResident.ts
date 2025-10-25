import { Schema, model, Types } from "mongoose";

export type AddressResidentRole = "OWNER" | "RESIDENT";
export type AddressResidentState = "PENDING" | "ACTIVE" | "REMOVED" | "BANNED";

export interface IAddressResident {
  userId: Types.ObjectId;
  addressId: Types.ObjectId;
  role: AddressResidentRole;
  state: AddressResidentState;
  requestedAt: Date;
  approvedAt?: Date | null;
  removedAt?: Date | null;
}

const addressResidentSchema = new Schema<IAddressResident>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", required: true, index: true },
    role: { type: String, enum: ["OWNER", "RESIDENT"], required: true },
    state: { type: String, enum: ["PENDING", "ACTIVE", "REMOVED", "BANNED"], default: "PENDING", index: true },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    removedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

addressResidentSchema.index({ addressId: 1, state: 1 });
addressResidentSchema.index({ userId: 1, state: 1 });

export const AddressResident = model<IAddressResident>("AddressResident", addressResidentSchema);
