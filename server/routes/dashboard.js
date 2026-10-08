const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Complete dashboard overview for authenticated user
router.get('/overview', authenticateToken, (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Saved diseases
    const savedDiseases = db.prepare(`
      SELECT d.id, d.name, d.slug, d.category, d.headline, d.key_stat, usd.saved_at
      FROM user_saved_diseases usd
      JOIN diseases d ON usd.disease_id = d.id
      WHERE usd.user_id = ?
      ORDER BY usd.saved_at DESC
    `).all(userId);

    // 2. Checklist progress
    const checklistItems = db.prepare(`
      SELECT ucp.*, d.name as disease_name, d.slug as disease_slug, pp.title as pillar_title
      FROM user_checklist_progress ucp
      JOIN diseases d ON ucp.disease_id = d.id
      JOIN prevention_pillars pp ON ucp.prevention_pillar_id = pp.id
      WHERE ucp.user_id = ?
      ORDER BY ucp.completed_at DESC
    `).all(userId);

    // Group checklist counts by disease
    const diseaseProgressMap = {};
    checklistItems.forEach(item => {
      if (!diseaseProgressMap[item.disease_name]) {
        diseaseProgressMap[item.disease_name] = { completed: 0, slug: item.disease_slug };
      }
      diseaseProgressMap[item.disease_name].completed += 1;
    });

    // 3. Quiz results
    const quizResults = db.prepare(`
      SELECT qr.*, q.title as quiz_title, q.category as quiz_category
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      WHERE qr.user_id = ?
      ORDER BY qr.completed_at DESC
      LIMIT 5
    `).all(userId);

    const parsedQuizResults = quizResults.map(q => ({
      ...q,
      category_breakdown: JSON.parse(q.category_breakdown_json || '{}')
    }));

    // 4. Doctor questions summary
    const doctorQuestions = db.prepare(`
      SELECT udq.*, d.name as disease_name, d.slug as disease_slug
      FROM user_doctor_questions udq
      LEFT JOIN diseases d ON udq.disease_id = d.id
      WHERE udq.user_id = ?
      ORDER BY udq.is_discussed ASC, udq.created_at DESC
    `).all(userId);

    const discussedCount = doctorQuestions.filter(q => q.is_discussed).length;
    const pendingQuestionsCount = doctorQuestions.length - discussedCount;

    // 5. Campaign pledges
    const campaignPledges = db.prepare(`
      SELECT cp.*, c.title as campaign_title, c.slug as campaign_slug, c.category as campaign_category
      FROM campaign_participants cp
      JOIN campaigns c ON cp.campaign_id = c.id
      WHERE cp.user_id = ?
      ORDER BY cp.joined_at DESC
    `).all(userId);

    // Journey metrics
    const stats = {
      savedDiseasesCount: savedDiseases.length,
      checklistStepsCompleted: checklistItems.length,
      quizzesTaken: parsedQuizResults.length,
      questionsPrepared: doctorQuestions.length,
      questionsDiscussed: discussedCount,
      pendingQuestions: pendingQuestionsCount,
      campaignsPledged: campaignPledges.length
    };

    // Construct personalized next recommendations
    const recommendations = [];
    if (savedDiseases.length === 0) {
      recommendations.push({
        action: 'Explore & Save',
        title: 'Save your first condition',
        desc: 'Visit the Disease Library and bookmark conditions relevant to your health or family history.',
        link: '/diseases'
      });
    }
    if (doctorQuestions.length === 0) {
      recommendations.push({
        action: 'Prepare',
        title: 'Draft questions for your doctor',
        desc: 'Turn clinical uncertainty into clear questions before your next healthcare consultation.',
        link: '/doctor-discussion'
      });
    }
    if (parsedQuizResults.length === 0) {
      recommendations.push({
        action: 'Test Knowledge',
        title: 'Take your first Awareness Check',
        desc: 'Discover your knowledge baseline on cardiovascular or metabolic conditions.',
        link: '/awareness-check'
      });
    }
    if (checklistItems.length < 5) {
      recommendations.push({
        action: 'Actionable Steps',
        title: 'Review Prevention Checklist',
        desc: 'Complete the 5-pillar prevention plan for blood pressure or glycemic control.',
        link: '/prevention-checklist'
      });
    }

    res.json({
      stats,
      savedDiseases,
      checklistSummary: diseaseProgressMap,
      recentQuizzes: parsedQuizResults,
      doctorQuestions: doctorQuestions.slice(0, 6),
      campaignPledges,
      recommendations
    });
  } catch (err) {
    console.error('Error fetching dashboard overview:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard data.' });
  }
});

// Toggle saved disease
router.post('/saved-diseases/:diseaseId', authenticateToken, (req, res) => {
  const { diseaseId } = req.params;
  const userId = req.user.id;

  try {
    const existing = db.prepare('SELECT id FROM user_saved_diseases WHERE user_id = ? AND disease_id = ?').get(userId, diseaseId);
    if (existing) {
      db.prepare('DELETE FROM user_saved_diseases WHERE id = ?').run(existing.id);
      res.json({ is_saved: false, message: 'Condition removed from saved library.' });
    } else {
      db.prepare('INSERT INTO user_saved_diseases (user_id, disease_id) VALUES (?, ?)').run(userId, diseaseId);
      res.json({ is_saved: true, message: 'Condition saved to your personal library.' });
    }
  } catch (err) {
    console.error('Error toggling saved disease:', err);
    res.status(500).json({ error: 'Failed to update saved condition.' });
  }
});

module.exports = router;
