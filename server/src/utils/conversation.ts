import { Types } from "mongoose";

export function buildConversationHash(userA: Types.ObjectId, userB: Types.ObjectId) {
  const ids = [userA.toString(), userB.toString()].sort();
  return ids.join(":");
}
