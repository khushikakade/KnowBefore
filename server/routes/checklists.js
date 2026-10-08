const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken, authenticateToken } = require('../middleware/auth');

// Get checklist items for a disease
router.get('/:diseaseSlug', optionalToken, (req, res) => {
  const { diseaseSlug } = req.params;

  try {
    const disease = db.prepare('SELECT id, name, slug, category FROM diseases WHERE slug = ?').get(diseaseSlug);
    if (!disease) {
      return res.status(404).json({ error: 'Disease not found.' });
    }

    const rawPillars = db.prepare(`
      SELECT * FROM prevention_pillars WHERE disease_id = ?
      ORDER BY 
      CASE pillar
        WHEN 'KNOW' THEN 1
        WHEN 'WATCH' THEN 2
        WHEN 'PREVENT' THEN 3
        WHEN 'PREPARE' THEN 4
        WHEN 'ACT' THEN 5
        ELSE 6
      END
    `).all(disease.id);

    let completedSet = new Set();
    if (req.user) {
      const completedRows = db.prepare(`
        SELECT prevention_pillar_id FROM user_checklist_progress
        WHERE user_id = ? AND disease_id = ?
      `).all(req.user.id, disease.id);
      completedSet = new Set(completedRows.map(r => r.prevention_pillar_id));
    }

    const pillars = rawPillars.map(p => ({
      ...p,
      actionable_steps: JSON.parse(p.actionable_steps || '[]'),
      is_completed: completedSet.has(p.id)
    }));

    res.json({
      disease,
      pillars,
      totalPillars: pillars.length,
      completedCount: pillars.filter(p => p.is_completed).length
    });
  } catch (err) {
    console.error('Error fetching checklist:', err);
    res.status(500).json({ error: 'Failed to retrieve checklist.' });
  }
});

// Toggle checklist completion
router.post('/toggle', authenticateToken, (req, res) => {
  const { pillar_id, disease_id } = req.body;

  if (!pillar_id || !disease_id) {
    return res.status(400).json({ error: 'Pillar ID and Disease ID are required.' });
  }

  try {
    const existing = db.prepare(`
      SELECT id FROM user_checklist_progress
      WHERE user_id = ? AND prevention_pillar_id = ?
    `).get(req.user.id, pillar_id);

    if (existing) {
      db.prepare('DELETE FROM user_checklist_progress WHERE id = ?').run(existing.id);
      res.json({ completed: false, message: 'Step unmarked.' });
    } else {
      const pillar = db.prepare('SELECT pillar FROM prevention_pillars WHERE id = ?').get(pillar_id);
      db.prepare(`
        INSERT INTO user_checklist_progress (user_id, prevention_pillar_id, pillar, disease_id, completed)
        VALUES (?, ?, ?, ?, 1)
      `).run(req.user.id, pillar_id, pillar ? pillar.pillar : 'PREVENT', disease_id);
      res.json({ completed: true, message: 'Step completed and recorded.' });
    }
  } catch (err) {
    console.error('Error toggling checklist:', err);
    res.status(500).json({ error: 'Failed to update checklist progress.' });
  }
});

// Get all user checklist progress across all diseases
router.get('/user/all', authenticateToken, (req, res) => {
  try {
    const progress = db.prepare(`
      SELECT ucp.*, d.name as disease_name, d.slug as disease_slug, pp.title as pillar_title
      FROM user_checklist_progress ucp
      JOIN diseases d ON ucp.disease_id = d.id
      JOIN prevention_pillars pp ON ucp.prevention_pillar_id = pp.id
      WHERE ucp.user_id = ?
      ORDER BY ucp.completed_at DESC
    `).all(req.user.id);

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch overall checklist progress.' });
  }
});

module.exports = router;
