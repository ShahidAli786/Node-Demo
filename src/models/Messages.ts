import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
