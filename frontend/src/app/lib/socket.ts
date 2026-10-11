
import { io, Socket } from "socket.io-client";

export function connectSocket(
  token: string,
  userId: string
): Socket {
  return io(
    process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:3001",
    {
      path: "/ws",
      auth: {
        token,
        userId,
      },
      transports: ["websocket"],
      autoConnect: true,
    }
  );
}
