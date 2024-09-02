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
  private games: Game[] = [];
  private pendingUsers: Map<TimeControl, PendingUser[]> = new Map();
  private users: User[] = [];

  constructor() {
    this.loadActiveGames().catch((error) =>
      console.error("Failed to load active games:", error)
    );
  }

  private async loadActiveGames() {
    try {
      const activeGames = await db.game.findMany({
        where: { status: "IN_PROGRESS" },
        include: { moves: true },
      });

      for (const gameData of activeGames) {
        const whitePlayer = new User(null, gameData.whitePlayerId);
        const blackPlayer = new User(null, gameData.blackPlayerId);

        const game = new Game(
          whitePlayer,
          blackPlayer,
          gameData.timeControl,
          false
        );
        game.id = gameData.id;
        game.status = gameData.status;
        game.currentPlayer =
          gameData.currentTurn === "w" ? whitePlayer : blackPlayer;
        game.whiteTimer = gameData.whiteTimer;
        game.blackTimer = gameData.blackTimer;
        game.board.load(gameData.currentFen!);

        this.games.push(game);
      }
    } catch (error) {
      console.error("Error loading active games:", error);
    }
  }

  addUser(userSocket: WebSocket) {
    this.addHandler(userSocket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.userSocket !== socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      try {
        switch (message.type) {
          case INIT_GAME:
            await this.handleInitGame(
              socket,
              message.payload.playerId,
              message.payload.timemode
            );
            break;
          case MOVE:
            await this.handleMove(socket, message.payload);
            break;
          case SEED_MOVES:
            await this.handleSeedMoves(socket, message.payload.gameId);
            break;
          case OPPONENT_ID:
            await this.handleOpponentId(socket, message.payload);
            break;
          case EXIT_GAME:
            await this.handleExitGame(message.payload.playerId);
            break;
          case CANCEL_INIT:
            await this.cancelGameInit(socket, message.payload.timemode);
            break;
          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });
  }

  private async handleExitGame(playerId: string) {
    const game = this.findExistingGame(playerId);
    if (game) {
      game.exitGame(playerId);
    }
  }

  private async handleInitGame(
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
        const newGame = new Game(pendingUser.user, user, timemode, true);
        this.games.push(newGame);
      }
    } else {
      if (!this.pendingUsers.has(timemode)) {
        this.pendingUsers.set(timemode, []);
      }
      this.pendingUsers.get(timemode)!.push({ user, timemode });
    }
  }

  private async handleMove(
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

  private async handleSeedMoves(socket: WebSocket, gameId: string) {
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

  private async handleOpponentId(
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

  private async cancelGameInit(socket: WebSocket, timemode: TimeControl) {
    if (this.pendingUsers.has(timemode)) {
      this.pendingUsers.set(timemode, []);
    }
    socket.send(JSON.stringify({ type: CANCEL_INIT }));
  }
}
