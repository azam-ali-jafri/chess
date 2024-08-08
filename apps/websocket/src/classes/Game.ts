import { WebSocket } from "ws";
import { Chess, Piece, Square } from "chess.js";
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  PROMOTION_REQUIRED,
  TIMER_UPDATE,
} from "../constants/messages";
import { User } from "./User";
import { randomUUID } from "crypto";
import { GameStatus } from "@prisma/client";

export class Game {
  id: string;
  public whitePlayer: User;
  public blackPlayer: User;
  public board: Chess;
  public startTime: Date;
  public status: GameStatus;
  public moves: { from: string; to: string; player: "b" | "w" }[];
  public whiteTimer: number;
  public blackTimer: number;
  public currentPlayer: User;

  constructor(whitePlayer: User, blackPlayer: User) {
    this.id = randomUUID();
    this.status = "IN_PROGRESS";
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.board = new Chess();
    this.startTime = new Date();
    this.moves = [];
    this.whiteTimer = 600;
    this.blackTimer = 600;
    this.currentPlayer = this.whitePlayer;

    this.whitePlayer.userSocket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "white", gameId: this.id },
      })
    );
    this.blackPlayer.userSocket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "black", gameId: this.id },
      })
    );

    this.startTimer();
  }

  public timeInterval: NodeJS.Timeout | null = null;

  private startTimer() {
    if (this.timeInterval) clearInterval(this.timeInterval);

    this.timeInterval = setInterval(() => {
      if (this.status !== "IN_PROGRESS") return;

      if (this.currentPlayer === this.whitePlayer) {
        this.whiteTimer--;
      } else {
        this.blackTimer--;
      }

      this.broadcast(
        JSON.stringify({
          type: TIMER_UPDATE,
          payload: {
            whiteTimer: this.whiteTimer,
            blackTimer: this.blackTimer,
          },
        })
      );

      if (this.whiteTimer <= 0 || this.blackTimer <= 0) {
        this.status = "COMPLETED";
        this.whitePlayer.userSocket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: this.whiteTimer <= 0 ? "black" : "white",
            },
          })
        );
        this.blackPlayer.userSocket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: this.whiteTimer <= 0 ? "black" : "white",
            },
          })
        );
      }
    }, 1000);
  }

  public makeMove(
    userSocket: WebSocket,
    move: { from: Square; to: Square; promotion?: string }
  ) {
    if (
      (this.board.turn() === "b" &&
        this.blackPlayer.userSocket != userSocket) ||
      (this.board.turn() === "w" && this.whitePlayer.userSocket != userSocket)
    ) {
      console.log("invalid player");
      return;
    }

    const piece = this.board.get(move.from);
    if (!piece) {
      console.log("no piece at the source position");
      return;
    }

    const isPromotion =
      piece.type === "p" &&
      ((piece.color === "w" && move.to[1] === "8") ||
        (piece.color === "b" && move.to[1] === "1"));

    if (isPromotion && !move.promotion) {
      this.currentPlayer.userSocket.send(
        JSON.stringify({ type: PROMOTION_REQUIRED, payload: { move } })
      );
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.log(error);
      return;
    }

    const formattedMove = {
      ...move,
      player: (this.board.turn() === "b" ? "w" : "b") as "b" | "w",
    };

    this.moves.push(formattedMove);

    this.broadcast(
      JSON.stringify({ type: MOVE, payload: { move: formattedMove } })
    );

    this.currentPlayer =
      this.board.turn() == "b" ? this.blackPlayer : this.whitePlayer;

    if (this.board.isGameOver()) {
      this.endGame(this.board.turn() == "w" ? "black" : "white");
    }
  }

  public broadcast(message: any) {
    this.whitePlayer.userSocket.send(message);
    this.blackPlayer.userSocket.send(message);
  }

  public endGame(winner: "black" | "white") {
    this.status = "COMPLETED";

    this.broadcast(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner,
        },
      })
    );
  }
}
