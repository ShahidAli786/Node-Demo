import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  users: string[]; // Array of user IDs in the chat
  lastMessage: string;
  lastMessageTime: Date;
}

const ChatSchema: Schema = new Schema({
  users: { type: [String], required: true },
  lastMessage: { type: String, default: "" },
  lastMessageTime: { type: Date, default: Date.now },
});

export default mongoose.model<IChat>("Chat", ChatSchema);
