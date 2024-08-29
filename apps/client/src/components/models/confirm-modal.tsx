import { useModal } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { EXIT_GAME } from "@/constants/messages";

export const ConfirmModal = () => {
  const { isOpen, currentModal, closeModal } = useModal();
  const open = isOpen && currentModal == "confirm-modal";
  const { user } = useAuth();
  const socket = useSocket();

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex flex-col items-center justify-center h-1/4 bg-[#739552] text-white border-black">
        <DialogTitle />
        <span className="font-bold text-lg">
          Are you sure you wanna do this?
        </span>
        <div className="flex justify-evenly w-full">
          <Button
            variant={"destructive"}
            onClick={() => {
              socket?.send(
                JSON.stringify({
                  type: EXIT_GAME,
                  payload: { playerId: user?.id },
                })
              );
              closeModal();
            }}
          >
            Confirm
          </Button>
          <Button variant={"secondary"} onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
