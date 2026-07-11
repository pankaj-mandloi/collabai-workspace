"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth, useUser } from "@clerk/nextjs";
import { env } from "@/config/env";

// ============================================
// TYPES
// ============================================

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  joinWorkspace: (workspaceId: string) => Promise<string[]>;
  leaveWorkspace: (workspaceId: string) => void;
  reconnect: () => void;
}

// ============================================
// CONTEXT
// ============================================

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track workspaces user has joined (for reconnection)
  const joinedWorkspacesRef = useRef<Set<string>>(new Set());

  /**
   * Initialize socket connection with fresh Clerk token
   */
  const initializeSocket = useCallback(async () => {
    if (!isSignedIn) {
      console.log("⚠️ User not signed in, skipping socket connection");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Get fresh token from Clerk
      const token = await getToken();

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      console.log("🔌 Connecting to socket server...");

      // Create socket connection
      const newSocket = io(env.SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Connection successful
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);

        // Re-join workspaces after reconnection
        joinedWorkspacesRef.current.forEach((workspaceId) => {
          newSocket.emit("workspace:join", { workspaceId });
        });
      });

      // Disconnection
      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      // Connection error (usually token expired)
      newSocket.on("connect_error", async (err) => {
        console.error("❌ Socket connection error:", err.message);
        setError(err.message);
        setIsConnecting(false);

        // If auth error, get fresh token and reconnect
        if (
          err.message.includes("Authentication") ||
          err.message.includes("expired") ||
          err.message.includes("token")
        ) {
          console.log("🔄 Auth error - refreshing token...");
          try {
            const freshToken = await getToken({ skipCache: true });
            if (freshToken && socketRef.current) {
              socketRef.current.auth = { token: freshToken };
              socketRef.current.connect();
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
          }
        }
      });

      // Reconnection attempts
      newSocket.io.on("reconnect_attempt", (attempt) => {
        console.log(`🔄 Reconnection attempt ${attempt}...`);
        setIsConnecting(true);
      });

      newSocket.io.on("reconnect", async (attempt) => {
        console.log(`✅ Reconnected after ${attempt} attempts`);

        // Get fresh token on reconnect
        try {
          const freshToken = await getToken({ skipCache: true });
          if (freshToken && newSocket) {
            newSocket.auth = { token: freshToken };
          }
        } catch (err) {
          console.error("❌ Token refresh on reconnect failed:", err);
        }
      });

      // Server errors
      newSocket.on("error", (err) => {
        console.error("❌ Server error:", err);
        setError(err.message || "Server error");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err: any) {
      console.error("❌ Socket initialization error:", err.message);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [isSignedIn, getToken]);

  /**
   * Join workspace room
   */
  const joinWorkspace = useCallback(
    async (workspaceId: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current || !isConnected) {
          reject(new Error("Socket not connected"));
          return;
        }

        socketRef.current.emit(
          "workspace:join",
          { workspaceId },
          (response: {
            success: boolean;
            onlineUsers?: string[];
            error?: string;
          }) => {
            if (response.success) {
              joinedWorkspacesRef.current.add(workspaceId);
              console.log(`✅ Joined workspace: ${workspaceId}`);
              resolve(response.onlineUsers || []);
            } else {
              console.error(`❌ Failed to join workspace: ${response.error}`);
              reject(new Error(response.error || "Failed to join workspace"));
            }
          }
        );
      });
    },
    [isConnected]
  );

  /**
   * Leave workspace room
   */
  const leaveWorkspace = useCallback((workspaceId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("workspace:leave", { workspaceId });
    joinedWorkspacesRef.current.delete(workspaceId);
    console.log(`👋 Left workspace: ${workspaceId}`);
  }, []);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    initializeSocket();
  }, [initializeSocket]);

  // Initialize socket when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn && !socketRef.current) {
      initializeSocket();
    }

    // Cleanup on unmount or sign out
    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isLoaded, isSignedIn, initializeSocket]);

  // Refresh token every 45 seconds (before 60s expiry)
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const interval = setInterval(async () => {
      try {
        const freshToken = await getToken({ skipCache: true });
        if (freshToken && socketRef.current) {
          socketRef.current.auth = { token: freshToken };
        }
      } catch (err) {
        console.error("❌ Token refresh interval error:", err);
      }
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [isConnected, getToken]);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    error,
    joinWorkspace,
    leaveWorkspace,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to access socket in any component
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}