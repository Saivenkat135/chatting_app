// // // from the node modules we import server from socket.io
// // const {Server} = require("socket.io");

// // // here we create a new instance of the server and we pass the port number and the cors configuration
// // const io= new Server(3001 , {
// //     // some configuration for the cors to allow the connection from the frontend
// //     cors:{
// //         origin:'http://localhost:3000'
// //     }
// // });
// // /* here it is an active listener whenever a new connection is established with the server 
// //     when we get new connection the callback function will be called  

// //     and the socket is Whenever a client connects, Socket.IO creates a special object 
// //         representing that specific connection.

// // */

// // io.on("connection",(socket)=>{
// //     console.log("A new user conected with the id: " + socket.id);
// //     socket.emit("hello","this is hi message");


// // });


// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const { Server } = require("socket.io");
// const { randomUUID } = require("crypto");

// const app = express();
// const server = http.createServer(app);

// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:3000"
// }));

// app.use(express.json());

// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// });

// const PORT = process.env.PORT || 3001;

// // Simple health-check endpoint
// app.get("/", (req, res) => {
//   res.json({ message: "Chat WebSocket server is running" });
// });

// /*
//  * AUTHENTICATION
//  *
//  * The frontend sends its Spring Boot JWT in:
//  * socket.handshake.auth.token
//  *
//  * Adapt this claim mapping to your actual JWT structure.
//  */
// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth?.token;

//     if (!token) {
//       return next(new Error("JWT token is missing"));
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET,
//       { algorithms: ["HS384"] }
//     );

//     socket.userId = decoded.sub;
//     next();
//   } catch (error) {
//     console.error("Socket JWT error:", error.message);
//     next(new Error("JWT authentication failed"));
//   }
// });

// // Emit to every connected tab/device belonging to a user.
// function emitToUser(userId, event, data) {
//   io.to(`user:${userId}`).emit(event, data);
// }

// io.on("connection", (socket) => {
//   const userId = socket.userId;

//   // Every user joins their own private room.
//   socket.join(`user:${userId}`);

//   console.log(`User connected: ${userId}`);
//   console.log(`Socket ID: ${socket.id}`);

//   // USER_ONLINE
//   socket.broadcast.emit("USER_ONLINE", {
//     userId,
//     online: true
//   });

//   // SEND_MESSAGE
//   socket.on("SEND_MESSAGE", async (payload, ack) => {
//     try {
//       const {
//         conversationId,
//         receiverId,
//         content
//       } = payload || {};

//       if (
//         !conversationId ||
//         !receiverId ||
//         typeof content !== "string" ||
//         !content.trim()
//       ) {
//         return ack?.({
//           success: false,
//           message: "conversationId, receiverId and content are required"
//         });
//       }

//       // Never trust senderId from the frontend.
//       const message = {
//         messageId: randomUUID(),
//         conversationId,
//         senderId: userId,
//         receiverId: String(receiverId),
//         content: content.trim(),
//         createdAt: new Date().toISOString(),
//         status: "SENT"
//       };

//       /*
//        * LATER:
//        * Call your Spring Boot REST endpoint here to save the
//        * message in MongoDB before delivering it.
//        *
//        * Example:
//        * await saveMessageInSpringBoot(message);
//        */

//       // Deliver to every active connection of the receiver.
//       emitToUser(receiverId, "RECEIVE_MESSAGE", message);

//       // Confirm receipt by the Socket.IO server to the sender.
//       ack?.({
//         success: true,
//         message
//       });

//     } catch (error) {
//       console.error("SEND_MESSAGE error:", error.message);

//       ack?.({
//         success: false,
//         message: "Could not process message"
//       });
//     }
//   });

//   // TYPING
//   socket.on("TYPING", (payload) => {
//     const { conversationId, receiverId } = payload || {};

//     if (!conversationId || !receiverId) return;

//     emitToUser(receiverId, "TYPING", {
//       conversationId,
//       userId,
//       isTyping: true
//     });
//   });

//   // STOP_TYPING
//   socket.on("STOP_TYPING", (payload) => {
//     const { conversationId, receiverId } = payload || {};

//     if (!conversationId || !receiverId) return;

//     emitToUser(receiverId, "STOP_TYPING", {
//       conversationId,
//       userId,
//       isTyping: false
//     });
//   });

//   // MESSAGE_READ
//   socket.on("MESSAGE_READ", (payload) => {
//     const {
//       conversationId,
//       messageId,
//       senderId
//     } = payload || {};

//     if (!conversationId || !messageId || !senderId) return;

//     emitToUser(senderId, "MESSAGE_READ", {
//       conversationId,
//       messageId,
//       readerId: userId,
//       readAt: new Date().toISOString()
//     });

//     /*
//      * LATER:
//      * Persist the read status using your Spring Boot API.
//      */
//   });

//   // DISCONNECT
//   socket.on("disconnect", (reason) => {
//     console.log(`Socket disconnected: ${socket.id}`, reason);

//     // Only announce offline when the user has no remaining tabs.
//     const remainingSockets =
//       io.sockets.adapter.rooms.get(`user:${userId}`);

//     if (!remainingSockets || remainingSockets.size === 0) {
//       io.emit("USER_OFFLINE", {
//         userId,
//         online: false
//       });
//     }
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Socket.IO server running on http://localhost:${PORT}`);
// });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://my-chatt-app.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("REGISTER", (userId) => {
    const id = String(userId).trim();
    users.set(id, socket.id);

    console.log("REGISTERED USER:", id);
    console.log("ALL USERS:", [...users.keys()]);
  });

  socket.on("SEND_MESSAGE", (data) => {
    console.log("SEND_MESSAGE received:", data);

    const receiverSocketId = users.get(
      String(data.receiverId).trim()
    );

    if (!receiverSocketId) {
      console.log("Receiver ID not found:", data.receiverId);
      socket.emit("DELIVERY_ERROR", "Receiver is not registered");
      return;
    }

    io.to(receiverSocketId).emit("RECEIVE_MESSAGE", {
      senderId: data.senderId,
      message: data.message,
    });

    console.log("Message forwarded to:", receiverSocketId);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Socket server running at http://localhost:${PORT}`);
});
