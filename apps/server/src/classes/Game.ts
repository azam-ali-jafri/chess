import { WebSocket } from "ws";
import { Chess, Square } from "chess.js";
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  PROMOTION_REQUIRED,
  TIMER_UPDATE,
} from "../constants/messages";
import { User } from "./User";
import { randomUUID } from "crypto";
import { GameStatus, TimeControl } from "@prisma/client";
import { timeControlMap } from "../constants/timemode";
import { db } from "../db/index";

export class Game {
  id: string;
  public whitePlayer: User;
  public blackPlayer: User;
  public board: Chess;
  public startTime: Date;
  public status: GameStatus;
  public moves: {
    from: string;
    to: string;
    player: "b" | "w";
    piece: string;
  }[];
  public whiteTimer: number;
  public blackTimer: number;
  public currentPlayer: User;
  public timeMode: TimeControl;

  private queue: (() => Promise<void>)[] = [];
  private processing = false;
  private timeInterval: NodeJS.Timeout | null = null;

  constructor(
    whitePlayer: User,
    blackPlayer: User,
    timeMode: TimeControl,
    createInDB: boolean
  ) {
    this.id = randomUUID();
    this.status = "IN_PROGRESS";
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.board = new Chess();
    this.startTime = new Date();
    this.moves = [];
    this.whiteTimer = timeControlMap[timeMode] * 60;
    this.blackTimer = timeControlMap[timeMode] * 60;
    this.currentPlayer = whitePlayer;
    this.timeMode = timeMode;

    this.initPlayers();
    this.startTimer();
    if (createInDB) this.createGameInDB();
  }

  private initPlayers() {
    this.whitePlayer.userSocket?.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "white", gameId: this.id },
      })
    );
    this.blackPlayer.userSocket?.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "black", gameId: this.id },
      })
    );
  }

  private async createGameInDB() {
    try {
      await db.game.create({
        data: {
          id: this.id,
          whitePlayerId: this.whitePlayer.playerId,
          blackPlayerId: this.blackPlayer.playerId,
          status: this.status,
          timeControl: this.timeMode,
          currentFen: this.board.fen(),
          whiteTimer: this.whiteTimer,
          blackTimer: this.blackTimer,
        },
      });
    } catch (error) {
      console.error("Error creating game in DB:", error);
    }
  }

  private startTimer() {
    if (this.timeInterval) clearInterval(this.timeInterval);

    this.timeInterval = setInterval(() => {
      if (this.status !== "IN_PROGRESS") return;

      if (this.currentPlayer.playerId === this.whitePlayer.playerId) {
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
        this.updateGameResult(this.whiteTimer <= 0 ? "black" : "white");
      }
    }, 1000);
  }

  public async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }

    this.processing = false;
  }

  public makeMove(
    userSocket: WebSocket,
    move: { from: Square; to: Square; promotion?: string }
  ) {
    if (
      (this.board.turn() === "b" &&
        this.blackPlayer.userSocket !== userSocket) ||
      (this.board.turn() === "w" && this.whitePlayer.userSocket !== userSocket)
    ) {
      console.log("Invalid player");
      return;
    }

    const piece = this.board.get(move.from);
    if (!piece) {
      console.log("No piece at the source position");
      return;
    }

    const isPromotion =
      piece.type === "p" &&
      ((piece.color === "w" && move.to[1] === "8") ||
        (piece.color === "b" && move.to[1] === "1"));

    if (isPromotion && !move.promotion) {
      this.currentPlayer.userSocket?.send(
        JSON.stringify({ type: PROMOTION_REQUIRED, payload: { move } })
      );
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.error("Move error:", error);
      return;
    }

    const formattedMove = {
      from: move.from,
      to: move.to,
      player: (this.board.turn() === "b" ? "w" : "b") as "b" | "w",
      piece: piece.type,
    };

    this.moves.push(formattedMove);

    this.broadcast(
      JSON.stringify({ type: MOVE, payload: { move: formattedMove } })
    );

    this.queue.push(async () => {
      try {
        await db.move.create({
          data: {
            gameId: this.id,
            moveNumber: this.moves.length,
            from: move.from,
            to: move.to,
            player: (this.board.turn() === "b" ? "w" : "b") as "b" | "w",
            piece: piece.type,
          },
        });

        await db.game.update({
          where: { id: this.id },
          data: {
            currentFen: this.board.fen(),
            whiteTimer: this.whiteTimer,
            blackTimer: this.blackTimer,
            currentTurn: this.board.turn(),
          },
        });
      } catch (error) {
        console.error("Error saving move to DB:", error);
      }
    });

    this.processQueue();

    this.currentPlayer =
      this.board.turn() === "b" ? this.blackPlayer : this.whitePlayer;

    if (this.board.isStalemate()) {
      this.endGame("none");
      return;
    }

    if (this.board.isGameOver()) {
      this.endGame(this.board.turn() === "w" ? "black" : "white");
    }
  }

  public broadcast(message: any) {
    this.whitePlayer.userSocket?.send(message);
    this.blackPlayer.userSocket?.send(message);
  }

  public async updateGameResult(winner: "black" | "white" | "none") {
    this.queue.push(async () => {
      try {
        await db.game.update({
          where: { id: this.id },
          data: {
            status: "COMPLETED",
            result: winner,
            endAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Error updating game result in DB:", error);
      }
    });

    this.processQueue();

    this.broadcast(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner,
        },
      })
    );
  }

  public exitGame(exitingPlayerId: string) {
    this.endGame(
      this.blackPlayer.playerId === exitingPlayerId ? "white" : "black"
    );
  }

  private endGame(winner: "black" | "white" | "none") {
    this.status = "COMPLETED";
    this.updateGameResult(winner);
  }
}
