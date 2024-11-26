"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatContoller_1 = require("../controllers/chatContoller");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("Chat Router");
});
// create chat
router.post("/create", auth_1.default, chatContoller_1.createChat);
router.get("/get-chats", auth_1.default, chatContoller_1.getChats);
router.get("/get-chat/:id", auth_1.default, chatContoller_1.getChatMessages);
exports.default = router;
