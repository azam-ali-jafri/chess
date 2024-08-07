import { useDrag, useDrop } from "react-dnd";
import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../constants/messages";
import { useAuth } from "@/context/authContext";

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
  movePiece: (from: string, to: string) => void;
  playerColor: PlayerColor;
}

interface ChessBoardProps {
  board: (SquarePresentation | null)[][];
  socket: WebSocket | null;
  playerColor: PlayerColor;
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
      className={`size-full object-cover ${playerColor == "black" && "rotate-180"}`}
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
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PIECE,
    drop: (item: { position: string }) =>
      movePiece(item.position, files[j] + ranks[7 - i]),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={() => handleSquareClick(i, j, square)}
      className={`size-16 relative flex items-center justify-center ${
        (i + j) % 2 === 0 ? "bg-[#E8F1CE]" : "bg-[#739552]"
      } ${isOver ? ((i + j) % 2 === 0 ? "bg-[#c0d67d]" : "bg-[#91c162]") : ""}`}
    >
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

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  socket,
  playerColor,
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
      socket?.send(
        JSON.stringify({ type: MOVE, payload: { move, playerId: user?.id } })
      );
      setFrom(null); // Reset `from` after sending the move
    } else {
      if (square !== null) {
        setFrom(square.square); // Set `from` to the clicked square
      } else {
        return;
      }
    }
  };

  const movePiece = (from: string, to: string) => {
    const move = { from, to };
    socket?.send(
      JSON.stringify({ type: MOVE, payload: { move, playerId: user?.id } })
    );
  };

  return (
    <div className="text-white">
      <div className="flex flex-col">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((square, j) => (
              <DroppableSquare
                key={j}
                i={i}
                j={j}
                square={square}
                handleSquareClick={handleSquareClick}
                movePiece={movePiece}
                playerColor={playerColor}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
