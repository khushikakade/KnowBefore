const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken } = require('../middleware/auth');

// Post new community submission (question suggestion, feedback, story, correction)
router.post('/', optionalToken, (req, res) => {
  const { submission_type, title, content, author_name, author_email } = req.body;

  if (!submission_type || !title || !content) {
    return res.status(400).json({ error: 'Type, title, and content are required.' });
  }

  const userId = req.user ? req.user.id : null;
  const name = req.user ? req.user.full_name : (author_name || 'Anonymous Reader');
  const email = req.user ? req.user.email : (author_email || null);

  try {
    const result = db.prepare(`
      INSERT INTO submissions (user_id, submission_type, title, content, author_name, author_email, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(userId, submission_type, title.trim(), content.trim(), name, email);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Thank you. Your contribution has been submitted to the editorial team.' });
  } catch (err) {
    console.error('Error recording submission:', err);
    res.status(500).json({ error: 'Failed to record contribution.' });
  }
});

module.exports = router;
