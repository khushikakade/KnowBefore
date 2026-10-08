const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/diseases');
const warningSignRoutes = require('./routes/warningSigns');
const mythRoutes = require('./routes/myths');
const quizRoutes = require('./routes/quizzes');
const checklistRoutes = require('./routes/checklists');
const doctorQuestionRoutes = require('./routes/doctorQuestions');
const campaignRoutes = require('./routes/campaigns');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const submissionRoutes = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for API calls
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check & educational disclaimer header
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'KnowBefore',
    tagline: 'From Information to Awareness to Action',
    disclaimer: 'KnowBefore provides educational information and does not diagnose medical conditions.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/warning-signs', warningSignRoutes);
app.use('/api/myths', mythRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/doctor-questions', doctorQuestionRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);

// Global search endpoint for unified instant search
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ diseases: [], warningSigns: [], myths: [] });
  }

  const query = `%${q.trim()}%`;
  try {
    const diseases = db.prepare(`
      SELECT id, name, slug, category, headline, prevalence
      FROM diseases
      WHERE name LIKE ? OR overview LIKE ? OR category LIKE ?
      LIMIT 5
    `).all(query, query, query);

    const warningSigns = db.prepare(`
      SELECT ws.id, ws.sign_name, ws.category, ws.is_red_flag, d.name as disease_name, d.slug as disease_slug
      FROM warning_signs ws
      JOIN diseases d ON ws.disease_id = d.id
      WHERE ws.sign_name LIKE ? OR ws.description LIKE ?
      LIMIT 5
    `).all(query, query);

    const myths = db.prepare(`
      SELECT m.id, m.myth, m.fact, m.category, d.slug as disease_slug
      FROM myths m
      LEFT JOIN diseases d ON m.disease_id = d.id
      WHERE m.myth LIKE ? OR m.fact LIKE ?
      LIMIT 4
    `).all(query, query);

    res.json({ diseases, warningSigns, myths });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed.' });
  }
});

// Serve frontend in production if built
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.resolve(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('KnowBefore API is running. Client is served through Vite dev server or npm run build.');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An unexpected internal error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` KnowBefore Backend Server listening on http://localhost:${PORT}`);
  console.log(` Tagline: "From Information to Awareness to Action"`);
  console.log(` Medical Disclaimer Active: Educational Awareness Only`);
  console.log(`======================================================\n`);
});
