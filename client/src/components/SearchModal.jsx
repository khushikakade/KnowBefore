import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, AlertCircle, HelpCircle, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ diseases: [], warningSigns: [], myths: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const recentSearches = ['Hypertension', 'Insulin resistance', 'Nocturnal cough', 'Blood pressure numbers'];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ diseases: [], warningSigns: [], myths: [] });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ diseases: [], warningSigns: [], myths: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.diseases.length + results.warningSigns.length + results.myths.length;
  const hasQuery = query.trim().length >= 2;

  const handleSelect = (path) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(21, 24, 22, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '80px 16px 20px',
      zIndex: 9999
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-canvas)'
        }}>
          <Search size={20} color="var(--primary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conditions, warning signs, myths, or prevention guidelines..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.0625rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
          <span className="mono-tag" style={{
            padding: '2px 6px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-muted)',
            fontSize: '0.6875rem'
          }}>
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div style={{ maxHeight: '480px', overflowY: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Searching clinical knowledge base...
            </div>
          )}

          {!loading && !hasQuery && (
            <div>
              <div className="editorial-kicker" style={{ marginBottom: '10px' }}>Recent Searches</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(s)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="editorial-kicker" style={{ marginBottom: '10px' }}>Quick Pathways</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <button
                  onClick={() => handleSelect('/warning-signs')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    textAlign: 'left',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Warning Sign Explorer</span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </button>
                <button
                  onClick={() => handleSelect('/awareness-check')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    textAlign: 'left',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Awareness Check</span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </button>
                <button
                  onClick={() => handleSelect('/doctor-discussion')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    textAlign: 'left',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Doctor Discussion List</span>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </button>
              </div>
            </div>
          )}

          {!loading && hasQuery && totalResults === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No direct matches for "{query}"
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
                Try searching by anatomical system, general symptom (e.g. fatigue, blood pressure, thirst), or browse our library directly.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => handleSelect('/diseases')}>
                Browse All Conditions
              </button>
            </div>
          )}

          {!loading && hasQuery && totalResults > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Diseases results */}
              {results.diseases.length > 0 && (
                <div>
                  <div className="editorial-kicker" style={{ marginBottom: '8px' }}>
                    Conditions ({results.diseases.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.diseases.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect(`/diseases/${d.slug}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BookOpen size={16} color="var(--primary)" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                              {d.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {d.category} · {d.headline}
                            </div>
                          </div>
                        </div>
                        <span className="mono-tag" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View <CornerDownLeft size={12} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning signs results */}
              {results.warningSigns.length > 0 && (
                <div>
                  <div className="editorial-kicker" style={{ marginBottom: '8px' }}>
                    Warning Signs ({results.warningSigns.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.warningSigns.map(ws => (
                      <div
                        key={ws.id}
                        onClick={() => handleSelect(`/warning-signs?highlight=${ws.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AlertCircle size={16} color={ws.is_red_flag ? 'var(--danger)' : 'var(--accent)'} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                              {ws.sign_name}
                              {ws.is_red_flag === 1 && (
                                <span className="badge badge-danger" style={{ marginLeft: '8px' }}>Red Flag</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Associated with {ws.disease_name} ({ws.category})
                            </div>
                          </div>
                        </div>
                        <CornerDownLeft size={12} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Myths results */}
              {results.myths.length > 0 && (
                <div>
                  <div className="editorial-kicker" style={{ marginBottom: '8px' }}>
                    Misconceptions & Facts ({results.myths.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.myths.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect('/myth-fact')}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <HelpCircle size={16} color="var(--ochre)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              {m.myth}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                              {m.fact}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>Press ESC or click outside to dismiss</span>
          <span>KnowBefore Educational Search</span>
        </div>
      </div>
    </div>
  );
}
