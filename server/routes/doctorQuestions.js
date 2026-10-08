const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get user's doctor discussion questions
router.get('/', authenticateToken, (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT udq.*, d.name as disease_name, d.slug as disease_slug
      FROM user_doctor_questions udq
      LEFT JOIN diseases d ON udq.disease_id = d.id
      WHERE udq.user_id = ?
      ORDER BY 
        udq.is_discussed ASC,
        CASE udq.priority WHEN 'high' THEN 1 ELSE 2 END,
        udq.created_at DESC
    `).all(req.user.id);

    // Also fetch available question templates grouped by disease
    const templates = db.prepare(`
      SELECT dqt.*, d.name as disease_name, d.slug as disease_slug
      FROM doctor_question_templates dqt
      JOIN diseases d ON dqt.disease_id = d.id
      ORDER BY d.name ASC
    `).all();

    res.json({ questions, templates });
  } catch (err) {
    console.error('Error fetching doctor questions:', err);
    res.status(500).json({ error: 'Failed to retrieve doctor discussion list.' });
  }
});

// Add new question
router.post('/', authenticateToken, (req, res) => {
  const { disease_id, question, rationale, priority } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question text is required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO user_doctor_questions (user_id, disease_id, question, rationale, priority, is_discussed)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(req.user.id, disease_id || null, question.trim(), rationale || null, priority || 'routine');

    const created = db.prepare(`
      SELECT udq.*, d.name as disease_name, d.slug as disease_slug
      FROM user_doctor_questions udq
      LEFT JOIN diseases d ON udq.disease_id = d.id
      WHERE udq.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ question: created });
  } catch (err) {
    console.error('Error adding doctor question:', err);
    res.status(500).json({ error: 'Failed to save question.' });
  }
});

// Update question (priority, text, is_discussed, doctor_notes)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { question, rationale, priority, is_discussed, doctor_notes } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM user_doctor_questions WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found or unauthorized.' });
    }

    db.prepare(`
      UPDATE user_doctor_questions SET
        question = COALESCE(?, question),
        rationale = COALESCE(?, rationale),
        priority = COALESCE(?, priority),
        is_discussed = COALESCE(?, is_discussed),
        doctor_notes = COALESCE(?, doctor_notes)
      WHERE id = ?
    `).run(question, rationale, priority, is_discussed !== undefined ? (is_discussed ? 1 : 0) : null, doctor_notes, id);

    const updated = db.prepare(`
      SELECT udq.*, d.name as disease_name, d.slug as disease_slug
      FROM user_doctor_questions udq
      LEFT JOIN diseases d ON udq.disease_id = d.id
      WHERE udq.id = ?
    `).get(id);

    res.json({ question: updated });
  } catch (err) {
    console.error('Error updating doctor question:', err);
    res.status(500).json({ error: 'Failed to update question.' });
  }
});

// Delete question
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT id FROM user_doctor_questions WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    db.prepare('DELETE FROM user_doctor_questions WHERE id = ?').run(id);
    res.json({ message: 'Question removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question.' });
  }
});

module.exports = router;
