
const connectDB = require("./config/db");
const express = require("express");
const cors = require('cors');

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("update_online_users", Array.from(onlineUsers.keys()));
    console.log("Online Users:", Array.from(onlineUsers.keys()));
  });

  socket.on("join_channel", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined channel: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.channelId).emit("receive_message", data);
  });

  socket.on("delete_message", (data) => {
    io.to(data.channelId).emit("message_deleted", data.messageId);
  });

  socket.on("channel_created", (channelData) => {
    socket.broadcast.emit("channel_added", channelData);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    let disconnectedUserId;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    }
  });
});

app.get("/", (req, res) => { res.send("API is running...") });
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/channels", require("./routes/channel"));

server.listen(process.env.PORT || 5000, () => {
  console.log("Server is running")
})
