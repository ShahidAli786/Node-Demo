import { Schema, model, Document, Model, HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  lastMessage: string;
  unreadMessages: number;
  lastMessageTime: string;
  isOnline: boolean;
  isLastMessageRead: boolean;
  isImportant?: boolean;
  tokens: { token: string }[];
}

export interface IUserMethods {
  generateAuthToken(): Promise<string>;
  toJSON(): IUser;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(
    email: string,
    password: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  tokens: [{ token: { type: String, required: true } }],
  image: { type: String },
  lastMessage: { type: String, default: "" },
  unreadMessages: { type: Number, default: 0 },
  lastMessageTime: { type: String, default: "" },
  isOnline: { type: Boolean, default: false },
  isLastMessageRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this as IUser;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY as string);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this as IUser;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }
  return user;
};

const User = model<IUser, UserModel>("User", userSchema);

export default User;
