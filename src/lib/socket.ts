import type { Socket } from "socket.io-client";

let socket: Socket | null = null;
let listenerAttached = false;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:3001";

/**
 * Lấy hoặc khởi tạo kết nối Socket.IO với token từ localStorage
 */
export async function getSocket(): Promise<Socket | null> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    const { io } = await import("socket.io-client");
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    attachTokenListener();
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

/**
 * Đóng kết nối Socket.IO (dùng khi logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Reconnect socket với token mới (gọi sau khi axios refresh thành công)
 */
export function reconnectSocket(newToken?: string) {
  if (typeof window === "undefined") return;

  const token = newToken || localStorage.getItem("accessToken");
  if (!token) return;

  if (socket) {
    socket.auth = { token };
    socket.disconnect();
    socket.connect();
  }
}

// Lazy-attach: chỉ đăng ký listener khi socket được tạo lần đầu
function attachTokenListener() {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;
  window.addEventListener("auth:token-refreshed", (event: any) => {
    reconnectSocket(event.detail);
  });
}
