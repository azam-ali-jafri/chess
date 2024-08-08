import { GameOverModal } from "../models/gameover-modal";
import { LoginModal } from "../models/login-modal";
import { PromotionModal } from "../models/promotion-modal";

export const ModalProvider = () => {
  return (
    <>
      <LoginModal />
      <GameOverModal />
      <PromotionModal />
    </>
  );
};
