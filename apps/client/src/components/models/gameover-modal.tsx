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
        <DialogTitle className="font-bold text-4xl">GAME OVER</DialogTitle>
        <DialogDescription className="font-medium text-md text-white">
          {data?.winningPlayer} is the Winner
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
