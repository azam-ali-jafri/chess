import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../constants/messages";
import { useAuth } from "@/context/authContext";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

interface SquarePresentation {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export const ChessBoard = ({
  board,
  socket,
  playerColor,
}: {
  board: (SquarePresentation | null)[][];
  socket: WebSocket;
  playerColor: "black" | "white" | null;
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const { user } = useAuth();

  const handleSquareClick = (
    i: number,
    j: number,
    square: SquarePresentation | null
  ) => {
    const squareCoords = files[j] + ranks[7 - i]; // Calculate the square coordinates

    if (from) {
      const move = { from, to: squareCoords };
      socket.send(JSON.stringify({ type: MOVE, move, playerId: user?.id }));
      setFrom(null); // Reset `from` after sending the move
    } else {
      if (square !== null) {
        setFrom(square.square); // Set `from` to the clicked square
      } else {
        return;
      }
    }
  };

  const getImageSrc = (type: PieceSymbol, color: Color) => {
    return `/pieces/${color}-${type}.png`;
  };

  return (
    <div className="text-white">
      <div className="flex flex-col">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((square, j) => (
              <div
                key={j}
                onClick={() => handleSquareClick(i, j, square)}
                className={`size-16 relative flex items-center justify-center ${
                  (i + j) % 2 === 0 ? "bg-[#E8F1CE]" : "bg-[#739552]"
                }`}
              >
                {/* <div
                  className={`absolute text-xs font-medium ${
                    i === 7 && "bottom-1 right-1"
                  } ${j === 0 && "top-1 left-1"} ${
                    (i + j) % 2 !== 0 ? "text-[#E8F1CE]" : "text-[#739552]"
                  }`}
                >
                  {i === 7 && files[j]}
                  {j === 0 && ranks[7 - i]}
                </div> */}
                {square ? (
                  <img
                    src={getImageSrc(square.type, square.color)}
                    alt={`${square.color}-${square.type}`}
                    className={`size-full object-cover ${
                      playerColor === "black" && "rotate-180"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
