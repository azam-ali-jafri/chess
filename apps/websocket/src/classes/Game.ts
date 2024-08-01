import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "../constants/messages";
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

  constructor(whitePlayer: User, blackPlayer: User) {
    const id = randomUUID();
    this.id = id;
    this.status = "IN_PROGRESS";
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.board = new Chess();
    this.startTime = new Date();
    this.moves = [];

    this.whitePlayer.userSocket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "white", gameId: id },
      })
    );
    this.blackPlayer.userSocket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "black", gameId: id },
      })
    );
  }

  public makeMove(userSocket: WebSocket, move: { from: string; to: string }) {
    if (
      (this.board.turn() === "b" &&
        this.blackPlayer.userSocket != userSocket) ||
      (this.board.turn() === "w" && this.whitePlayer.userSocket != userSocket)
    ) {
      console.log("invalid player");
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.log(error);
      return;
    }

    if (this.board.isGameOver()) {
      this.whitePlayer.userSocket.send(
        JSON.stringify({ type: MOVE, payload: { move } })
      );

      this.blackPlayer.userSocket.send(
        JSON.stringify({ type: MOVE, payload: { move } })
      );

      this.whitePlayer.userSocket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      this.blackPlayer.userSocket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      this.status = "COMPLETED";

      return;
    }

    // if (this.board.moves().length % 2 === 0) {
    //   this.playerBlack.send(JSON.stringify({ type: MOVE, payload: move }));
    // } else this.playerWhite.send(JSON.stringify({ type: MOVE, payload: move }));

    const formattedMove = {
      ...move,
      player: (this.board.turn() === "b" ? "w" : "b") as "b" | "w",
    };

    this.moves.push(formattedMove);

    this.whitePlayer.userSocket.send(
      JSON.stringify({ type: MOVE, payload: { move: formattedMove } })
    );
    this.blackPlayer.userSocket.send(
      JSON.stringify({ type: MOVE, payload: { move: formattedMove } })
    );
  }
}
