import { create } from "zustand";

type ModalType = null | "login" | "game-over";

interface ModalData {
  winningPlayer: "black" | "white" | null;
}

interface ModalStore {
  data: ModalData;
  currentModal: ModalType;
  isOpen: boolean;
  openModal: (type: ModalType, modalData?: ModalData) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  data: { winningPlayer: null },
  currentModal: null,
  isOpen: false,
  openModal: (type, modalData) =>
    set({ isOpen: true, currentModal: type, data: modalData }),
  closeModal: () => set({ isOpen: false }),
}));
