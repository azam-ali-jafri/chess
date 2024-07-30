import { GameOverModal } from "../models/gameOverModal";
import { LoginModal } from "../models/loginModal";

export const ModalProvider = () => {
  return (
    <>
      <LoginModal />
      <GameOverModal />
    </>
  );
};
