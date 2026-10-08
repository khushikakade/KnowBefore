import React, { useState, useEffect } from 'react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { HelpCircle, CheckCircle2, Search, ArrowRight, BookOpen, Sparkles, RefreshCw } from 'lucide-react';

export default function MythVsFactPage({ onNavigate }) {
  const [myths, setMyths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState({});

  const categories = [
    'All',
    'Cardiovascular',
    'Metabolic',
    'Women\'s Health',
    'Respiratory',
    'Infectious',
    'Oncology',
    'Renal'
  ];

  useEffect(() => {
    fetchMyths();
  }, [selectedCategory]);

  const fetchMyths = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'All'
        ? '/api/myths'
        : `/api/myths?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMyths(data.myths || []);
      }
    } catch (err) {
      console.error('Failed to load myths:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id) => {
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const revealAll = () => {
    const all = {};
    myths.forEach(m => { all[m.id] = true; });
    setRevealedIds(all);
  };

  const hideAll = () => {
    setRevealedIds({});
  };

  const filtered = myths.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.myth.toLowerCase().includes(q) ||
           m.fact.toLowerCase().includes(q) ||
           m.explanation.toLowerCase().includes(q) ||
           m.category.toLowerCase().includes(q);
  });

  return (
    <div className="myth-fact-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Misconception Deconstruction</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            Myth vs Fact Interactive
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Health misinformation often circulates faster than clinical evidence. Interactively reveal the biological facts behind common disease misconceptions.
          </p>
        </div>

        <MedicalDisclaimer compact />

        {/* Toolbar */}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search misconceptions or scientific topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={revealAll}>
                Reveal All
              </button>
              <button className="btn btn-ghost btn-sm" onClick={hideAll}>
                Reset Cards
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-canvas)',
                  color: selectedCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Myths Stream */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading verified studies...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            No myths found for this selection.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filtered.map(m => {
              const isRevealed = !!revealedIds[m.id];
              return (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'clamp(20px, 3vw, 32px)',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-danger">WIDESPREAD MYTH</span>
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{m.category}</span>
                    </div>

                    <button
                      className={`btn btn-sm ${isRevealed ? 'btn-ghost' : 'btn-secondary'}`}
                      onClick={() => toggleReveal(m.id)}
                    >
                      {isRevealed ? 'Hide Fact' : 'Reveal Verified Fact'}
                    </button>
                  </div>

                  <h3 className="serif-display" style={{
                    fontSize: 'clamp(1.1875rem, 2.5vw, 1.4375rem)',
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                    fontWeight: 400,
                    lineHeight: 1.3
                  }}>
                    "{m.myth}"
                  </h3>

                  {/* Elegant Unfolding Fact Reveal */}
                  {isRevealed && (
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '20px',
                      animation: 'fadeIn 250ms ease-in-out'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-pine">VERIFIED CLINICAL FACT</span>
                        <CheckCircle2 size={16} color="var(--success)" />
                      </div>

                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                        {m.fact}
                      </h4>

                      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                        {m.explanation}
                      </p>

                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px dashed var(--border-subtle)',
                        paddingTop: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span>
                          <strong>Clinical Evidence:</strong> {m.scientific_evidence}
                        </span>

                        {m.disease_slug && (
                          <button
                            onClick={() => onNavigate(`/diseases/${m.disease_slug}`)}
                            style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Explore related condition <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
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
