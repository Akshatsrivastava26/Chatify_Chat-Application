// socket/index.js

const { Server } = require("socket.io");
const registerHandlers = require("./handlers");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://chatify-zpp2.onrender.com",
        "https://chatify-chat-application.vercel.app ", 
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("⚡ Socket.io initialized successfully!");

  io.on("connection", (socket) => {
    console.log(`🟢 New socket connection: ${socket.id}`);
    registerHandlers(io, socket);
  });

  return io;
};

module.exports = { initSocket };
