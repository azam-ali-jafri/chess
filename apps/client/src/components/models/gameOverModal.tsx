import { useModal } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export const GameOverModal = () => {
  const { isOpen, currentModal, closeModal, data } = useModal();
  const open = isOpen && currentModal == "game-over";

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex flex-col items-center justify-center h-1/4 bg-[#739552] text-white border-black">
        <DialogTitle className="font-extrabold text-4xl tracking-wide">
          Game Over
        </DialogTitle>
        <DialogDescription className="font-semibold text-xl text-white">
          {data?.winningPlayer?.toUpperCase()} is the Winner
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
