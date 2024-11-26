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
exports.getChatMessages = exports.getChats = exports.createChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
const Messages_1 = __importDefault(require("../models/Messages"));
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.users || req.body.users.length < 2) {
        return res.status(400).json({
            error: "Please provide at least two users to create a chat",
        });
    }
    const existingUsers = yield User_1.default.find({ _id: { $in: req.body.users } });
    if (existingUsers.length !== req.body.users.length) {
        return res.status(400).json({
            error: "One or more users do not exist",
        });
    }
    const chatData = {
        users: req.body.users,
        isGroupChat: req.body.isGroupChat,
        chatName: req.body.chatName,
        groupAdmin: req.body.isGroupChat ? req.body.groupAdmin : undefined,
    };
    const newChat = new Chat_1.default(chatData);
    yield newChat.save();
    return res.status(201).json(newChat);
});
exports.createChat = createChat;
const getChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const chats = yield Chat_1.default.find({ users: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
        .populate("users")
        .populate("lastMessage")
        .skip(skip)
        .limit(limit);
    const total = yield Chat_1.default.countDocuments({ users: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id });
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        chats,
        totalPages,
    });
});
exports.getChats = getChats;
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get Messages of a chat
    //   handle pagination
    console.log(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const messages = yield Messages_1.default.find({ chat: req.params.id })
        .populate("sender")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return res.status(200).json({
        messages,
    });
});
exports.getChatMessages = getChatMessages;
