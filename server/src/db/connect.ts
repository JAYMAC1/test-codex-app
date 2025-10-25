import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error("Missing MongoDB connection string. Set the MONGODB_URI environment variable.");
  }

  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });
  console.log("✅ Mongo connected to DB:", env.mongodbDbName);
}
