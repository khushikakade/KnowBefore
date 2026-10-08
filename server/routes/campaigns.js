const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalToken, authenticateToken, requireAdmin } = require('../middleware/auth');

// List campaigns
router.get('/', optionalToken, (req, res) => {
  try {
    const campaigns = db.prepare(`
      SELECT c.*,
             (SELECT COUNT(*) FROM campaign_participants cp WHERE cp.campaign_id = c.id) as real_participant_count
      FROM campaigns c
      ORDER BY c.is_active DESC, c.start_date DESC
    `).all();

    const formatted = campaigns.map(c => ({
      ...c,
      content: JSON.parse(c.content_json || '{}')
    }));

    res.json({ campaigns: formatted });
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: 'Failed to retrieve awareness campaigns.' });
  }
});

// Single campaign by slug
router.get('/:slug', optionalToken, (req, res) => {
  const { slug } = req.params;

  try {
    const campaign = db.prepare('SELECT * FROM campaigns WHERE slug = ?').get(slug);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const participants = db.prepare(`
      SELECT cp.pledge_text, cp.joined_at, u.full_name, u.avatar_color
      FROM campaign_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.campaign_id = ?
      ORDER BY cp.joined_at DESC
      LIMIT 20
    `).all(campaign.id);

    let hasJoined = false;
    let userPledge = null;
    if (req.user) {
      const part = db.prepare('SELECT pledge_text FROM campaign_participants WHERE campaign_id = ? AND user_id = ?').get(campaign.id, req.user.id);
      if (part) {
        hasJoined = true;
        userPledge = part.pledge_text;
      }
    }

    res.json({
      campaign: {
        ...campaign,
        content: JSON.parse(campaign.content_json || '{}')
      },
      participants,
      hasJoined,
      userPledge
    });
  } catch (err) {
    console.error('Error fetching campaign detail:', err);
    res.status(500).json({ error: 'Failed to retrieve campaign details.' });
  }
});

// Participate / Pledge
router.post('/:id/participate', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { pledge_text } = req.body;

  if (!pledge_text || !pledge_text.trim()) {
    return res.status(400).json({ error: 'Please enter a personal action pledge to participate.' });
  }

  try {
    const campaign = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const existing = db.prepare('SELECT id FROM campaign_participants WHERE campaign_id = ? AND user_id = ?').get(id, req.user.id);
    if (existing) {
      db.prepare('UPDATE campaign_participants SET pledge_text = ?, joined_at = CURRENT_TIMESTAMP WHERE id = ?').run(pledge_text.trim(), existing.id);
    } else {
      db.prepare('INSERT INTO campaign_participants (campaign_id, user_id, pledge_text) VALUES (?, ?, ?)').run(id, req.user.id, pledge_text.trim());
      db.prepare('UPDATE campaigns SET current_participants = current_participants + 1 WHERE id = ?').run(id);
    }

    res.json({ message: 'Thank you for taking a personal awareness pledge!', pledge_text: pledge_text.trim() });
  } catch (err) {
    console.error('Error participating in campaign:', err);
    res.status(500).json({ error: 'Failed to register campaign pledge.' });
  }
});

module.exports = router;
