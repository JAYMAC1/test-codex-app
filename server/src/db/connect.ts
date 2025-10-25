import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI!;
  const dbName = process.env.MONGODB_DBNAME || "connectedcommunity_mvp2";
  await mongoose.connect(uri, { dbName });
  console.log("✅ Mongo connected to DB:", dbName);
}
