import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",  // для теста можно оставить *
    methods: ["GET", "POST"]
  }
});

// Список онлайн пользователей
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("New user connected: " + socket.id);

  socket.on("join", ({ username }) => {
    onlineUsers.push({ id: socket.id, username });
    io.emit("online", onlineUsers.map(u => u.username));
  });

  socket.on("private_message", (msg) => {
    console.log("Message received:", msg);
    // Рассылаем всем (кроме отправителя)
    socket.broadcast.emit("private_message", msg);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", "Someone");
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    io.emit("online", onlineUsers.map(u => u.username));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server running on", PORT));
