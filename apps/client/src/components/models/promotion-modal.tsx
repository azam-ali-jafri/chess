import { useModal } from "@/store";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const PromotionModal = () => {
  const { isOpen, currentModal, closeModal, data } = useModal();
  const open = isOpen && currentModal == "promotion";
  const playerColor = data?.playerColor == "black" ? "b" : "w";
  const setPromotionPiece = data?.setPromotionPiece;

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
                setPromotionPiece &&
                  setPromotionPiece(piece as "b" | "q" | "r" | "n");
                closeModal();
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
