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

      if (message.type === INIT_GAME) {
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

      // if (message.type === MOVE) {
      //   const game = this.games.find(
      //     (game) =>
      //       game.whitePlayer.playerId === user.playerId ||
      //       game.blackPlayer.playerId === user.playerId
      //   );
      //   if (game) {
      //     game.makeMove(user.userSocket, message.move);
      //   }
      // }
    });
  }
}
