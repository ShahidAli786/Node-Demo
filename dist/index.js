"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const userRouter_1 = __importDefault(require("./routes/userRouter"));
dotenv_1.default.config();
require("./db/db");
const User_1 = __importDefault(require("./models/User"));
const Messages_1 = __importDefault(require("./models/Messages"));
const Chat_1 = __importDefault(require("./models/Chat"));
const chatRouter_1 = __importDefault(require("./routes/chatRouter"));
const utils_1 = require("./utils/utils");
const auth_1 = __importDefault(require("./middleware/auth"));
const uploadfile_1 = require("./utils/uploadfile");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use("/api/users", userRouter_1.default);
app.use("/api/chat", chatRouter_1.default);
// Create HTTP and Socket.IO servers
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Adjust this to your client's URL
        methods: ["GET", "POST"],
    },
});
// Socket.IO Events
exports.io.use(utils_1.verifyToken);
exports.io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Handling user online status
    socket.on("user-online", (userId) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User ${userId} is online`);
        yield User_1.default.findByIdAndUpdate(userId, {
            isOnline: true,
            socketId: socket.id,
        });
        console.log(`User ${userId} is online`);
        socket.broadcast.emit("user-online", userId);
    }));
    // Handling user offline status
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.findOneAndUpdate({ socketId: socket.id }, { isOnline: false });
        const user = yield User_1.default.findOne({ socketId: socket.id });
        console.log(`User ${user === null || user === void 0 ? void 0 : user._id} is offline`);
        if (user) {
            socket.broadcast.emit("user-offline", user === null || user === void 0 ? void 0 : user._id);
        }
    }));
    // Sending a message
    socket.on("send-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, sender, chat: chatId } = data;
        const newMessage = new Messages_1.default({
            chat: chatId,
            sender,
            message,
        });
        yield newMessage.save();
        // update last message of chat
        yield Chat_1.default.findByIdAndUpdate(chatId, {
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
        });
        try {
            const chat = yield Chat_1.default.findById(chatId);
            chat === null || chat === void 0 ? void 0 : chat.users.forEach((userId) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield User_1.default.findById(userId);
                if (user === null || user === void 0 ? void 0 : user.socketId) {
                    // add sender object from db to newMessage
                    const senderUser = yield User_1.default.findById(sender);
                    if (senderUser) {
                        newMessage.sender = senderUser;
                    }
                    exports.io.to(user.socketId).emit("new-message", newMessage);
                }
            }));
        }
        catch (err) {
            console.log(err);
        }
    }));
});
// uploding image to server
app.post("/api/upload", auth_1.default, uploadfile_1.upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    // update user profile image
    req.user.image = req.file.path;
    req.user.save();
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file,
    });
});
// Start the server
httpServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
