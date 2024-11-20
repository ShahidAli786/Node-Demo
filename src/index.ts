import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import userRouter from "./routes/userRouter";

import helmet from "helmet";
import "./db/db";

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
