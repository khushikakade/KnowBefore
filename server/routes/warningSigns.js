const express = require('express');
const router = express.Router();
const db = require('../db');

// List all warning signs with associated disease metadata
router.get('/', (req, res) => {
  const { category, stage, red_flag, search } = req.query;

  let query = `
    SELECT ws.*, d.name as disease_name, d.slug as disease_slug, d.category as disease_category
    FROM warning_signs ws
    JOIN diseases d ON ws.disease_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (category && category !== 'All') {
    query += ' AND ws.category = ?';
    params.push(category);
  }

  if (stage && stage !== 'All') {
    query += ' AND ws.stage = ?';
    params.push(stage);
  }

  if (red_flag === 'true' || red_flag === '1') {
    query += ' AND ws.is_red_flag = 1';
  }

  if (search) {
    query += ' AND (ws.sign_name LIKE ? OR ws.description LIKE ? OR ws.biological_mechanism LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY ws.is_red_flag DESC, ws.sign_name ASC';

  try {
    const signs = db.prepare(query).all(...params);
    res.json({ signs });
  } catch (err) {
    console.error('Error fetching warning signs:', err);
    res.status(500).json({ error: 'Failed to retrieve warning signs.' });
  }
});

// Get warning sign categories summary
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(is_red_flag) as red_flags
      FROM warning_signs
      GROUP BY category
      ORDER BY count DESC
    `).all();

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

module.exports = router;
