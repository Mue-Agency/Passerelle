import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { parse as parseCookie } from "cookie";
import { verifyToken } from "./lib/auth";
import { SESSION_COOKIE } from "./lib/cookies";
import { prisma } from "./lib/prisma";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { groupsRouter } from "./routes/groups";
import { messagesRouter } from "./routes/messages";
import { outingsRouter } from "./routes/outings";
import { errorMapper } from "./lib/errorMapper";

const app = express();
const httpServer = createServer(app);

// Derrière le proxy Render (+ Cloudflare) : nécessaire pour que express-rate-limit
// lise correctement l'IP via X-Forwarded-For. Sinon ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set("trust proxy", 1);

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
const DASH_URL = (process.env.DASH_URL || "http://localhost:3001").replace(/\/+$/, "");
const allowedOrigins = [FRONTEND_URL, DASH_URL];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.set("io", io);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/outings", outingsRouter);

app.use(errorMapper);

io.use((socket, next) => {
  // Auth via cookie httpOnly du handshake uniquement.
  const cookies = parseCookie(socket.handshake.headers.cookie ?? "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return next(new Error("Non authentifié."));

  const userId = verifyToken(token);
  if (!userId) return next(new Error("Token invalide."));

  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  socket.on("join-group", async (groupId: string) => {
    try {
      const userId = socket.data.userId as string;

      const member = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!member) {
        socket.emit("error", "Vous n'êtes pas membre de ce groupe.");
        return;
      }

      socket.join(`group:${groupId}`);
    } catch (err) {
      console.error("[socket:join-group]", err);
      socket.emit("error", "Erreur serveur.");
    }
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
