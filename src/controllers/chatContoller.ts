import Chat, { IChat } from "../models/Chat";
import { CustomRequest } from "../middleware/auth";
import User from "../models/User";
import Messages from "../models/Messages";

export const createChat = async (req: CustomRequest, res: any) => {
  if (!req.body.users || req.body.users.length < 2) {
    return res.status(400).json({
      error: "Please provide at least two users to create a chat",
    });
  }

  const existingUsers = await User.find({ _id: { $in: req.body.users } });
  if (existingUsers.length !== req.body.users.length) {
    return res.status(400).json({
      error: "One or more users do not exist",
    });
  }

  const chatData: Partial<IChat> = {
    users: req.body.users,
    isGroupChat: req.body.isGroupChat,
    chatName: req.body.chatName,
    groupAdmin: req.body.isGroupChat ? req.body.groupAdmin : undefined,
  };
  const newChat = new Chat(chatData);
  await newChat.save();
  return res.status(201).json(newChat);
};

export const getChats = async (req: CustomRequest, res: any) => {
  // add pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const chats = await Chat.find({ users: req.user?._id })
    .populate("users")
    .populate("lastMessage")
    .skip(skip)
    .limit(limit);
  const total = await Chat.countDocuments({ users: req.user?._id });
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    chats,
    totalPages,
  });
};

export const getChatMessages = async (req: CustomRequest, res: any) => {
  // get Messages of a chat
  //   handle pagination
  console.log(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const messages = await Messages.find({ chat: req.params.id })
    .populate("sender")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res.status(200).json({
    messages,
  });
};
