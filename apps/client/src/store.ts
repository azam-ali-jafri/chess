import { create } from "zustand";

type ModalType = null | "login";

interface ModalStore {
  data: unknown;
  currentModal: ModalType;
  isOpen: boolean;
  openModal: (type: ModalType, modalData?: unknown) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  data: null,
  currentModal: null,
  isOpen: false,
  openModal: (type, modalData) =>
    set({ isOpen: true, currentModal: type, data: modalData }),
  closeModal: () => set({ isOpen: false }),
}));
