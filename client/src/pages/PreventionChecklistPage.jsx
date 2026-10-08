import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  CheckSquare, Square, Check, ArrowRight, Printer, Share2, 
  Sparkles, ShieldAlert, BookOpen 
} from 'lucide-react';

export default function PreventionChecklistPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('hypertension');
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedPillars, setCheckedPillars] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDiseaseList();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      fetchChecklist(selectedSlug);
    }
  }, [selectedSlug]);

  const fetchDiseaseList = async () => {
    try {
      const res = await fetch('/api/diseases');
      if (res.ok) {
        const data = await res.json();
        setDiseases(data.diseases || []);
      }
    } catch (err) {
      console.error('Failed to load diseases:', err);
    }
  };

  const fetchChecklist = async (slug) => {
    setLoading(true);
    try {
      const headers = {};
      const token = localStorage.getItem('knowbefore_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/checklists/${slug}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setChecklist(data);

        const currentChecked = {};
        (data.pillars || []).forEach(p => {
          if (p.is_completed) currentChecked[p.id] = true;
        });
        setCheckedPillars(currentChecked);
      }
    } catch (err) {
      console.error('Failed to load checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePillar = async (pillarId) => {
    if (!user) {
      // Allow guest local toggle
      setCheckedPillars(prev => ({
        ...prev,
        [pillarId]: !prev[pillarId]
      }));
      showToast('Step toggled in local session. Sign in to save to your personal dashboard.');
      return;
    }

    try {
      const res = await fetch('/api/checklists/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({
          pillar_id: pillarId,
          disease_id: checklist.disease.id
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setCheckedPillars(prev => ({
          ...prev,
          [pillarId]: resData.completed
        }));
        showToast(resData.message);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const totalSteps = checklist?.pillars?.length || 5;
  const completedSteps = Object.values(checkedPillars).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / (totalSteps || 1)) * 100);

  return (
    <div className="prevention-checklist-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Actionable Health Agency</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            5-Pillar Prevention Checklists
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Convert clinical information into realistic daily action. Each condition is organized into the structured 5-pillar continuum: <strong>KNOW</strong>, <strong>WATCH</strong>, <strong>PREVENT</strong>, <strong>PREPARE</strong>, and <strong>ACT</strong>.
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

        {/* Condition Selector Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '24px 0 28px' }}>
          {diseases.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedSlug(d.slug)}
              className={`btn btn-sm ${selectedSlug === d.slug ? 'btn-primary' : 'btn-secondary'}`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Progress Header Card */}
        {checklist && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px 28px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              <div className="editorial-kicker" style={{ color: 'var(--primary)', marginBottom: '4px' }}>
                Active Checklist
              </div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
                {checklist.disease.name} Prevention Blueprint
              </h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {completedSteps} of {totalSteps} pillars completed ({progressPercent}%)
              </div>
            </div>

            <div style={{ minWidth: '220px', flex: '1 1 200px', maxWidth: '320px' }}>
              <div style={{
                height: '8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-pill)',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--primary)',
                  transition: 'width 300ms ease-in-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Foundation</span>
                <span>Complete</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                Print Checklist
              </button>
            </div>
          </div>
        )}

        {/* Pillars List */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading checklist...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {checklist?.pillars?.map(pillar => {
              const isChecked = !!checkedPillars[pillar.id];
              return (
                <div
                  key={pillar.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${isChecked ? 'var(--success-border)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '28px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleTogglePillar(pillar.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: `2px solid ${isChecked ? 'var(--success)' : 'var(--border-strong)'}`,
                          backgroundColor: isChecked ? 'var(--success)' : 'transparent',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        aria-label={`Toggle ${pillar.pillar} completion`}
                      >
                        {isChecked && <Check size={16} />}
                      </button>

                      <span className="badge badge-pine" style={{ fontWeight: 700 }}>
                        {pillar.pillar}
                      </span>

                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        opacity: isChecked ? 0.85 : 1
                      }}>
                        {pillar.title}
                      </h3>
                    </div>

                    <span className="mono-tag" style={{ color: isChecked ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isChecked ? 'Completed' : 'Pending Action'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px', paddingLeft: '36px' }}>
                    {pillar.description}
                  </p>

                  {/* Concrete Action Protocol */}
                  <div style={{
                    marginLeft: '36px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '16px 20px',
                    marginBottom: '14px'
                  }}>
                    <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                      PRACTICAL ACTION PROTOCOL
                    </div>
                    <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {pillar.actionable_steps.map((step, idx) => (
                        <li key={idx} style={{ lineHeight: 1.5 }}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {pillar.target_metrics && (
                    <div style={{ marginLeft: '36px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <strong>Evidence Target Metric:</strong> {pillar.target_metrics}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
