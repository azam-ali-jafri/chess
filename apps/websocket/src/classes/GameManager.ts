import { WebSocket } from "ws";
import {
  INIT_GAME,
  MOVE,
  OPPONENT_ID,
  SEED_MOVES,
} from "../constants/messages";
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

  addUser(userSocket: WebSocket, playerId: string) {
    const user = new User(userSocket, playerId);
    this.users.push(user);
    this.addHandler(userSocket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.userSocket !== socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case INIT_GAME:
          this.handleInitGame(socket, message.payload.playerId);
          break;
        case MOVE:
          this.handleMove(socket, message.payload);
          break;
        case SEED_MOVES:
          this.handleSeedMoves(socket, message.payload.gameId);
          break;
        case OPPONENT_ID:
          this.handleOpponentId(socket, message.payload);
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    });
  }

  private handleInitGame(socket: WebSocket, playerId: string) {
    const existingGame = this.findExistingGame(playerId);

    if (existingGame) {
      this.reconnectToExistingGame(socket, playerId, existingGame);
      return;
    }

    const user = new User(socket, playerId);

    if (this.pendingUser) {
      const newGame = new Game(this.pendingUser, user);
      this.games.push(newGame);
      this.pendingUser = null;
    } else {
      this.pendingUser = user;
    }
  }

  private handleMove(
    socket: WebSocket,
    payload: { playerId: string; move: { from: string; to: string } }
  ) {
    const game = this.findGameByPlayerId(payload.playerId);

    if (game) {
      game.makeMove(socket, payload.move);
    }
  }

  private handleSeedMoves(socket: WebSocket, gameId: string) {
    const game = this.findGameById(gameId);

    if (game) {
      socket.send(
        JSON.stringify({ type: SEED_MOVES, payload: { moves: game.moves } })
      );
    }
  }

  private handleOpponentId(
    socket: WebSocket,
    payload: { playerId: string; gameId: string }
  ) {
    const game = this.findGameById(payload.gameId);

    if (game) {
      const opponentId =
        game.whitePlayer.playerId === payload.playerId
          ? game.blackPlayer.playerId
          : game.whitePlayer.playerId;
      socket.send(
        JSON.stringify({ type: OPPONENT_ID, payload: { opponentId } })
      );
    }
  }

  private findExistingGame(playerId: string): Game | undefined {
    return this.games.find(
      (game) =>
        (game.whitePlayer.playerId === playerId ||
          game.blackPlayer.playerId === playerId) &&
        game.status === "IN_PROGRESS"
    );
  }

  private reconnectToExistingGame(
    socket: WebSocket,
    playerId: string,
    game: Game
  ) {
    const playerColor = game.whitePlayer.playerId === playerId ? "w" : "b";
    const updatedPlayer =
      playerColor === "w"
        ? { whitePlayer: { ...game.whitePlayer, userSocket: socket } }
        : { blackPlayer: { ...game.blackPlayer, userSocket: socket } };

    Object.assign(game, updatedPlayer);

    socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: playerColor === "w" ? "white" : "black",
          gameId: game.id,
        },
      })
    );
  }

  private findGameByPlayerId(playerId: string): Game | undefined {
    return this.games.find(
      (game) =>
        (game.whitePlayer.playerId === playerId ||
          game.blackPlayer.playerId === playerId) &&
        game.status === "IN_PROGRESS"
    );
  }

  private findGameById(gameId: string): Game | undefined {
    return this.games.find((game) => game.id === gameId);
  }
}
