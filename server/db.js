const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'knowbefore.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys for data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('guest', 'user', 'admin')) DEFAULT 'user',
      avatar_color TEXT DEFAULT '#2A5C43',
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      overview TEXT NOT NULL,
      anatomical_system TEXT NOT NULL,
      prevalence TEXT NOT NULL,
      key_stat TEXT NOT NULL,
      hero_quote TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warning_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      sign_name TEXT NOT NULL,
      category TEXT NOT NULL,
      stage TEXT CHECK(stage IN ('early', 'progressive', 'emergency')) DEFAULT 'early',
      description TEXT NOT NULL,
      biological_mechanism TEXT NOT NULL,
      clinical_significance TEXT NOT NULL,
      what_to_do TEXT NOT NULL,
      is_red_flag INTEGER DEFAULT 0,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_factors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      factor_type TEXT CHECK(factor_type IN ('modifiable', 'non_modifiable')) NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      impact_level TEXT CHECK(impact_level IN ('high', 'moderate', 'variable')) DEFAULT 'moderate',
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prevention_pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      pillar TEXT CHECK(pillar IN ('KNOW', 'WATCH', 'PREVENT', 'PREPARE', 'ACT')) NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      actionable_steps TEXT NOT NULL,
      target_metrics TEXT,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS myths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER,
      category TEXT NOT NULL,
      myth TEXT NOT NULL,
      fact TEXT NOT NULL,
      explanation TEXT NOT NULL,
      scientific_evidence TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS seek_care_guidelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      urgency TEXT CHECK(urgency IN ('routine', 'prompt', 'emergency')) NOT NULL,
      trigger_condition TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doctor_question_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      rationale TEXT NOT NULL,
      when_to_ask TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_doctor_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      disease_id INTEGER,
      question TEXT NOT NULL,
      rationale TEXT,
      priority TEXT CHECK(priority IN ('routine', 'high')) DEFAULT 'routine',
      is_discussed INTEGER DEFAULT 0,
      doctor_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_saved_diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      disease_id INTEGER NOT NULL,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, disease_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_checklist_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      prevention_pillar_id INTEGER NOT NULL,
      pillar TEXT NOT NULL,
      disease_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, prevention_pillar_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (prevention_pillar_id) REFERENCES prevention_pillars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      disease_id INTEGER,
      time_minutes INTEGER DEFAULT 5,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      category TEXT NOT NULL,
      rationale_correct TEXT NOT NULL,
      rationale_incorrect TEXT NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      explanation TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      category_breakdown_json TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      goal_statement TEXT NOT NULL,
      target_participants INTEGER NOT NULL,
      current_participants INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      hero_quote TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      pledge_text TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(campaign_id, user_id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      submission_type TEXT CHECK(submission_type IN ('question_suggestion', 'feedback', 'story', 'correction')) NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name TEXT,
      author_email TEXT,
      status TEXT CHECK(status IN ('pending', 'reviewed', 'published')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER,
      title TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      organization TEXT NOT NULL,
      url_reference TEXT NOT NULL,
      summary TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );
  `);
}

initializeDatabase();

module.exports = db;
