const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken, authenticateToken, requireAdmin } = require('../middleware/auth');

// List diseases with filtering & search
router.get('/', optionalToken, (req, res) => {
  const { category, search, featured } = req.query;

  let query = 'SELECT * FROM diseases WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }

  if (search) {
    query += ' AND (name LIKE ? OR overview LIKE ? OR headline LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (featured === 'true' || featured === '1') {
    query += ' AND is_featured = 1';
  }

  query += ' ORDER BY is_featured DESC, name ASC';

  try {
    const diseases = db.prepare(query).all(...params);

    // If user is authenticated, attach is_saved status
    if (req.user) {
      const savedIds = new Set(
        db.prepare('SELECT disease_id FROM user_saved_diseases WHERE user_id = ?').all(req.user.id).map(r => r.disease_id)
      );
      diseases.forEach(d => {
        d.is_saved = savedIds.has(d.id);
      });
    }

    res.json({ diseases });
  } catch (err) {
    console.error('Error fetching diseases:', err);
    res.status(500).json({ error: 'Failed to retrieve diseases.' });
  }
});

// Get single disease by slug with complete connected clinical & educational modules
router.get('/:slug', optionalToken, (req, res) => {
  const { slug } = req.params;

  try {
    const disease = db.prepare('SELECT * FROM diseases WHERE slug = ?').get(slug);
    if (!disease) {
      return res.status(404).json({ error: 'Disease information not found.' });
    }

    // Warning signs
    const warningSigns = db.prepare(`
      SELECT * FROM warning_signs WHERE disease_id = ? ORDER BY is_red_flag DESC, stage ASC
    `).all(disease.id);

    // Risk factors
    const riskFactors = db.prepare(`
      SELECT * FROM risk_factors WHERE disease_id = ? ORDER BY factor_type ASC, impact_level ASC
    `).all(disease.id);

    // Prevention pillars
    const rawPillars = db.prepare(`
      SELECT * FROM prevention_pillars WHERE disease_id = ? ORDER BY 
      CASE pillar
        WHEN 'KNOW' THEN 1
        WHEN 'WATCH' THEN 2
        WHEN 'PREVENT' THEN 3
        WHEN 'PREPARE' THEN 4
        WHEN 'ACT' THEN 5
        ELSE 6
      END
    `).all(disease.id);

    const preventionPillars = rawPillars.map(p => ({
      ...p,
      actionable_steps: JSON.parse(p.actionable_steps || '[]')
    }));

    // Myths
    const myths = db.prepare(`
      SELECT * FROM myths WHERE disease_id = ? OR category LIKE ?
    `).all(disease.id, `%${disease.category}%`);

    // Seek care guidelines
    const seekCareGuidelines = db.prepare(`
      SELECT * FROM seek_care_guidelines WHERE disease_id = ? ORDER BY 
      CASE urgency
        WHEN 'emergency' THEN 1
        WHEN 'prompt' THEN 2
        WHEN 'routine' THEN 3
        ELSE 4
      END
    `).all(disease.id);

    // Doctor questions
    const doctorQuestions = db.prepare(`
      SELECT * FROM doctor_question_templates WHERE disease_id = ?
    `).all(disease.id);

    // Resources
    const resources = db.prepare(`
      SELECT * FROM resources WHERE disease_id = ?
    `).all(disease.id);

    // Saved status
    let isSaved = false;
    let userChecklistCompleted = [];
    if (req.user) {
      const saved = db.prepare('SELECT id FROM user_saved_diseases WHERE user_id = ? AND disease_id = ?').get(req.user.id, disease.id);
      isSaved = !!saved;

      const completedRows = db.prepare(`
        SELECT prevention_pillar_id FROM user_checklist_progress WHERE user_id = ? AND disease_id = ?
      `).all(req.user.id, disease.id);
      userChecklistCompleted = completedRows.map(r => r.prevention_pillar_id);
    }

    res.json({
      disease,
      warningSigns,
      riskFactors,
      preventionPillars,
      myths,
      seekCareGuidelines,
      doctorQuestions,
      resources,
      isSaved,
      userChecklistCompleted
    });
  } catch (err) {
    console.error('Error fetching disease details:', err);
    res.status(500).json({ error: 'Failed to retrieve disease details.' });
  }
});

// Admin: Create disease
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { slug, name, category, headline, overview, anatomical_system, prevalence, key_stat, hero_quote, is_featured } = req.body;

  if (!slug || !name || !category || !headline || !overview) {
    return res.status(400).json({ error: 'Missing required disease fields.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO diseases (slug, name, category, headline, overview, anatomical_system, prevalence, key_stat, hero_quote, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(slug.toLowerCase().trim(), name.trim(), category.trim(), headline.trim(), overview.trim(), anatomical_system || '', prevalence || '', key_stat || '', hero_quote || '', is_featured ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Disease created successfully.' });
  } catch (err) {
    console.error('Error creating disease:', err);
    res.status(500).json({ error: 'Failed to create disease entry.' });
  }
});

// Admin: Update disease
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, category, headline, overview, anatomical_system, prevalence, key_stat, hero_quote, is_featured } = req.body;

  try {
    db.prepare(`
      UPDATE diseases SET
        name = ?, category = ?, headline = ?, overview = ?, anatomical_system = ?,
        prevalence = ?, key_stat = ?, hero_quote = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, category, headline, overview, anatomical_system, prevalence, key_stat, hero_quote, is_featured ? 1 : 0, id);

    res.json({ message: 'Disease updated successfully.' });
  } catch (err) {
    console.error('Error updating disease:', err);
    res.status(500).json({ error: 'Failed to update disease.' });
  }
});

// Admin: Delete disease
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM diseases WHERE id = ?').run(id);
    res.json({ message: 'Disease removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete disease.' });
  }
});

module.exports = router;
