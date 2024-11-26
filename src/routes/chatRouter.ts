import express, { Request } from "express";
import {
  createChat,
  getChatMessages,
  getChats,
} from "../controllers/chatContoller";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/", (req: Request, res: any) => {
  res.send("Chat Router");
});

// create chat
router.post("/create", auth, createChat);
router.get("/get-chats", auth, getChats);
router.get("/get-chat/:id", auth, getChatMessages);
export default router;
