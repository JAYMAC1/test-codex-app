import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./db/connect.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import streetChatRoutes from "./routes/streetChatRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import geoRoutes from "./routes/geoRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { StreetChatMessage } from "./models/StreetChatMessage.js";
import { StreetMembership } from "./models/StreetMembership.js";
import { verifyToken } from "./utils/jwt.js";
import { User } from "./models/User.js";

async function bootstrap() {
  await connectDB();

  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.clientOrigin,
    },
  });

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api", addressRoutes);
  app.use("/api", postRoutes);
  app.use("/api", conversationRoutes);
  app.use("/api", streetChatRoutes);
  app.use("/api", reportRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", geoRoutes);

  app.use(errorHandler);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== "string") {
        return next(new Error("Authentication required"));
      }
      const payload = verifyToken<{ sub: string }>(token);
      const user = await User.findById(payload.sub);
      if (!user) {
        return next(new Error("Account not found"));
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    socket.on("street:join", async (streetGroupId: string) => {
      const user = socket.data.user;
      if (!user) return;
      const membership = await StreetMembership.findOne({
        userId: user._id,
        streetGroupId,
        leftAt: null,
      }).sort({ joinedAt: -1 });

      if (!membership || !user.emailVerifiedAt) {
        return;
      }

      socket.join(`street:${streetGroupId}`);
    });

    socket.on("street:message", async ({ streetGroupId, text }) => {
      const user = socket.data.user;
      if (!user || !streetGroupId || !text) return;

      const membership = await StreetMembership.findOne({ userId: user._id, streetGroupId, leftAt: null }).sort({ joinedAt: -1 });
      if (!membership) return;

      const message = await StreetChatMessage.create({
        streetGroupId,
        senderId: user._id,
        text,
      });

      io.to(`street:${streetGroupId}`).emit("street:message", {
        _id: message._id,
        streetGroupId,
        senderId: user._id,
        text,
        createdAt: message.createdAt,
        senderName: user.firstName,
      });
    });
  });

  server.listen(env.port, () => {
    console.log(`🚀 API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
