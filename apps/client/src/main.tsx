import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/authContext.tsx";
import { SocketProvider } from "./context/socketContext.tsx";
import { RootProvider } from "./components/providers/rootProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketProvider>
      <AuthProvider>
        <RootProvider>
          <App />
        </RootProvider>
      </AuthProvider>
    </SocketProvider>
  </React.StrictMode>
);
