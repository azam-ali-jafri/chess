/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@prisma/client";
import axiosInstance from "../lib/axiosInstance";
import axios from "axios";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  isUserLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    try {
      const response = await axios.get("/api/user/info");

      console.log(response.data.user);

      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  const login = () => {
    window.location.href = `/api/auth/google`;
  };

  const logout = async () => {
    await axiosInstance.get("/api/logout");
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, isUserLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
