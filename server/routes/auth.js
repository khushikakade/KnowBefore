const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const colors = ['#2A5C43', '#C85A32', '#2E5077', '#7D5A50', '#4A6B82'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const info = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role, avatar_color)
      VALUES (?, ?, ?, 'user', ?)
    `).run(email.toLowerCase().trim(), hash, full_name.trim(), avatarColor);

    const user = {
      id: info.lastInsertRowid,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      role: 'user',
      avatar_color: avatarColor
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const safeUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    avatar_color: user.avatar_color,
    bio: user.bio
  };

  res.json({ token, user: safeUser });
});

// Current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
