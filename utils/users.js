const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: String,
  username: String,
  room: String,
});

const User = mongoose.model('User', userSchema);

async function userJoin(id, username, room) {
  const user = new User({ id, username, room });
  await user.save();
  return user;
}

async function getCurrentUser(id) {
  return User.findOne({ id });
}

async function userLeave(id) {
  return User.findOneAndDelete({ id });
}

async function getRoomUsers(room) {
  return User.find({ room });
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
