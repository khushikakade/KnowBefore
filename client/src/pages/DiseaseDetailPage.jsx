import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  ArrowLeft, Bookmark, BookmarkCheck, AlertCircle, ShieldAlert, CheckCircle2, 
  HelpCircle, Plus, Check, ExternalLink, Activity, BookOpen, Clock, Heart, ArrowRight
} from 'lucide-react';

export default function DiseaseDetailPage({ slug, onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('glance');
  const [isSaved, setIsSaved] = useState(false);
  const [revealedMyths, setRevealedMyths] = useState({});
  const [addedQuestions, setAddedQuestions] = useState({});
  const [checklistProgress, setChecklistProgress] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDiseaseDetail();
  }, [slug]);

  const fetchDiseaseDetail = async () => {
    setLoading(true);
    try {
      const headers = {};
      const token = localStorage.getItem('knowbefore_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/diseases/${slug}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsSaved(json.isSaved);

        const initialChecklist = {};
        (json.userChecklistCompleted || []).forEach(id => {
          initialChecklist[id] = true;
        });
        setChecklistProgress(initialChecklist);
      }
    } catch (err) {
      console.error('Failed to load disease detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleSave = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!data?.disease) return;

    try {
      const res = await fetch(`/api/dashboard/saved-diseases/${data.disease.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        }
      });
      if (res.ok) {
        const resData = await res.json();
        setIsSaved(resData.is_saved);
        showToast(resData.message);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleAddDoctorQuestion = async (template) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/doctor-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({
          disease_id: data.disease.id,
          question: template.question,
          rationale: template.rationale,
          priority: 'routine'
        })
      });

      if (res.ok) {
        setAddedQuestions(prev => ({ ...prev, [template.id]: true }));
        showToast('Question added to your Doctor Discussion List!');
      }
    } catch (err) {
      console.error('Add question error:', err);
    }
  };

  const handleToggleChecklistStep = async (pillarId) => {
    if (!user) {
      setAuthModalOpen(true);
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
          disease_id: data.disease.id
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setChecklistProgress(prev => ({
          ...prev,
          [pillarId]: resData.completed
        }));
        showToast(resData.message);
      }
    } catch (err) {
      console.error('Checklist toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading clinical condition module...
      </div>
    );
  }

  if (!data || !data.disease) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Condition not found</h2>
        <button className="btn btn-secondary" onClick={() => onNavigate('/diseases')}>
          Back to Disease Library
        </button>
      </div>
    );
  }

  const { disease, warningSigns, riskFactors, preventionPillars, myths, seekCareGuidelines, doctorQuestions, resources } = data;

  const tabs = [
    { id: 'glance', label: '01. At a Glance' },
    { id: 'signs', label: `02. Warning Signs (${warningSigns.length})` },
    { id: 'risks', label: `03. Risk Factors (${riskFactors.length})` },
    { id: 'prevention', label: '04. Prevention Pillars (5)' },
    { id: 'myths', label: `05. Myth vs Fact (${myths.length})` },
    { id: 'care', label: '06. When to Seek Care' },
    { id: 'doctor', label: `07. Questions for Doctor (${doctorQuestions.length})` },
    { id: 'resources', label: `08. Clinical Resources (${resources.length})` }
  ];

  return (
    <div className="disease-detail-page" style={{ padding: '32px 0 64px' }}>
      <div className="app-container">
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => onNavigate('/diseases')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft size={14} />
            Back to Library
          </button>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{disease.category}</span>
        </div>

        {/* Editorial Masthead for Condition */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: 'clamp(24px, 4vw, 40px)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-pine" style={{ marginBottom: '8px' }}>{disease.category}</span>
              <h1 className="serif-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {disease.name}
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.5 }}>
                {disease.headline}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-secondary'}`}
                onClick={handleToggleSave}
                style={{ color: isSaved ? 'var(--accent)' : 'inherit' }}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Saved in Library' : 'Bookmark Condition'}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('/awareness-check')}
              >
                Awareness Check
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px',
            marginTop: '20px'
          }}>
            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>ANATOMICAL SYSTEM</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{disease.anatomical_system}</div>
            </div>
            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>GLOBAL PREVALENCE</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{disease.prevalence}</div>
            </div>
            <div>
              <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>PRIMARY CLINICAL INSIGHT</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent)' }}>{disease.key_stat}</div>
            </div>
          </div>
        </div>

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
            <CheckCircle2 size={16} color="#A7D3BA" />
            {toastMessage}
          </div>
        )}

        {/* Guided Tab Bar */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '4px',
          borderBottom: '2px solid var(--border-subtle)',
          marginBottom: '32px',
          paddingBottom: '2px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: AT A GLANCE */}
        {activeTab === 'glance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="editorial-card">
              <div className="editorial-kicker" style={{ marginBottom: '10px' }}>01. Foundational Overview</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '16px' }}>
                Biological Mechanism & Progression
              </h2>
              <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                {disease.overview}
              </p>

              <blockquote className="serif-display" style={{
                fontSize: '1.25rem',
                fontStyle: 'italic',
                color: 'var(--primary)',
                borderLeft: '3px solid var(--accent)',
                paddingLeft: '20px',
                margin: '24px 0'
              }}>
                "{disease.hero_quote}"
              </blockquote>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="editorial-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                  The Awareness Paradigm
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  This condition is characterized by subclinical cellular adaptations. Awareness does not mean waiting for pain; it means recognizing physiological signals, knowing baseline numbers, and tracking family risk.
                </p>
              </div>

              <div className="editorial-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                  Next Best Action
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                  Review the 5 prevention pillars or prepare questions for your next routine clinical appointment.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('prevention')}>
                  Jump to Prevention Pillars
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: WARNING SIGNS */}
        {activeTab === 'signs' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">02. Signal Exploration</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                Warning Signs & Physiological Clues
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Warning signs are not diagnostic proof. They represent physiological cues that warrant clinical discussion.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {warningSigns.map(sign => (
                <div
                  key={sign.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${sign.is_red_flag ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
                    borderLeft: `4px solid ${sign.is_red_flag ? 'var(--danger)' : 'var(--primary)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sign.sign_name}
                      </h3>
                      {sign.is_red_flag === 1 && (
                        <span className="badge badge-danger">Emergency Red Flag</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge badge-subtle">Stage: {sign.stage}</span>
                      <span className="badge badge-subtle">{sign.category}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {sign.description}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                    fontSize: '0.8125rem'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                        Biological Mechanism:
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sign.biological_mechanism}</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
                        Clinical Significance:
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sign.clinical_significance}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Recommended Next Step:</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{sign.what_to_do}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: RISK FACTORS */}
        {activeTab === 'risks' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">03. Risk Mapping</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                Modifiable vs Non-Modifiable Factors
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Understanding what you can actively influence versus your biological baseline.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              {/* Modifiable */}
              <div>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--success)',
                  marginBottom: '16px'
                }}>
                  Modifiable Factors (Direct Area of Personal Action)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {riskFactors.filter(r => r.factor_type === 'modifiable').map(rf => (
                    <div key={rf.id} className="editorial-card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{rf.title}</h4>
                        <span className={`badge ${rf.impact_level === 'high' ? 'badge-danger' : 'badge-ochre'}`}>
                          {rf.impact_level} impact
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {rf.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Modifiable */}
              <div>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  marginBottom: '16px'
                }}>
                  Non-Modifiable Factors (Context for Earlier Screening)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {riskFactors.filter(r => r.factor_type === 'non_modifiable').map(rf => (
                    <div key={rf.id} className="editorial-card" style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{rf.title}</h4>
                        <span className="badge badge-subtle">{rf.impact_level} risk</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {rf.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: PREVENTION PILLARS */}
        {activeTab === 'prevention' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">04. The 5 Action Pillars</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                KNOW · WATCH · PREVENT · PREPARE · ACT
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Evidence-based checklist items. Check completed steps to save them directly to your personal Journey progress.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {preventionPillars.map(pillar => {
                const isCompleted = !!checklistProgress[pillar.id];
                return (
                  <div
                    key={pillar.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${isCompleted ? 'var(--success-border)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '24px',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-pine" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                          {pillar.pillar}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {pillar.title}
                        </h3>
                      </div>

                      <button
                        className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleToggleChecklistStep(pillar.id)}
                      >
                        {isCompleted ? <Check size={14} /> : null}
                        {isCompleted ? 'Step Completed' : 'Mark as Completed'}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                      {pillar.description}
                    </p>

                    <div style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '16px',
                      marginBottom: '14px'
                    }}>
                      <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>
                        ACTIONABLE CLINICAL PROTOCOL
                      </div>
                      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {pillar.actionable_steps.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    {pillar.target_metrics && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <strong>Target Clinical Metric:</strong> {pillar.target_metrics}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: MYTH VS FACT */}
        {activeTab === 'myths' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">05. Misconception Deconstruction</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                Condition-Specific Myths vs Facts
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Misconceptions delay diagnosis. Click any card to reveal the biological evidence.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {myths.map(m => {
                const isRevealed = !!revealedMyths[m.id];
                return (
                  <div
                    key={m.id}
                    className="editorial-card"
                    style={{ padding: '24px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span className="badge badge-danger">COMMON MYTH</span>
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{m.category}</span>
                    </div>

                    <h3 className="serif-display" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
                      "{m.myth}"
                    </h3>

                    {!isRevealed ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setRevealedMyths(prev => ({ ...prev, [m.id]: true }))}
                      >
                        <HelpCircle size={15} />
                        Reveal Verified Biological Fact
                      </button>
                    ) : (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="badge badge-pine">VERIFIED CLINICAL FACT</span>
                          <CheckCircle2 size={16} color="var(--success)" />
                        </div>

                        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {m.fact}
                        </p>

                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                          {m.explanation}
                        </p>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px' }}>
                          <strong>Clinical Evidence:</strong> {m.scientific_evidence}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: WHEN TO SEEK CARE */}
        {activeTab === 'care' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">06. Clinical Urgency Stratification</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                When to Seek Care
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Responsible threshold guidelines distinguishing routine review from acute emergency triggers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {seekCareGuidelines.map(g => (
                <div
                  key={g.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${
                      g.urgency === 'emergency' ? 'var(--danger-border)' :
                      g.urgency === 'prompt' ? 'var(--ochre-border)' : 'var(--border-subtle)'
                    }`,
                    borderLeft: `4px solid ${
                      g.urgency === 'emergency' ? 'var(--danger)' :
                      g.urgency === 'prompt' ? 'var(--ochre)' : 'var(--primary)'
                    }`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px 24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span className={`badge ${
                      g.urgency === 'emergency' ? 'badge-danger' :
                      g.urgency === 'prompt' ? 'badge-ochre' : 'badge-pine'
                    }`} style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                      {g.urgency} Action Level
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Trigger Scenario:
                    </strong>{' '}
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                      {g.trigger_condition}
                    </span>
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Recommended Action:
                    </strong>{' '}
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                      {g.recommended_action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: QUESTIONS TO ASK A DOCTOR */}
        {activeTab === 'doctor' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
              <div>
                <div className="editorial-kicker">07. Consultation Preparation</div>
                <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                  Questions to Ask Your Doctor
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  Add these clinically verified questions directly to your personal Doctor Discussion List.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('/doctor-discussion')}
              >
                View Your Doctor Discussion List
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {doctorQuestions.map(q => {
                const isAdded = !!addedQuestions[q.id];
                return (
                  <div key={q.id} className="editorial-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                      <span className="badge badge-subtle">{q.category}</span>
                      <button
                        className={`btn btn-sm ${isAdded ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleAddDoctorQuestion(q)}
                        disabled={isAdded}
                      >
                        {isAdded ? <Check size={14} /> : <Plus size={14} />}
                        {isAdded ? 'Added to Doctor List' : 'Add to My Doctor List'}
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      "{q.question}"
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                      <strong>Why ask this:</strong> {q.rationale}
                    </p>

                    <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                      When to discuss: {q.when_to_ask}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 8: RESOURCES */}
        {activeTab === 'resources' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-kicker">08. Authoritative References</div>
              <h2 className="serif-display" style={{ fontSize: '1.75rem' }}>
                Clinical Guidelines & Evidence Sources
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Published consensus papers, clinical screening guidelines, and patient education standards.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resources.map(res => (
                <div key={res.id} className="editorial-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-subtle">{res.resource_type}</span>
                    <span className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600 }}>{res.organization}</span>
                  </div>

                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {res.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {res.summary}
                  </p>

                  <a
                    href={res.url_reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Visit Guideline Registry
                    <ExternalLink size={13} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Educational Disclaimer */}
        <div style={{ marginTop: '48px' }}>
          <MedicalDisclaimer />
        </div>

      </div>
    </div>
  );
}
