import { useModal } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const GameOverModal = () => {
  const { isOpen, currentModal, closeModal, data } = useModal();
  const open = isOpen && currentModal == "game-over";
  const navigate = useNavigate();

  const modalText =
    data?.winningPlayer == "none"
      ? "Its a stalemate"
      : `${data?.winningPlayer} is the Winner`;

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex flex-col items-center justify-center h-1/4 bg-[#739552] text-white border-black">
        <DialogTitle className="font-bold text-4xl">GAME OVER</DialogTitle>
        <DialogDescription className="font-medium text-md text-white">
          {modalText}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant={"secondary"}
            onClick={() => {
              navigate("/", { replace: true });
              closeModal();
            }}
          >
            Return to Home
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
