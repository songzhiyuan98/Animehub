const socketIo = require("socket.io");

let io;

const setupWebSocket = (server) => {
  if (!io) {
    io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected");

      // 用户加入房间（可以是用户ID或动漫ID）
      socket.on("join", (roomId) => {
        socket.join(roomId);
        console.log(`Client joined room: ${roomId}`);
      });

      // 用户离开房间
      socket.on("leave", (roomId) => {
        socket.leave(roomId);
        console.log(`Client left room: ${roomId}`);
      });

      // 断开连接
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    console.log("WebSocket server initialized");
  }

  return io;
};

module.exports = {
  setupWebSocket,
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
