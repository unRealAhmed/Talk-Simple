require('dotenv').config({ path: './config.env' });
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const formatMessages = require('./utils/messages');
const ConnectDB = require('./db');
const { userJoin, userLeave, getCurrentUser, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'ChatCord Bot';

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// RUN WHEN CLIENTS CONNECT
io.on('connection', handleSocketConnection);

function handleSocketConnection(socket) {
  socket.on('joinRoom', async ({ username, room }) => {
    const user = await userJoin(socket.id, username, room);

    socket.join(user.room);
    const users = await getAndUpdateRoomUsers(socket, user.room);

    socket.emit('message', formatMessages(botName, 'Welcome To ChatCord'));
    socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${user.username} has joined the chat`));
  });

  socket.on('chatMessage', async msg => {
    const user = await getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessages(user.username, msg));
  });

  socket.on('disconnect', async () => {
    const user = await userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', formatMessages(botName, `${user.username} has left the chat`));
      getAndUpdateRoomUsers(socket, user.room);
    }
  });
}

async function getAndUpdateRoomUsers(socket, room) {
  const users = await getRoomUsers(room);
  io.to(room).emit('roomUsers', { room, users });
  return users;
}

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}...👍`);
  ConnectDB();
});
