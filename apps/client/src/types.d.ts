import { Square } from "chess.js";

type Move = {
  from: Square;
  to: Square;
  promotion: string;
  piece: string;
  player: "w" | "b";
};
