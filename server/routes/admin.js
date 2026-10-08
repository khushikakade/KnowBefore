const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Admin Overview & Analytics
router.get('/overview', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalDiseases = db.prepare('SELECT COUNT(*) as count FROM diseases').get().count;
    const totalQuizzes = db.prepare('SELECT COUNT(*) as count FROM quizzes').get().count;
    const totalQuizAttempts = db.prepare('SELECT COUNT(*) as count FROM quiz_results').get().count;
    const averageQuizScore = db.prepare('SELECT AVG(percentage) as avg FROM quiz_results').get().avg || 0;
    const totalChecklistCompletions = db.prepare('SELECT COUNT(*) as count FROM user_checklist_progress').get().count;
    const totalDoctorQuestions = db.prepare('SELECT COUNT(*) as count FROM user_doctor_questions').get().count;
    const totalCampaignPledges = db.prepare('SELECT COUNT(*) as count FROM campaign_participants').get().count;
    const pendingSubmissions = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'").get().count;

    // Disease engagement breakdown
    const diseaseEngagement = db.prepare(`
      SELECT d.name, d.category,
             (SELECT COUNT(*) FROM user_saved_diseases usd WHERE usd.disease_id = d.id) as saved_count,
             (SELECT COUNT(*) FROM user_checklist_progress ucp WHERE ucp.disease_id = d.id) as checklist_count,
             (SELECT COUNT(*) FROM user_doctor_questions udq WHERE udq.disease_id = d.id) as questions_count
      FROM diseases d
      ORDER BY saved_count DESC, checklist_count DESC
    `).all();

    // Quiz performance trends
    const quizPerformance = db.prepare(`
      SELECT q.title, q.category, COUNT(qr.id) as attempts, ROUND(AVG(qr.percentage), 1) as avg_score
      FROM quizzes q
      LEFT JOIN quiz_results qr ON q.id = qr.quiz_id
      GROUP BY q.id
    `).all();

    // Campaign participation stats
    const campaignStats = db.prepare(`
      SELECT c.title, c.category, c.target_participants, c.current_participants,
             COUNT(cp.id) as registered_pledges, c.is_active
      FROM campaigns c
      LEFT JOIN campaign_participants cp ON c.id = cp.campaign_id
      GROUP BY c.id
    `).all();

    res.json({
      metrics: {
        totalUsers,
        totalDiseases,
        totalQuizzes,
        totalQuizAttempts,
        averageQuizScore: Math.round(averageQuizScore),
        totalChecklistCompletions,
        totalDoctorQuestions,
        totalCampaignPledges,
        pendingSubmissions
      },
      diseaseEngagement,
      quizPerformance,
      campaignStats
    });
  } catch (err) {
    console.error('Error in admin overview:', err);
    res.status(500).json({ error: 'Failed to retrieve admin analytics.' });
  }
});

// User Management
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, full_name, role, avatar_color, created_at,
             (SELECT COUNT(*) FROM user_saved_diseases WHERE user_id = users.id) as saved_count,
             (SELECT COUNT(*) FROM quiz_results WHERE user_id = users.id) as quiz_count,
             (SELECT COUNT(*) FROM user_doctor_questions WHERE user_id = users.id) as questions_count
      FROM users
      ORDER BY id ASC
    `).all();

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Update user role
router.put('/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'guest'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// Submissions Review
router.get('/submissions', (req, res) => {
  try {
    const submissions = db.prepare(`
      SELECT * FROM submissions ORDER BY 
      CASE status WHEN 'pending' THEN 1 WHEN 'reviewed' THEN 2 ELSE 3 END,
      created_at DESC
    `).all();

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// Update submission status
router.put('/submissions/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'reviewed', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid submission status.' });
  }

  try {
    db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: 'Submission status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update submission.' });
  }
});

// Create campaign
router.post('/campaigns', (req, res) => {
  const { slug, title, subtitle, category, goal_statement, target_participants, start_date, end_date, hero_quote, content } = req.body;

  if (!slug || !title || !goal_statement) {
    return res.status(400).json({ error: 'Slug, title, and goal statement are required.' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO campaigns (slug, title, subtitle, category, goal_statement, target_participants, current_participants, start_date, end_date, is_active, hero_quote, content_json)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?)
    `).run(slug.toLowerCase().trim(), title.trim(), subtitle || '', category || 'Public Health', goal_statement, target_participants || 1000, start_date || '2026-10-01', end_date || '2026-12-31', hero_quote || '', JSON.stringify(content || {}));

    res.status(201).json({ id: info.lastInsertRowid, message: 'Campaign created successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
});

// Toggle campaign active status
router.put('/campaigns/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  try {
    const current = db.prepare('SELECT is_active FROM campaigns WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    const nextStatus = current.is_active ? 0 : 1;
    db.prepare('UPDATE campaigns SET is_active = ? WHERE id = ?').run(nextStatus, id);
    res.json({ message: `Campaign ${nextStatus ? 'activated' : 'archived'}.`, is_active: nextStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle campaign status.' });
  }
});

module.exports = router;
