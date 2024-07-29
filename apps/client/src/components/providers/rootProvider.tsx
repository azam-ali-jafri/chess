import { ReactNode } from "react";
import { ModalProvider } from "./modalProvider";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ModalProvider />
      {children}
    </>
  );
};
