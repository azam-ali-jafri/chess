import { ChessBoard } from "../components/chessboard";
import { Button } from "../components/button";
import { useSocket } from "../hooks/useSocket";
import { GAME_OVER, INIT_GAME, MOVE } from "../constants/messages";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";

export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const moveSound = new Audio("/sounds/move.mp3");
  const [started, setStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<"black" | "white" | null>(
    null
  );

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME: {
          setPlayerColor(message?.color);
          setChess(new Chess());
          setBoard(chess.board());
          setStarted(true);
          break;
        }
        case MOVE: {
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          moveSound.play();
          break;
        }
        case GAME_OVER: {
          console.log("game over");
          break;
        }
      }
    };
  }, [socket, chess]);

  if (!socket) return <>CONNECTING...</>;

  return (
    <div className="grid grid-cols-3 w-full lg:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center">
      <div className="relative w-full col-span-3 lg:col-span-2">
        <div className={`${playerColor === "black" && "rotate-180"}`}>
          <ChessBoard board={board} socket={socket} playerColor={playerColor} />
        </div>
      </div>
      <div className="col-span-3 lg:col-span-1">
        {!started && (
          <Button
            label="Play"
            onClick={() => {
              socket?.send(JSON.stringify({ type: INIT_GAME }));
            }}
          />
        )}
      </div>
    </div>
  );
};
