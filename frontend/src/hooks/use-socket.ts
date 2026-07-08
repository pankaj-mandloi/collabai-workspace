"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/config/socket";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>("");

  useEffect(() => {
    const socketInstance = connectSocket();

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id || "");
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      disconnectSocket();
    };
  }, []);

  return { socket, isConnected, socketId };
};