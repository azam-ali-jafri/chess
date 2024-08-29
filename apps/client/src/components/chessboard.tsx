import { useDrag, useDrop } from "react-dnd";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { memo, useState } from "react";
import { MOVE } from "../constants/messages";
import { useAuth } from "@/context/authContext";
import { isPromotion } from "@/lib/utils";
import { useModal } from "@/store";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

type PlayerColor = "white" | "black" | null;

interface SquarePresentation {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

interface DraggablePieceProps {
  type: PieceSymbol;
  color: Color;
  position: string;
  playerColor: PlayerColor;
}

interface DroppableSquareProps {
  i: number;
  j: number;
  square: SquarePresentation | null;
  handleSquareClick: (
    i: number,
    j: number,
    square: SquarePresentation | null
  ) => void;
  movePiece: (from: Square, to: Square) => void;
  playerColor: PlayerColor;
  isLegalMove: boolean;
  isBeingSelected: boolean;
}

interface ChessBoardProps {
  board: (SquarePresentation | null)[][];
  socket: WebSocket | null;
  playerColor: PlayerColor;
  chess: Chess;
}

const ItemTypes = {
  PIECE: "piece",
};

const DraggablePiece: React.FC<DraggablePieceProps> = ({
  type,
  color,
  position,
  playerColor,
}) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.PIECE,
    item: { type, color, position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={`/pieces/${color}-${type}.png`}
      alt={`${color}-${type}`}
      className={`size-full object-cover ${playerColor == "black" ? "rotate-180" : "rotate-0"}`}
    />
  );
};

const DroppableSquare: React.FC<DroppableSquareProps> = ({
  i,
  j,
  square,
  handleSquareClick,
  movePiece,
  playerColor,
  isLegalMove,
  isBeingSelected,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PIECE,
    drop: (item: { position: string }) =>
      movePiece(item.position as Square, (files[j] + ranks[7 - i]) as Square),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={() => handleSquareClick(i, j, square)}
      className={`size-14 lg:size-14 xl:size-16 relative flex items-center justify-center ${
        (i + j) % 2 === 0 ? "bg-[#E8F1CE]" : "bg-[#739552]"
      } ${isBeingSelected ? ((i + j) % 2 === 0 ? "bg-[#fff35f]" : "bg-[#d3ff4e]") : ""} ${isOver && "border-2 border-gray-400"}`}
    >
      {isLegalMove && (
        <div className={`size-4 inset-0 bg-gray-400 rounded-full`} />
      )}
      {square ? (
        <DraggablePiece
          type={square.type}
          color={square.color}
          position={files[j] + ranks[7 - i]}
          playerColor={playerColor}
        />
      ) : null}
    </div>
  );
};

export const ChessBoard: React.FC<ChessBoardProps> = memo(
  ({ board, socket, playerColor, chess }) => {
    const [from, setFrom] = useState<Square | null>(null);
    const { user } = useAuth();
    const { openModal } = useModal();

    const [legalMoves, setLegalMoves] = useState<string[]>([]);

    const handleSquareClick = (
      i: number,
      j: number,
      square: SquarePresentation | null
    ) => {
      const squareCoords = files[j] + ranks[7 - i]; // Calculate the square coordinates
      if (from) {
        const move: {
          from: Square;
          to: Square;
          promotion?: string | null;
        } = { from, to: squareCoords as Square };
        if (isPromotion(chess, move)) {
          openModal("promotion", {
            playerColor: playerColor!,
            move: move,
          });
        } else {
          socket?.send(
            JSON.stringify({
              type: MOVE,
              payload: { move, playerId: user?.id },
            })
          );
        }

        setLegalMoves([]);
        setFrom(null); // Reset `from` after sending the move
      } else {
        if (square !== null) {
          console.log(chess.moves({ square: square.square }));

          setLegalMoves(chess.moves({ square: square.square }));
          setFrom(square.square); // Set `from` to the clicked square
        } else {
          return;
        }
      }
    };

    const movePiece = (from: Square, to: Square) => {
      const move = { from, to };
      if (isPromotion(chess, move)) {
        openModal("promotion", { playerColor: playerColor!, move });
      } else {
        socket?.send(
          JSON.stringify({ type: MOVE, payload: { move, playerId: user?.id } })
        );
      }
    };

    return (
      <div className="text-white">
        <div className="flex flex-col">
          {board.map((row, i) => (
            <div key={i} className="flex">
              {row.map((square, j) => {
                const squareValue = (files[j] + ranks[7 - i]) as Square;

                return (
                  <DroppableSquare
                    key={j}
                    i={i}
                    j={j}
                    square={square}
                    handleSquareClick={handleSquareClick}
                    movePiece={movePiece}
                    playerColor={playerColor}
                    isLegalMove={
                      !!legalMoves.find((move) => {
                        return move.length == 3
                          ? move.substring(1) == squareValue
                          : move == squareValue;
                      })
                    }
                    isBeingSelected={from == squareValue}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
