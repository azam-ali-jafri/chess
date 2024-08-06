import { WebSocket } from "ws";

export class User {
  userSocket: WebSocket;
  playerId: string;

  constructor(userSocket: WebSocket, playerId: string) {
    this.playerId = playerId;
    this.userSocket = userSocket;
  }
}
