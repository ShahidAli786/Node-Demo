import express, { Request } from "express";
import {
  createChat,
  deleteChat,
  getChatMessages,
  getChats,
  getChatsTypes,
  markAsImportant,
} from "../controllers/chatContoller";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/", (req: Request, res: any) => {
  res.send("Chat Router");
});

// create chat
router.post("/create", auth, createChat);
router.get("/get-chats", auth, getChats);
router.get("/get-chats-type/:type", auth, getChatsTypes);
router.get("/get-chat/:id", auth, getChatMessages);
router.delete("/delete-chat/:id", auth, deleteChat);
router.post("/mark-important/:id", auth, markAsImportant);

export default router;
