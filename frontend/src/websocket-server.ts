import WebSocket from "ws";
import { WebSocketServer } from "ws";

const PORT = 8080;

const wss = new WebSocketServer({
  port: PORT,
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (socket:any) => {
  console.log("Client connected");

  socket.send(
    JSON.stringify({
      type: "system",
      message: "Welcome to the WebSocket server",
    })
  );

  socket.on("message", (data:any) => {
    console.log("Received:", data.toString());
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});