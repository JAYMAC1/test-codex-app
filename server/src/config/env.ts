import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "ConnectedCommunity <no-reply@connectedcommunity.uk>",
  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DBNAME || "connectedcommunity_mvp2",
};
