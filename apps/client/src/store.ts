import { create } from "zustand";

type ModalType = null | "login" | "game-over" | "promotion";

type playerColor = "black" | "white";

interface ModalData {
  winningPlayer?: playerColor;
  playerColor?: playerColor;
  setPromotionPiece?: React.Dispatch<
    React.SetStateAction<"b" | "q" | "r" | "n">
  >;
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
