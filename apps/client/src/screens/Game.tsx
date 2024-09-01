import { ChessBoard } from "../components/chessboard";
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  OPPONENT_ID,
  SEED_MOVES,
  TIMER_UPDATE,
} from "../constants/messages";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@/context/socketContext";
import { useModal } from "@/store";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import { User } from "@prisma/client";
import { Move } from "@/types";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

export const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const chess = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(chess.board());
  const [opponent, setOpponent] = useState<User | null>(null);
  const [opponentLoading, setOpponentLoading] = useState(true);
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<"black" | "white" | null>(
    null
  );
  const [whiteTimer, setWhiteTimer] = useState<number>(600);
  const [blackTimer, setBlackTimer] = useState<number>(600);

  const moveSound = useMemo(() => new Audio("/sounds/move.mp3"), []);

  const { openModal } = useModal();

  const fetchGameMoves = useCallback(async () => {
    try {
      const res = await axios.get(`/api/get/game/moves/${gameId}`);
      setMoves(res.data.moves);
    } catch (error) {
      console.log(error);
      return alert("something went wrong");
    }
  }, [gameId]);

  const fetchOpponentDetails = async (id: string) => {
    try {
      const res = await axios.get(`/api/user/info/${id}`);
      setOpponent(res.data.user);
      setOpponentLoading(false);
    } catch (error) {
      console.log(error);
      return alert("something went wrong");
    }
  };

  useEffect(() => {
    if (!socket) {
      console.log("Socket is not connected yet");
      return;
    }

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type != TIMER_UPDATE)
        console.log("Received message:", message);

      switch (message.type) {
        case SEED_MOVES: {
          const curFen = message?.payload?.curFen;

          // if (moves) {
          // for (const move of moves) {
          //   chess.move({ from: move.from, to: move.to });
          // }
          chess.load(curFen);
          setBoard(chess.board());
          await fetchGameMoves();
          // setMoves(moves);
          // }

          break;
        }
        case MOVE: {
          const move = message.payload.move;
          console.log("Received move:", move);
          chess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
          setBoard(chess.board());
          moveSound.play();
          setMoves((prev) => [...prev, move]);
          break;
        }
        case TIMER_UPDATE: {
          const { whiteTimer, blackTimer } = message.payload;
          setWhiteTimer(whiteTimer);
          setBlackTimer(blackTimer);
          break;
        }
        case GAME_OVER: {
          const winner: "black" | "white" | "none" = message.payload.winner;
          openModal("game-over", {
            winningPlayer:
              winner == "none"
                ? "none"
                : winner == playerColor
                  ? user?.name
                  : opponent?.name,
          });
          console.log("Game over message received");
          break;
        }
        case OPPONENT_ID: {
          const id = message.payload.opponentId;
          fetchOpponentDetails(id);
          break;
        }
        default: {
          console.log("Unknown message type:", message.type);
        }
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [
    socket,
    chess,
    moveSound,
    openModal,
    playerColor,
    user?.name,
    opponent?.name,
    fetchGameMoves,
  ]);

  useEffect(() => {
    const color = localStorage.getItem("color");
    if (!color || (color !== "black" && color !== "white")) {
      navigate("/", { replace: true });
    } else {
      setPlayerColor(color);
    }

    if (user?.id)
      socket?.send(
        JSON.stringify({ type: INIT_GAME, payload: { playerId: user?.id } })
      );

    socket?.send(JSON.stringify({ type: SEED_MOVES, payload: { gameId } }));

    socket?.send(
      JSON.stringify({
        type: OPPONENT_ID,
        payload: { gameId: gameId, playerId: user?.id },
      })
    );
  }, [gameId, navigate, socket, user?.id]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="grid grid-cols-4 w-full lg:w-11/12 xl:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center mt-4">
      <div className="relative w-full px-2 md:px-0 col-span-4 lg:col-span-2 justify-center flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <img
            src={opponent?.displayPicture as string}
            alt="opponent-image"
            className="size-8 object-cover"
          />
          <span className="text-sm text-white">
            {opponentLoading ? "Loading" : opponent?.name}
          </span>
          <span className="text-white font-bold">
            {playerColor == "white"
              ? formatTime(blackTimer)
              : formatTime(whiteTimer)}
          </span>
        </div>
        <div
          className={`${playerColor === "black" && "rotate-180 self-start"}`}
        >
          <ChessBoard
            board={board}
            socket={socket}
            playerColor={playerColor}
            chess={chess}
          />
        </div>
        <div className="flex gap-4 items-center">
          <img
            src={user?.displayPicture as string}
            alt="user-image"
            className="size-8 object-cover"
          />
          <span className="text-sm text-white"> {user?.name}</span>
          <span className="text-white font-bold">
            {playerColor === "white"
              ? formatTime(whiteTimer)
              : formatTime(blackTimer)}
          </span>
        </div>
      </div>
      <div className="col-span-4 px-2 md:px-0 lg:col-span-2 h-full lg:max-h-[calc(100vh-20rem)] xl:max-h-[calc(100vh-15rem)] bg-[#28282B]">
        <div className="m-4">
          <Button
            variant={"secondary"}
            size={"lg"}
            className="flex items-center gap-x-2"
            onClick={() => openModal("confirm-modal")}
          >
            <span className="text-lg font-medium">Abort</span>

            <Flag className="size-4" />
          </Button>
        </div>
        {moves.length > 0 ? (
          <div className="flex flex-col gap-3 p-4 lg:max-h-[calc(100vh-25rem)] xl:max-h-[calc(100vh-20rem)] w-1/2 overflow-y-auto">
            {moves
              .reduce((acc: Move[][], move, index) => {
                if (index % 2 === 0) {
                  acc.push([move]);
                } else {
                  acc[acc.length - 1].push(move);
                }
                return acc;
              }, [])
              .map((pair, index) => (
                <div
                  key={index}
                  className="flex items-end text-sm font-semibold text-white"
                >
                  <span className="w-6 text-right leading-4">{index + 1}.</span>
                  <div className="flex justify-between w-full ml-4">
                    <div className="flex items-end gap-x-2">
                      <img
                        src={`/pieces/${pair[0].player}-${pair[0].piece}.png`}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="leading-4">{pair[0].to}</span>
                    </div>
                    {pair[1] && (
                      <div className="flex items-center gap-x-2">
                        <img
                          src={`/pieces/${pair[1].player}-${pair[1].piece}.png`}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="leading-4">{pair[1].to}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-white h-full w-full flex justify-center font-semibold">
            No moves have been played yet
          </div>
        )}
      </div>
    </div>
  );
};
