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

// Create HTTP and Socket.IO servers
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this to your client's URL
    methods: ["GET", "POST"],
  },
});

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handling user online status
  socket.on("user-online", async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    console.log(`User ${userId} is online`);
  });

  // Handling user offline status
  socket.on("disconnect", async () => {
    console.log("A user disconnected:", socket.id);
    await User.findOneAndUpdate({ socketId: socket.id }, { isOnline: false });
  });

  // Sending a message
  socket.on("send-message", async (data) => {
    const { senderId, receiverId, content } = data;

    // Save message in the database
    const message = new Messages({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    });
    await message.save();

    // Update chat details
    const chat = await Chat.findOneAndUpdate(
      { users: { $all: [senderId, receiverId] } },
      {
        lastMessage: content,
        lastMessageTime: new Date(),
      },
      { new: true, upsert: true }
    );

    // Notify the receiver
    io.to(receiverId).emit("receive-message", { chat, message });
  });
});

// Start the server
httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
