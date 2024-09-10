import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import moveRoutes from "./routes/movesRoutes";
import "./config/passport"; 
import cors from "cors";
import { COOKIE_MAX_AGE } from "./consts";
import { WebSocketServer, WebSocket } from "ws";
import { GameManager } from "./classes/GameManager";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: COOKIE_MAX_AGE },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", moveRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("this is the home route of the backend");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}`);
});

server.on("error", (err: Error) => {
  console.error(`Server error: ${err.message}`);
});

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on("connection", (ws: WebSocket) => {
  try {
    gameManager.addUser(ws);

    ws.on("message", (message: MessageEvent) => {
      // Handle WebSocket messages here
      // console.log(`Received message: ${message}`);
    });

    ws.on("close", () => {
      gameManager.removeUser(ws);
    });

    ws.on("error", (error: Error) => {
      console.error(`WebSocket error: ${error.message}`);

      ws.terminate();
    });
  } catch (error) {
    console.error(`WebSocket connection error: ${(error as Error).message}`);
    ws.terminate();
  }
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});
