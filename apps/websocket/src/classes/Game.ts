import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "../constants/messages";
import { User } from "./User";
import { randomUUID } from "crypto";

export class Game {
  id: string;
  public whitePlayer: User;
  public blackPlayer: User;
  private board: Chess;
  private startTime: Date;

  constructor(whitePlayer: User, blackPlayer: User) {
    const id = randomUUID();
    this.id = id;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.board = new Chess();
    this.startTime = new Date();
    this.whitePlayer.userSocket.send(
      JSON.stringify({ type: INIT_GAME, color: "white", gameId: id })
    );
    this.blackPlayer.userSocket.send(
      JSON.stringify({ type: INIT_GAME, color: "black", gameId: id })
    );
  }

  makeMove(move: { from: string; to: string }) {
    try {
      this.board.move(move);
    } catch (error) {
      console.log(error);
      return;
    }

    if (this.board.isGameOver()) {
      this.whitePlayer.userSocket.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );

      this.blackPlayer.userSocket.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    // if (this.board.moves().length % 2 === 0) {
    //   this.playerBlack.send(JSON.stringify({ type: MOVE, payload: move }));
    // } else this.playerWhite.send(JSON.stringify({ type: MOVE, payload: move }));

    this.whitePlayer.userSocket.send(
      JSON.stringify({ type: MOVE, payload: move })
    );
    this.blackPlayer.userSocket.send(
      JSON.stringify({ type: MOVE, payload: move })
    );
  }
}
