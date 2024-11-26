import express, { Request } from "express";
import { loginUser, registerUser } from "../controllers/userController";

import User, { IUser } from "../models/User";
import auth, { CustomRequest } from "../middleware/auth";

const router = express.Router();

router.post("/register", async (req: Request, res: any) => {
  const userData: Partial<IUser> = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    image: req.body.image || "https://fakeimg.pl/80x80",
  };
  const registeredUser = await registerUser(userData);
  if (registeredUser.error) {
    return res.status(400).json({
      error: registeredUser.error,
    });
  }
  return res.status(201).json(registeredUser);
});

router.post("/login", async (req: Request, res: any) => {
  const userData: Partial<IUser> = {
    email: req.body.email,
    password: req.body.password,
  };
  const loggedInUser = await loginUser(userData);
  if (loggedInUser?.error) {
    return res.status(400).json({
      error: loggedInUser.error,
    });
  }
  return res.status(200).json(loggedInUser);
});

// Fetch logged in user
router.get("/me", auth, async (req: CustomRequest, res: any) => {
  return res.status(200).json({
    user: req.user,
  });
});

// Fetch other users list accept logged in user add pagination
router.get("/users", auth, async (req: CustomRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  // return total pages
  const total = await User.countDocuments({ _id: { $ne: req.user?._id } });
  const totalPages = Math.ceil(total / limit);
  const users = await User.find({ _id: { $ne: req.user?._id } })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    users,
    totalPages,
  });
});

// Logout user
router.post("/logout", auth, async (req: CustomRequest, res: any) => {
  if (req.user) {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
  }

  return res.status(200).json({
    message: "User logged out successfully.",
  });
});

// Logout user from all devices
router.post("/logoutall", auth, async (req: CustomRequest, res: any) => {
  if (req.user) {
    req.user.tokens = [];
    await req.user.save();
  }
  return res.status(200).json({
    message: "User logged out from all devices successfully.",
  });
});

export default router;
