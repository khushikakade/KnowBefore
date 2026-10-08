import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  BarChart2, BookOpen, CheckSquare, MessageSquare, Compass, 
  ArrowRight, Award, Bookmark, Calendar, Check, ExternalLink 
} from 'lucide-react';

export default function UserDashboardPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 className="serif-display" style={{ fontSize: '2rem', marginBottom: '12px' }}>
          Your Awareness Workspace
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px' }}>
          Sign in to track your personal prevention checklists, saved clinical conditions, doctor discussion questions, and quiz evaluations.
        </p>
        <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
          Sign In or Try Demo Account
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your personal journey workspace...
      </div>
    );
  }

  const { stats, savedDiseases, checklistSummary, recentQuizzes, doctorQuestions, campaignPledges, recommendations } = data || {};

  return (
    <div className="user-dashboard-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header with Visual Storytelling */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: 'clamp(28px, 4vw, 44px)',
          marginBottom: '32px'
        }}>
          <div className="editorial-kicker" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
            Personal Awareness Workspace
          </div>

          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '12px' }}>
            Welcome back, {user.full_name?.split(' ')[0]}.
          </h1>

          <p className="serif-display" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.5 }}>
            "You are building your health awareness step by step. Every verified biomarker understood protects years of vitality."
          </p>

          {/* Metric Continuum Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            marginTop: '28px'
          }}>
            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>SAVED CONDITIONS</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stats?.savedDiseasesCount || 0}
              </div>
            </div>

            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>CHECKLIST STEPS DONE</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                {stats?.checklistStepsCompleted || 0}
              </div>
            </div>

            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>QUIZZES EVALUATED</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                {stats?.quizzesTaken || 0}
              </div>
            </div>

            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>DOCTOR QUESTIONS</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stats?.questionsPrepared || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {stats?.questionsDiscussed || 0} discussed
              </div>
            </div>

            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>PUBLIC PLEDGES</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--ochre)' }}>
                {stats?.campaignsPledged || 0}
              </div>
            </div>
          </div>
        </div>

        <MedicalDisclaimer compact />

        {/* 3 Core Questions Section:
            1. What have I learned?
            2. What should I revisit?
            3. What can I do next? */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          margin: '32px 0 40px'
        }}>
          
          {/* Card 1: What Have I Learned? */}
          <div className="editorial-card">
            <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Retrospective</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '14px' }}>
              What Have I Learned?
            </h3>

            {recentQuizzes?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentQuizzes.map(q => (
                  <div key={q.id} style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <span>{q.quiz_title}</span>
                      <span style={{ color: 'var(--primary)' }}>{q.percentage}%</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Completed on {new Date(q.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Take your first Awareness Check to benchmark baseline knowledge.
              </p>
            )}

            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => onNavigate('/awareness-check')}
            >
              Take Another Awareness Check
            </button>
          </div>

          {/* Card 2: What Should I Revisit? */}
          <div className="editorial-card">
            <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Active Checklists</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '14px' }}>
              What Should I Revisit?
            </h3>

            {checklistSummary && Object.keys(checklistSummary).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(checklistSummary).map(([dName, info]) => (
                  <div key={dName} style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {info.completed} steps checked
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onNavigate('/prevention-checklist')}
                    >
                      Continue <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                No active prevention steps recorded yet.
              </p>
            )}

            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => onNavigate('/prevention-checklist')}
            >
              Open Prevention Checklists
            </button>
          </div>

          {/* Card 3: What Can I Do Next? */}
          <div className="editorial-card">
            <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Recommended Actions</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '14px' }}>
              What Can I Do Next?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations?.slice(0, 3).map((rec, i) => (
                <div key={i} style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)'
                }}>
                  <div className="mono-tag" style={{ color: 'var(--accent)', fontWeight: 600 }}>{rec.action}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, margin: '2px 0' }}>{rec.title}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{rec.desc}</p>
                  <button
                    onClick={() => onNavigate(rec.link)}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Start step <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Saved Diseases Shelf */}
        {savedDiseases?.length > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '28px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="editorial-kicker">Saved Library</div>
                <h3 className="serif-display" style={{ fontSize: '1.5rem', marginTop: '2px' }}>
                  Your Bookmarked Conditions ({savedDiseases.length})
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/diseases')}>
                Browse Catalog
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {savedDiseases.map(d => (
                <div
                  key={d.id}
                  onClick={() => onNavigate(`/diseases/${d.slug}`)}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span className="badge badge-subtle" style={{ marginBottom: '8px' }}>{d.category}</span>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '6px' }}>{d.name}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                      {d.headline}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <span>Open 8-Section Module</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Questions Consultation Readiness */}
        {doctorQuestions?.length > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="editorial-kicker">Doctor Discussion Preparedness</div>
                <h3 className="serif-display" style={{ fontSize: '1.5rem', marginTop: '2px' }}>
                  Consultation Questions Ready ({doctorQuestions.length})
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/doctor-discussion')}>
                Open Full Worksheet
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctorQuestions.map(q => (
                <div key={q.id} style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      "{q.question}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {q.disease_name || 'General Health'} · Priority: {q.priority}
                    </div>
                  </div>
                  <span className={`badge ${q.is_discussed ? 'badge-pine' : 'badge-subtle'}`}>
                    {q.is_discussed ? 'Discussed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
