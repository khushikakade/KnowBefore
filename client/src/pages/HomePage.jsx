import React, { useState, useEffect } from 'react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  ArrowRight, Compass, ShieldAlert, CheckCircle2, HelpCircle, 
  Activity, Heart, Sparkles, BookOpen, UserCheck, Flame, ArrowUpRight
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const [featuredDiseases, setFeaturedDiseases] = useState([]);
  const [mythSample, setMythSample] = useState(null);
  const [mythRevealed, setMythRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [diseasesRes, mythsRes] = await fetch('/api/diseases?featured=true').then(r => r.json()),
              [mythsData] = await fetch('/api/myths').then(r => r.json()).then(d => [d.myths || []]);
        
        if (diseasesRes && diseasesRes.diseases) {
          setFeaturedDiseases(diseasesRes.diseases);
        }
        if (mythsData && mythsData.length > 0) {
          setMythSample(mythsData[0]);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const doorways = [
    {
      kicker: 'Physical Signals',
      label: 'Something feels different',
      sub: 'Explore physiological warning signs across energy, respiration, and metabolic rhythms.',
      path: '/warning-signs',
      accent: 'var(--accent)'
    },
    {
      kicker: 'Clinical Knowledge',
      label: 'I want to understand a disease',
      sub: 'Deep-dive into cellular mechanics, natural progression, and risk factors of 10 major conditions.',
      path: '/diseases',
      accent: 'var(--primary)'
    },
    {
      kicker: 'Self-Assessment',
      label: 'I want to test what I know',
      sub: 'Take an evidence-based awareness check with immediate rationales to expose blind spots.',
      path: '/awareness-check',
      accent: 'var(--ochre)'
    },
    {
      kicker: 'Evidence-Based Action',
      label: 'I want prevention tips',
      sub: 'Use the 5-pillar prevention framework: KNOW, WATCH, PREVENT, PREPARE, ACT.',
      path: '/prevention-checklist',
      accent: 'var(--sage)'
    },
    {
      kicker: 'Clinical Preparedness',
      label: 'I want to prepare for a doctor visit',
      sub: 'Assemble targeted diagnostic questions and export an appointment worksheet.',
      path: '/doctor-discussion',
      accent: 'var(--info)'
    }
  ];

  return (
    <div className="home-page">
      
      {/* Editorial Disclaimer Strip */}
      <MedicalDisclaimer compact />

      {/* Main Editorial Hero Statement */}
      <section style={{
        padding: '64px 0 48px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-canvas)'
      }}>
        <div className="app-container">
          
          <div style={{ maxWidth: '860px' }}>
            <div className="editorial-kicker" style={{ marginBottom: '14px' }}>
              Public Health Awareness Platform
            </div>

            <h1 className="serif-display" style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.12,
              color: 'var(--text-primary)',
              marginBottom: '24px',
              fontWeight: 400
            }}>
              Understand your health. <br />
              <em style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 400 }}>
                Before you have to.
              </em>
            </h1>

            <p style={{
              fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              marginBottom: '32px'
            }}>
              Most life-altering diseases do not announce themselves with acute alarms. They progress in subtle cellular increments. KnowBefore translates biological science into early awareness, non-alarmist recognition, and actionable prevention.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('/diseases')}
              >
                Explore Disease Library
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onNavigate('/warning-signs')}
              >
                Explore Warning Signs
              </button>
              <span className="mono-tag" style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                10 Evidence-Based Conditions
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: "What do you want to know?" — The 5 Distinctive Entry Points */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="app-container">
          
          <div style={{ marginBottom: '36px' }}>
            <div className="editorial-kicker">Interactive Starting Point</div>
            <h2 className="serif-display" style={{ fontSize: '2rem', marginTop: '4px' }}>
              What do you want to know?
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '6px' }}>
              Select where you are in your journey. We don't overwhelm you with medical textbooks; we begin with your question.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {doorways.map((d, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(d.path)}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${d.accent}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div className="editorial-kicker" style={{ color: d.accent, marginBottom: '8px' }}>
                    {d.kicker}
                  </div>
                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                    [ {d.label} ]
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {d.sub}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: d.accent
                }}>
                  <span>Enter pathway</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION: The 7-Step KnowBefore Journey */}
      <section style={{
        padding: '64px 0',
        backgroundColor: 'var(--bg-canvas)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="app-container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <div className="editorial-kicker">Product Philosophy</div>
            <h2 className="serif-display" style={{ fontSize: '2.25rem', marginTop: '4px', marginBottom: '12px' }}>
              Information is only useful when you understand it well enough to act.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              KnowBefore turns abstract health articles into an active 7-stage learning and prevention continuum:
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {[
              { step: '01', title: 'DISCOVER', desc: 'Notice early subtle physical clues' },
              { step: '02', title: 'UNDERSTAND', desc: 'Learn biological mechanics & risks' },
              { step: '03', title: 'TEST', desc: 'Assess knowledge baseline in quizzes' },
              { step: '04', title: 'REMEMBER', desc: 'Debunk stubborn health myths' },
              { step: '05', title: 'PREVENT', desc: 'Adopt 5-pillar daily action checklists' },
              { step: '06', title: 'ACT', desc: 'Formulate questions for your physician' },
              { step: '07', title: 'TRACK', desc: 'Monitor personal awareness growth' }
            ].map((st, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px 16px',
                  textAlign: 'left'
                }}
              >
                <div className="mono-tag" style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '6px' }}>
                  {st.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {st.desc}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION: Editorial Spotlight — "The Silent Progression of Hypertension" */}
      <section style={{ padding: '64px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="app-container">
          
          <div style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-inverse)',
            borderRadius: 'var(--radius-md)',
            padding: 'clamp(32px, 5vw, 56px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '720px' }}>
              <div className="editorial-kicker" style={{ color: '#E8C170', marginBottom: '12px' }}>
                Clinical Spotlight Feature
              </div>

              <h2 className="serif-display" style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                color: 'var(--text-inverse)',
                lineHeight: 1.2,
                marginBottom: '16px',
                fontWeight: 400
              }}>
                The Silent Vascular Surge: <br />
                Why Blood Pressure Gives No Daily Warning
              </h2>

              <blockquote className="serif-display" style={{
                fontSize: '1.25rem',
                fontStyle: 'italic',
                color: '#D4E2D9',
                borderLeft: '3px solid #E8C170',
                paddingLeft: '16px',
                margin: '20px 0 24px'
              }}>
                "46% of adults living with hypertension have no idea their arterial walls are sustaining chronic hydrostatic micro-scars. Blood pressure does not itch, ache, or announce itself until end-organ damage manifests."
              </blockquote>

              <p style={{ fontSize: '0.9375rem', color: '#B6CBBF', lineHeight: 1.6, marginBottom: '28px' }}>
                Explore how high resting pressure develops, how to execute a clinically verified 7-day home cuff protocol, and what questions you must bring to your next routine appointment.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  className="btn btn-accent btn-md"
                  onClick={() => onNavigate('/diseases/hypertension')}
                >
                  Read Guided Condition Deep Dive
                  <ArrowRight size={16} />
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onClick={() => onNavigate('/awareness-check')}
                >
                  Take 5-Min Cardiovascular Quiz
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: Interactive Myth vs Fact Spotlight */}
      {mythSample && (
        <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-canvas)' }}>
          <div className="app-container">
            
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div className="editorial-kicker">Interactive Misconception Buster</div>
                <h2 className="serif-display" style={{ fontSize: '2rem', marginTop: '4px' }}>
                  Test your assumptions before they shape your habits.
                </h2>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '32px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span className="badge badge-danger">COMMON MYTH</span>
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{mythSample.category}</span>
                </div>

                <div className="serif-display" style={{ fontSize: '1.375rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                  "{mythSample.myth}"
                </div>

                {!mythRevealed ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setMythRevealed(true)}
                  >
                    <HelpCircle size={15} />
                    Reveal Verified Clinical Fact
                  </button>
                ) : (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-subtle)',
                    animation: 'fadeIn 300ms ease-in-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span className="badge badge-pine">VERIFIED CLINICAL FACT</span>
                      <CheckCircle2 size={16} color="var(--success)" />
                    </div>

                    <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                      {mythSample.fact}
                    </p>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                      {mythSample.explanation}
                    </p>

                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px dashed var(--border-subtle)',
                      paddingTop: '8px'
                    }}>
                      <strong>Clinical Evidence Citation:</strong> {mythSample.scientific_evidence}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('/myth-fact')}
                      >
                        Explore All 10 Myth vs Fact Studies
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </section>
      )}

      {/* SECTION: Featured Disease Grid Preview */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="app-container">
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div>
              <div className="editorial-kicker">Library Catalog</div>
              <h2 className="serif-display" style={{ fontSize: '2rem', marginTop: '4px' }}>
                Featured Conditions
              </h2>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('/diseases')}
            >
              Browse Complete Catalog (10 Conditions)
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {featuredDiseases.map(d => (
              <div
                key={d.id}
                onClick={() => onNavigate(`/diseases/${d.slug}`)}
                className="editorial-card"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-subtle">{d.category}</span>
                    <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{d.anatomical_system}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {d.name}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {d.headline}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                    Key Metric: {d.key_stat}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--primary)' }}>
                    <span>Explore guided condition</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION: Community Campaign Banner */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-canvas)' }}>
        <div className="app-container">
          
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '36px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}>
            <div style={{ maxWidth: '640px' }}>
              <div className="editorial-kicker" style={{ color: 'var(--accent)' }}>Active Public Initiative</div>
              <h3 className="serif-display" style={{ fontSize: '1.75rem', marginTop: '4px', marginBottom: '8px' }}>
                Under Pressure: Know Your Numbers Campaign
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Join 4,820 community participants committed to completing a 7-day home blood pressure log and sharing target questions with their healthcare provider.
              </p>
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('/campaigns/know-your-numbers')}
              >
                Join Initiative & Take Pledge
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Medical Notice */}
      <div className="app-container" style={{ paddingBottom: '24px' }}>
        <MedicalDisclaimer />
      </div>

    </div>
  );
}
