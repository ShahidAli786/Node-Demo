import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  chatName: string;
  isGroupChat: boolean;
  users: string[]; // Array of user IDs in the chat
  lastMessage: string;
  lastMessageTime: Date;
  groupAdmin: string;
  lastMessageReadBy: string[]; // Array of user IDs who read the last message
  importantBy: string[]; // Array of user IDs who marked the chat as important
}

const ChatSchema: Schema = new Schema(
  {
    chatName: { type: String },
    isGroupChat: { type: Boolean },
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageTime: { type: Date, default: Date.now },
    lastMessageReadBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    importantBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
