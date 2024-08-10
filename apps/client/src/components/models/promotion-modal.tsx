import { useModal } from "@/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { MOVE } from "@/constants/messages";

export const PromotionModal = () => {
  const { isOpen, currentModal, closeModal, data } = useModal();
  const open = isOpen && currentModal == "promotion";
  const playerColor = data?.playerColor == "black" ? "b" : "w";
  const move = data?.move;
  const { user } = useAuth();
  const socket = useSocket();

  if (!open) return null;

  const pieces = ["q", "b", "r", "n"];

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex items-center justify-center h-1/4 bg-[#739552] text-white border-black">
        <div className="flex justify-between items-center">
          {pieces.map((piece) => (
            <img
              key={piece}
              src={`/pieces/${playerColor}-${piece}.png`}
              alt={`${playerColor}`}
              className={`size-20 object-cover cursor-pointer`}
              onClick={() => {
                socket?.send(
                  JSON.stringify({
                    type: MOVE,
                    payload: {
                      move: { ...move, promotion: piece },
                      playerId: user?.id,
                    },
                  })
                );
                closeModal();
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
