import React, { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext<WebSocket | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(process.env.SOCKET_URL as string);

      ws.onopen = () => {
        setSocket(ws);
        console.log("WebSocket connection opened");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed, retrying in 5 seconds...");
        setSocket(null);
        setTimeout(connect, 5000); // Retry connection after 5 seconds
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect(); // Establish initial connection

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
