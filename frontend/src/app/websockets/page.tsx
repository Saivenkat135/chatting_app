"use client";

import { useEffect } from "react";

export default function WebSockets() {

  useEffect(() => {

    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };

  }, []);

  return (
    <div>
      <h1>This is WebSockets page</h1>
    </div>
  );
}