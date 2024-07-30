import { WebSocket } from "ws";
import { INIT_GAME, MOVE, SEED_MOVES } from "../constants/messages";
import { Game } from "./Game";
import { User } from "./User";

export class GameManager {
  private games: Game[];
  private pendingUser: User | null;
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(user: WebSocket) {
    // this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.userSocket != socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        const existingGame = this.games.find(
          (game) =>
            (game.blackPlayer.playerId == message.playerId ||
              game.whitePlayer.playerId == message.playerId) &&
            game.status == "IN_PROGRESS"
        );

        if (existingGame) {
          const playerColor =
            existingGame?.blackPlayer?.playerId == message?.playerId
              ? "b"
              : "w";
          const index = this.games.findIndex(
            (game) => game.id === existingGame?.id
          );

          let updatedData = {};

          if (playerColor == "b") {
            updatedData = {
              blackPlayer: {
                ...this.games[index].blackPlayer,
                userSocket: socket,
              },
            };
          } else {
            updatedData = {
              whitePlayer: {
                ...this.games[index].whitePlayer,
                userSocket: socket,
              },
            };
          }

          socket.send(
            JSON.stringify({
              type: INIT_GAME,
              color: playerColor == "b" ? "black" : "white",
              gameId: existingGame?.id,
            })
          );

          this.games[index] = {
            ...this.games[index],
            ...updatedData,
            makeMove: this.games[index].makeMove,
          };

          return;
        }

        const user = new User(socket, message.playerId);
        this.users.push(user);
        if (this.pendingUser) {
          const newgame = new Game(this.pendingUser, user);
          this.games.push(newgame);

          this.pendingUser = null;
        } else {
          this.pendingUser = user;
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) =>
            (game.whitePlayer.playerId === message.playerId ||
              game.blackPlayer.playerId === message.playerId) &&
            game.status === "IN_PROGRESS"
        );

        if (game) {
          game.makeMove(socket, message.move);
        }
      }

      if (message.type === SEED_MOVES) {
        const game = this.games.find((game) => game.id == message?.gameId);

        socket.send(
          JSON.stringify({
            type: SEED_MOVES,
            moves: game?.moves,
          })
        );
      }
    });
  }
}
