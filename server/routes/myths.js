const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get myths
router.get('/', (req, res) => {
  const { category, search } = req.query;

  let query = `
    SELECT m.*, d.name as disease_name, d.slug as disease_slug
    FROM myths m
    LEFT JOIN diseases d ON m.disease_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (category && category !== 'All') {
    query += ' AND m.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (m.myth LIKE ? OR m.fact LIKE ? OR m.explanation LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY m.id ASC';

  try {
    const myths = db.prepare(query).all(...params);
    res.json({ myths });
  } catch (err) {
    console.error('Error fetching myths:', err);
    res.status(500).json({ error: 'Failed to retrieve myths.' });
  }
});

// Admin create myth
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { disease_id, category, myth, fact, explanation, scientific_evidence } = req.body;
  if (!myth || !fact || !explanation) {
    return res.status(400).json({ error: 'Myth, fact, and explanation are required.' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO myths (disease_id, category, myth, fact, explanation, scientific_evidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(disease_id || null, category || 'General', myth, fact, explanation, scientific_evidence || '');

    res.status(201).json({ id: info.lastInsertRowid, message: 'Myth vs Fact entry created.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create myth entry.' });
  }
});

module.exports = router;
