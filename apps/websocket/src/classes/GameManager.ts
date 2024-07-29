import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "../constants/messages";
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
      console.log("game manager message: ", message);

      if (message.type === INIT_GAME) {
        const existingGame = this.games.find(
          (game) =>
            game.blackPlayer.userSocket == socket ||
            game.blackPlayer.userSocket == socket
        );

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
            game.whitePlayer.playerId === message.playerId ||
            game.blackPlayer.playerId === message.playerId
        );

        console.log(this.games);

        console.log(game?.id);

        if (game) {
          game.makeMove(socket, message.move);
        }
      }
    });
  }
}
