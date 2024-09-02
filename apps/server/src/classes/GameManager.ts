import { TimeControl } from "@prisma/client";
import { WebSocket } from "ws";
import {
  CANCEL_INIT,
  EXIT_GAME,
  INIT_GAME,
  MOVE,
  OPPONENT_ID,
  SEED_MOVES,
} from "../constants/messages";
import { Game } from "./Game";
import { User } from "./User";
import { Square } from "chess.js";
import { db } from "../db/index";

interface PendingUser {
  user: User;
  timemode: TimeControl;
}

export class GameManager {
  private games: Game[];
  private pendingUsers: Map<TimeControl, PendingUser[]>; // Map to hold pending users by time mode
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingUsers = new Map(); // Initialize the map
    this.users = [];
    this.loadActiveGames();
  }

  private async loadActiveGames() {
    const activeGames = await db.game.findMany({
      where: { status: "IN_PROGRESS" },
      include: { moves: true },
    });

    for (const gameData of activeGames) {
      const whitePlayer = new User(null, gameData.whitePlayerId);
      const blackPlayer = new User(null, gameData.blackPlayerId);

      const game = new Game(whitePlayer, blackPlayer, gameData.timeControl);
      game.id = gameData.id;
      game.status = gameData.status;
      game.currentPlayer =
        gameData.currentTurn === "w" ? whitePlayer : blackPlayer;
      game.whiteTimer = gameData.whiteTimer;
      game.blackTimer = gameData.blackTimer;
      game.board.load(gameData.currentFen!);

      this.games.push(game);
    }
  }

  addUser(userSocket: WebSocket) {
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
          this.handleInitGame(
            socket,
            message.payload.playerId,
            message.payload.timemode
          );
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
        case EXIT_GAME:
          this.handleExitGame(message.payload.playerId);
          break;
        case CANCEL_INIT:
          this.cancelGameInit(socket, message.payload.timemode);
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    });
  }

  private handleExitGame(playerId: string) {
    const game = this.findExistingGame(playerId);
    if (!game) return;

    game.exitGame(playerId);
  }

  private handleInitGame(
    socket: WebSocket,
    playerId: string,
    timemode: TimeControl
  ) {
    const existingGame = this.findExistingGame(playerId);

    if (existingGame) {
      this.reconnectToExistingGame(socket, playerId, existingGame);
      return;
    }

    const user = new User(socket, playerId);

    const pendingUsersForMode = this.pendingUsers.get(timemode) || [];

    if (pendingUsersForMode.length > 0) {
      const pendingUser = pendingUsersForMode.shift();
      if (pendingUser) {
        const newGame = new Game(pendingUser.user, user, timemode);
        this.games.push(newGame);
      }
    } else {
      if (!this.pendingUsers.has(timemode)) {
        this.pendingUsers.set(timemode, []);
      }
      this.pendingUsers.get(timemode)!.push({ user, timemode });
    }
  }

  private handleMove(
    socket: WebSocket,
    payload: {
      playerId: string;
      move: { from: Square; to: Square; promotion?: string };
    }
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
        JSON.stringify({
          type: SEED_MOVES,
          payload: { curFen: game.board.fen() },
        })
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

  private cancelGameInit(socket: WebSocket, timemode: TimeControl) {
    // console.log("request received");

    if (this.pendingUsers.has(timemode)) {
      this.pendingUsers.get(timemode)!.length = 0;
    }
    socket.send(JSON.stringify({ type: CANCEL_INIT }));
  }
}
