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

// get chats based on type (all, important, unread, read)
// add pagination
export const getChatsTypes = async (req: CustomRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  let chats;
  switch (req.params.type) {
    case "all":
      chats = await Chat.find({ users: req.user?._id })
        .populate("users")
        .populate("lastMessage")
        .skip(skip)
        .limit(limit);
      break;
    case "important":
      chats = await Chat.find({
        users: req.user?._id,
        importantBy: req.user?._id,
      })
        .populate("users")
        .populate("lastMessage")
        .skip(skip)
        .limit(limit);
      break;
    case "unread":
      chats = await Chat.find({
        users: req.user?._id,
        unreadCount: { $gt: 0 },
      })
        .populate("users")
        .populate("lastMessage")
        .skip(skip)
        .limit(limit);
      break;
    case "read":
      chats = await Chat.find({
        users: req.user?._id,
        unreadCount: 0,
      })
        .populate("users")
        .populate("lastMessage")
        .skip(skip)
        .limit(limit);
      break;
    default:
      return res.status(400).json({
        error: "Invalid type",
      });
  }
  const total = await Chat.countDocuments({ users: req.user?._id });
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    chats,
    totalPages,
  });
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

export const deleteChat = async (req: CustomRequest, res: any) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.id });
  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
    });
  }
  return res.status(200).json({
    message: "Chat deleted successfully",
  });
};

export const markAsImportant = async (req: CustomRequest, res: any) => {
  // if user exists in chat users array then remove it from importantBy array
  const chat = await Chat.findById(req.params.id);
  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
    });
  }

  const userIndex = chat.importantBy.indexOf(req?.user?._id as string);
  if (userIndex > -1) {
    chat.importantBy.splice(userIndex, 1);
  } else {
    chat.importantBy.push(req?.user?._id as string);
  }

  await chat.save();
  if (!chat) {
    return res.status(404).json({
      error: "Chat not found",
    });
  }
  return res.status(200).json({
    message: "Chat marked as important",
  });
};
