import { useModal } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const LoginModal = () => {
  const { isOpen, currentModal, closeModal } = useModal();
  const open = isOpen && currentModal == "login";

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex items-center justify-center h-1/4 bg-[#739552] text-white border-black">
        <DialogTitle>Don't you think you need to login first?</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};
