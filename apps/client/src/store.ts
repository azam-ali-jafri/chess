import { Square } from "chess.js";
import { create } from "zustand";

type ModalType = null | "login" | "game-over" | "promotion" | "confirm-modal";

type PlayerColor = "black" | "white";

interface ModalData {
  winningPlayer?: string | null;
  playerColor?: PlayerColor;
  move?: { from: Square; to: Square; promotion?: string | null };
}

interface ModalStore {
  data: ModalData | null;
  currentModal: ModalType;
  isOpen: boolean;
  openModal: (type: ModalType, modalData?: ModalData) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  data: {},
  currentModal: null,
  isOpen: false,
  openModal: (type, modalData) =>
    set({ isOpen: true, currentModal: type, data: modalData }),
  closeModal: () => set({ isOpen: false }),
}));
