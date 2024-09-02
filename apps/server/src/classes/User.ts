import { WebSocket } from "ws";

export class User {
  userSocket: WebSocket | null;
  playerId: string;

  constructor(userSocket: WebSocket | null, playerId: string) {
    this.playerId = playerId;
    this.userSocket = userSocket;
  }
}
