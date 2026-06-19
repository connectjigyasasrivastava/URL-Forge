const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = []; // in-memory store for demo; production would use a DB table

async function registerUser(username, password, role = 'user') {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, password: hashedPassword, role };
  users.push(user);
  return { id: user.id, username: user.username, role: user.role };
}

async function loginUser(username, password) {
  const user = users.find(u => u.username === username);
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid password');

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return token;
}

module.exports = { registerUser, loginUser, users };
