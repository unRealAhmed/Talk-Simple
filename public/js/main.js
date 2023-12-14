const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const socket = io();
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit('joinRoom', { username, room });

socket.on('message', handleIncomingMessage);
socket.on('roomUsers', updateRoomUsersList);
chatForm.addEventListener('submit', handleChatFormSubmission);

function handleIncomingMessage(message) {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateRoomUsersList({ users }) {
  displayUserList(users);
}

function handleChatFormSubmission(e) {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
}

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  chatMessages.appendChild(div);
}

function displayUserList(users) {
  userList.innerHTML = '';
  users.forEach(user => {
    const listItem = document.createElement('li');
    listItem.textContent = user.username;
    userList.appendChild(listItem);
  });
}
