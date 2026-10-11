
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  text: string;
  sender: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("room-join", "javascript");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("receive-message", (data: { text: string }) => {
      setMessages((previous) => [
        ...previous,
        { text: data.text, sender: "Other user" },
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  function sendMessage() {
    const text = message.trim();

    if (!text || !socket?.connected) return;

    socket.emit("send-room-message", {
      text,
      room: "javascript",
    });

    // Display your own message because the server
    // sends room messages to everyone except the sender.
    setMessages((previous) => [
      ...previous,
      { text, sender: "You" },
    ]);

    setMessage("");
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Socket.IO Chat</h2>

      <p>
        Status: {connected ? "Connected" : "Disconnected"}
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          minHeight: 250,
          padding: 12,
          marginBottom: 15,
          borderRadius: 8,
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}: </strong>
            {msg.text}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") sendMessage();
        }}
        placeholder="Enter your message"
        style={{ padding: 10, width: "70%" }}
      />

      <button
        onClick={sendMessage}
        disabled={!connected}
        style={{ padding: 10, marginLeft: 8 }}
      >
        Send
      </button>
    </div>
  );
}
