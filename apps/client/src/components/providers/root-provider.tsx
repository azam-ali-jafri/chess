import { ReactNode } from "react";
import { ModalProvider } from "./modal-provider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SocketProvider } from "@/context/socketContext";
import { AuthProvider } from "@/context/authContext";

export const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <SocketProvider>
          <AuthProvider>
            <ModalProvider />
            {children}
          </AuthProvider>
        </SocketProvider>
      </DndProvider>
    </>
  );
};
