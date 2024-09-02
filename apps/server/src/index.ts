import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import moveRoutes from "./routes/movesRoutes";
import "./config/passport"; // Import the passport configuration
import cors from "cors";
import { COOKIE_MAX_AGE } from "./consts";
import { WebSocketServer } from "ws";
import { GameManager } from "./classes/GameManager";

dotenv.config();

// Create an Express application
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

app.get("/", (req, res) => {
  res.send("this is the home route of the backend");
});

// Create a server that integrates with both Express and WebSocket
const server = app.listen(process.env.PORT || 8080, () => {
  console.log(
    `Express server is listening on port ${process.env.PORT || 8080}`
  );
});

// Initialize WebSocket server and attach it to the same HTTP server
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on("connection", (ws) => {
  gameManager.addUser(ws);

  ws.on("message", (message) => {
    // Handle WebSocket messages here
    // console.log(`Received message: ${message}`);
  });

  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});
