import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  Users, Calendar, Target, ArrowRight, CheckCircle2, 
  Sparkles, Award, HeartHandshake, Check, ShieldAlert 
} from 'lucide-react';

export default function CampaignsPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [pledgeText, setPledgeText] = useState('');
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [submittingPledge, setSubmittingPledge] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const openPledge = (camp) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setActiveCampaign(camp);
    setPledgeText('');
    setPledgeModalOpen(true);
  };

  const submitPledge = async (e) => {
    e.preventDefault();
    if (!pledgeText.trim()) return;

    setSubmittingPledge(true);
    try {
      const res = await fetch(`/api/campaigns/${activeCampaign.id}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({ pledge_text: pledgeText })
      });

      if (res.ok) {
        setPledgeModalOpen(false);
        showToast('Your awareness action pledge has been recorded!');
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Pledge error:', err);
    } finally {
      setSubmittingPledge(false);
    }
  };

  return (
    <div className="campaigns-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Community Initiatives</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            Public Health Action Campaigns
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Awareness is personal, but prevention is cultural. Join focused community campaigns dedicated to blood pressure monitoring, pre-diabetes reversal, and respiratory vigilance.
          </p>
        </div>

        <MedicalDisclaimer compact />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.875rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} color="#A7D3BA" />
            {toastMessage}
          </div>
        )}

        {/* Campaign Cards List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading active campaigns...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            {campaigns.map(camp => {
              const total = camp.target_participants || 1;
              const current = camp.current_participants || 0;
              const pct = Math.min(100, Math.round((current / total) * 100));

              return (
                <div
                  key={camp.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  {/* Top Banner */}
                  <div style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '24px 32px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#E8F0EB', marginBottom: '8px' }}>
                        {camp.category}
                      </span>
                      <h2 className="serif-display" style={{ fontSize: '1.75rem', color: 'white', marginBottom: '4px' }}>
                        {camp.title}
                      </h2>
                      <div style={{ fontSize: '0.875rem', color: '#B6CBBF' }}>
                        {camp.subtitle}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                          {current.toLocaleString()} / {total.toLocaleString()}
                        </div>
                        <div className="mono-tag" style={{ fontSize: '0.6875rem', color: '#B6CBBF' }}>
                          COMMUNITY PLEDGES
                        </div>
                      </div>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => openPledge(camp)}
                      >
                        <HeartHandshake size={15} />
                        Take Action Pledge
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Strip */}
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '32px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '28px',
                      marginBottom: '24px'
                    }}>
                      <div>
                        <div className="editorial-kicker" style={{ marginBottom: '6px' }}>Campaign Goal</div>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {camp.goal_statement}
                        </p>
                      </div>

                      <div>
                        <div className="editorial-kicker" style={{ marginBottom: '6px' }}>Campaign Quote</div>
                        <blockquote className="serif-display" style={{ fontSize: '1.0625rem', fontStyle: 'italic', color: 'var(--primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '14px' }}>
                          "{camp.hero_quote}"
                        </blockquote>
                      </div>
                    </div>

                    {/* Pillars / Actions */}
                    {camp.content?.actions && (
                      <div style={{
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '20px',
                        marginBottom: '20px'
                      }}>
                        <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>
                          CORE CAMPAIGN ACTIONS
                        </div>
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {camp.content.actions.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span>Timeline: <strong>{camp.start_date}</strong> to <strong>{camp.end_date}</strong></span>
                        <span>Status: <strong>Active Public Health Drive</strong></span>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openPledge(camp)}
                      >
                        Participate in this initiative
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* PLEDGE MODAL */}
        {pledgeModalOpen && activeCampaign && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(21, 24, 22, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              padding: '32px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <div className="editorial-kicker" style={{ color: 'var(--accent)', marginBottom: '4px' }}>Personal Action Pledge</div>
              <h3 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
                Join {activeCampaign.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                State what concrete action you will take (e.g. "I will record 7 days of morning blood pressure readings and review them with my doctor.")
              </p>

              <form onSubmit={submitPledge}>
                <textarea
                  required
                  rows={4}
                  value={pledgeText}
                  onChange={(e) => setPledgeText(e.target.value)}
                  placeholder="I pledge to..."
                  className="input-field"
                  style={{ marginBottom: '20px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPledgeModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingPledge}
                  >
                    {submittingPledge ? 'Recording...' : 'Submit Action Pledge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
