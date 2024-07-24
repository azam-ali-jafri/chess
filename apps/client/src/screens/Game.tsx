import { ChessBoard } from "../components/chessboard";
// import { useSocket } from "../hooks/useSocket";
import { GAME_OVER, MOVE } from "../constants/messages";
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/context/authContext";
// import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketContext";

export const Game = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  // const { user } = useAuth();
  const chess = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(chess.board());
  const moveSound = useMemo(() => new Audio("/sounds/move.mp3"), []);
  const [playerColor, setPlayerColor] = useState<"black" | "white" | null>(
    null
  );
  // const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!socket) {
      console.log("Socket is not connected yet");
      return;
    }

    console.log("Socket:", socket);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case MOVE: {
          const move = message.payload;
          console.log("Received move:", move);
          chess.move(move);
          setBoard(chess.board());
          moveSound.play();
          break;
        }
        case GAME_OVER: {
          console.log("Game over message received");
          break;
        }
        default: {
          console.log("Unknown message type:", message.type);
        }
      }
    };
  }, [socket, chess, moveSound]);

  useEffect(() => {
    const color = localStorage.getItem("color");
    if (!color || (color !== "black" && color !== "white")) {
      navigate("/", { replace: true });
    } else {
      setPlayerColor(color);
    }
  }, [navigate]);

  if (!socket) return <>CONNECTING...</>;

  return (
    <div className="grid grid-cols-4 w-full lg:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center">
      <div className="relative w-full col-span-3 lg:col-span-2 justify-center flex">
        <div className={`${playerColor === "black" && "rotate-180"}`}>
          <ChessBoard board={board} socket={socket} playerColor={playerColor} />
        </div>
      </div>
      <div className="col-span-3 lg:col-span-2 h-full bg-[#28282B]">
        {/* {!gameStarted && (
          <Button
            onClick={() => {
              socket?.send(
                JSON.stringify({ type: INIT_GAME, playerId: user?.id })
              );
            }}
          >
            Play
          </Button>
        )} */}
      </div>
    </div>
  );
};
