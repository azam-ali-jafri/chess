import { Chess, Square } from "chess.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPromotion(chess: Chess, move: { from: Square; to: Square }) {
  const piece = chess.get(move.from);
  const isPromotion =
    piece.type === "p" &&
    ((piece.color === "w" && move.to[1] === "8") ||
      (piece.color === "b" && move.to[1] === "1"));

  return isPromotion;
}
