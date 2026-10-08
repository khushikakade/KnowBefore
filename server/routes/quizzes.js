const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken, authenticateToken } = require('../middleware/auth');

// List quizzes
router.get('/', (req, res) => {
  try {
    const quizzes = db.prepare(`
      SELECT q.*, d.name as disease_name, d.slug as disease_slug,
             (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) as question_count
      FROM quizzes q
      LEFT JOIN diseases d ON q.disease_id = d.id
      ORDER BY q.id ASC
    `).all();

    res.json({ quizzes });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to retrieve awareness quizzes.' });
  }
});

// Get single quiz with questions and choices
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const quiz = db.prepare(`
      SELECT q.*, d.name as disease_name, d.slug as disease_slug
      FROM quizzes q
      LEFT JOIN diseases d ON q.disease_id = d.id
      WHERE q.id = ?
    `).get(id);

    if (!quiz) {
      return res.status(404).json({ error: 'Awareness check not found.' });
    }

    const rawQuestions = db.prepare(`
      SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC
    `).all(quiz.id);

    const questions = rawQuestions.map(q => {
      const options = db.prepare(`
        SELECT id, option_text, is_correct, explanation
        FROM quiz_options
        WHERE question_id = ?
        ORDER BY id ASC
      `).all(q.id);

      return {
        ...q,
        options
      };
    });

    res.json({ quiz, questions });
  } catch (err) {
    console.error('Error fetching quiz details:', err);
    res.status(500).json({ error: 'Failed to retrieve quiz questions.' });
  }
});

// Submit quiz answers & compute educational snapshot
router.post('/:id/submit', optionalToken, (req, res) => {
  const { id } = req.params;
  const { answers } = req.body; // { [questionId]: selectedOptionId }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers payload is required.' });
  }

  try {
    const questions = db.prepare('SELECT id, category FROM quiz_questions WHERE quiz_id = ?').all(id);
    if (!questions.length) {
      return res.status(404).json({ error: 'Quiz has no questions.' });
    }

    let score = 0;
    const categoryStats = {};
    const detailedFeedback = [];

    questions.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0 };
      }
      categoryStats[q.category].total += 1;

      const selectedOptId = answers[q.id];
      const correctOption = db.prepare('SELECT id, option_text, explanation FROM quiz_options WHERE question_id = ? AND is_correct = 1').get(q.id);
      const chosenOption = selectedOptId ? db.prepare('SELECT id, option_text, is_correct, explanation FROM quiz_options WHERE id = ?').get(selectedOptId) : null;

      const isCorrect = chosenOption && chosenOption.is_correct === 1;
      if (isCorrect) {
        score += 1;
        categoryStats[q.category].correct += 1;
      }

      detailedFeedback.push({
        questionId: q.id,
        category: q.category,
        isCorrect,
        chosenOptionId: selectedOptId,
        chosenOptionText: chosenOption ? chosenOption.option_text : 'Skipped',
        correctOptionText: correctOption ? correctOption.option_text : '',
        explanation: chosenOption ? chosenOption.explanation : correctOption.explanation
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Save to user history if authenticated
    if (req.user) {
      db.prepare(`
        INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, percentage, category_breakdown_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, id, score, totalQuestions, percentage, JSON.stringify(categoryStats));
    }

    res.json({
      score,
      totalQuestions,
      percentage,
      categoryStats,
      detailedFeedback,
      summaryMessage: percentage >= 80
        ? 'Exemplary awareness! You demonstrate nuanced understanding of risk mechanics and evidence-based prevention.'
        : percentage >= 50
        ? 'Solid foundational knowledge. Reviewing warning signals and myth explanations will strengthen your awareness.'
        : 'Important learning opportunity. Explore the linked prevention pillars and disease overviews to build deeper clarity.'
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ error: 'Failed to process quiz results.' });
  }
});

// User's quiz history
router.get('/results/user', authenticateToken, (req, res) => {
  try {
    const results = db.prepare(`
      SELECT qr.*, q.title as quiz_title, q.category as quiz_category
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      WHERE qr.user_id = ?
      ORDER BY qr.completed_at DESC
    `).all(req.user.id);

    const parsed = results.map(r => ({
      ...r,
      category_breakdown: JSON.parse(r.category_breakdown_json || '{}')
    }));

    res.json({ results: parsed });
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ error: 'Failed to fetch user quiz history.' });
  }
});

module.exports = router;
