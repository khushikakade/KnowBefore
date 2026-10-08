import React, { useState, useEffect } from 'react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  AlertCircle, ShieldAlert, ArrowRight, CheckCircle2, 
  HelpCircle, Search, Filter, BookOpen, ExternalLink, Activity
} from 'lucide-react';

export default function WarningSignExplorerPage({ onNavigate }) {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSign, setActiveSign] = useState(null);

  const categories = [
    { id: 'All', label: 'All Signals' },
    { id: 'energy', label: 'Energy & Fatigue' },
    { id: 'cardiovascular', label: 'Cardiovascular & Chest' },
    { id: 'metabolic', label: 'Metabolic & Thirst' },
    { id: 'respiratory', label: 'Respiratory & Cough' },
    { id: 'pain', label: 'Pain & Discomfort' },
    { id: 'physical', label: 'Skin & Physical Changes' },
    { id: 'cognitive', label: 'Cognitive & Mood' }
  ];

  const stages = ['All', 'early', 'progressive', 'emergency'];

  useEffect(() => {
    fetchWarningSigns();
  }, [selectedCategory, selectedStage]);

  const fetchWarningSigns = async () => {
    setLoading(true);
    try {
      let url = '/api/warning-signs?';
      if (selectedCategory !== 'All') url += `category=${selectedCategory}&`;
      if (selectedStage !== 'All') url += `stage=${selectedStage}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSigns(data.signs || []);
        if (data.signs?.length > 0 && !activeSign) {
          setActiveSign(data.signs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load warning signs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = signs.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.sign_name.toLowerCase().includes(q) ||
           s.description.toLowerCase().includes(q) ||
           s.biological_mechanism.toLowerCase().includes(q) ||
           s.disease_name.toLowerCase().includes(q);
  });

  return (
    <div className="warning-signs-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Signal Decoupling & Exploration</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            Warning Sign Explorer
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Explore what bodily cues signify in biological terms. Learn why subtle physical alterations emerge, their clinical mechanics, and what non-alarmist next steps to take.
          </p>
        </div>

        <MedicalDisclaimer compact />

        {/* Filter Toolbar */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          margin: '24px 0 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Search & Stage Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search signs, physical sensations, or biological terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>Stage:</span>
              {stages.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedStage(st)}
                  className={`btn btn-sm ${selectedStage === st ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                  backgroundColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-canvas)',
                  color: selectedCategory === cat.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Interactive Exploration Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)',
          gap: '24px',
          alignItems: 'start'
        }} className="explorer-grid">
          
          {/* Left Column: Interactive Signs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '720px', overflowY: 'auto', paddingRight: '6px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading warning signs...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                No signs match your filter.
              </div>
            ) : (
              filtered.map(sign => {
                const isSelected = activeSign?.id === sign.id;
                return (
                  <div
                    key={sign.id}
                    onClick={() => setActiveSign(sign)}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      borderLeft: `4px solid ${sign.is_red_flag ? 'var(--danger)' : isSelected ? 'var(--primary)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{sign.category}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {sign.is_red_flag === 1 && (
                          <span className="badge badge-danger">Red Flag</span>
                        )}
                        <span className="badge badge-subtle">{sign.stage}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {sign.sign_name}
                    </h3>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {sign.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                      <span>Associated with {sign.disease_name}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Deep-Dive Signal Inspector */}
          {activeSign ? (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid ${activeSign.is_red_flag ? 'var(--danger-border)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 'clamp(24px, 3vw, 36px)',
              position: 'sticky',
              top: '90px'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge badge-pine">{activeSign.category}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-subtle">Progression: {activeSign.stage}</span>
                  {activeSign.is_red_flag === 1 && (
                    <span className="badge badge-danger">Emergency Flag</span>
                  )}
                </div>
              </div>

              <h2 className="serif-display" style={{ fontSize: '1.875rem', color: 'var(--text-primary)', marginBottom: '14px' }}>
                {activeSign.sign_name}
              </h2>

              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                {activeSign.description}
              </p>

              {/* Explicit Responsible Non-Diagnostic Notice */}
              <div style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid var(--accent)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '24px'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Important Non-Diagnostic Context:</strong>{' '}
                This physical cue can be associated with several different health conditions. Experiencing this does not mean you have a specific illness. Only a qualified physician can provide an accurate differential diagnosis.
              </div>

              {/* Biological Mechanism Card */}
              <div style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px',
                marginBottom: '18px'
              }}>
                <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
                  WHAT OCCURS IN THE BODY (BIOLOGICAL MECHANISM)
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {activeSign.biological_mechanism}
                </p>
              </div>

              {/* Clinical Significance */}
              <div style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px',
                marginBottom: '24px'
              }}>
                <div className="mono-tag" style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '6px' }}>
                  WHY EARLY RECOGNITION MATTERS
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {activeSign.clinical_significance}
                </p>
              </div>

              {/* Recommended Action & Deep Links */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div className="mono-tag" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                    RECOMMENDED RESPONSIBLE NEXT STEP
                  </div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {activeSign.what_to_do}
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate(`/diseases/${activeSign.disease_slug}`)}
                  >
                    <BookOpen size={14} />
                    Explore {activeSign.disease_name} Detail
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate('/doctor-discussion')}
                  >
                    Add Questions to Doctor Planner
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              Select a signal on the left to inspect its biological mechanism.
            </div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .explorer-grid {
            grid-templateColumns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
