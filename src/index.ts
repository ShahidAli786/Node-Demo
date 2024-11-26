import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRouter";
dotenv.config();
import "./db/db";
import User from "./models/User";
import Messages from "./models/Messages";
import Chat from "./models/Chat";
import chatRouter from "./routes/chatRouter";
import { verifyToken } from "./utils/utils";
import auth, { CustomRequest } from "./middleware/auth";
import { upload } from "./utils/uploadfile";

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);

// Create HTTP and Socket.IO servers
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this to your client's URL
    methods: ["GET", "POST"],
  },
});

// Socket.IO Events
io.use(verifyToken);
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handling user online status
  socket.on("user-online", async (userId) => {
    console.log(`User ${userId} is online`);
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
    });
    console.log(`User ${userId} is online`);
    socket.broadcast.emit("user-online", userId);
  });

  // Handling user offline status

  socket.on("disconnect", async () => {
    await User.findOneAndUpdate({ socketId: socket.id }, { isOnline: false });
    const user = await User.findOne({ socketId: socket.id });
    console.log(`User ${user?._id} is offline`);
    if (user) {
      socket.broadcast.emit("user-offline", user?._id);
    }
  });

  // Sending a message
  socket.on("send-message", async (data) => {
    const { message, sender, chat: chatId } = data;
    const newMessage = new Messages({
      chat: chatId,
      sender,
      message,
    });
    await newMessage.save();
    // update last message of chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString(),
    });
    try {
      const chat = await Chat.findById(chatId);
      chat?.users.forEach(async (userId) => {
        const user = await User.findById(userId);
        if (user?.socketId) {
          // add sender object from db to newMessage
          const senderUser = await User.findById(sender);
          if (senderUser) {
            newMessage.sender = senderUser as any;
          }

          io.to(user.socketId).emit("new-message", newMessage);
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
});

// uploding image to server

app.post(
  "/api/upload",
  auth,
  upload.single("image"),
  (req: CustomRequest, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // update user profile image
    req.user!.image = req.file.path;
    req.user!.save();
    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  }
);
// Start the server
httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
