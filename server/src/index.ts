import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyToken } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { configRouter } from "./routes/config";
import { usersRouter } from "./routes/users";
import { groupsRouter } from "./routes/groups";
import { messagesRouter } from "./routes/messages";
import { outingsRouter } from "./routes/outings";

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.set("io", io);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/config", configRouter);
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/outings", outingsRouter);

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) return next(new Error("Non authentifié."));

  const userId = verifyToken(token);
  if (!userId) return next(new Error("Token invalide."));

  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  socket.on("join-group", async (groupId: string) => {
    const userId = socket.data.userId as string;

    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!member) {
      socket.emit("error", "Vous n'êtes pas membre de ce groupe.");
      return;
    }

    socket.join(`group:${groupId}`);
  });

  socket.on("leave-group", (groupId: string) => {
    socket.leave(`group:${groupId}`);
  });
});

const PORT = parseInt(process.env.PORT || "4000", 10);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
