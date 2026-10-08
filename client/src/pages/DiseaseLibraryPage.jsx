import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  Search, Bookmark, BookmarkCheck, ArrowRight, LayoutGrid, ListFilter, 
  ExternalLink, Sparkles, Filter 
} from 'lucide-react';

export default function DiseaseLibraryPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [savedMap, setSavedMap] = useState({});

  const categories = [
    'All',
    'Cardiovascular',
    'Metabolic & Endocrine',
    'Respiratory',
    'Infectious',
    'Women\'s Health',
    'Oncology',
    'Mental Health',
    'Renal'
  ];

  useEffect(() => {
    fetchDiseases();
  }, [selectedCategory]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'All' 
        ? '/api/diseases' 
        : `/api/diseases?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDiseases(data.diseases || []);

        const initialSaved = {};
        (data.diseases || []).forEach(d => {
          if (d.is_saved) initialSaved[d.id] = true;
        });
        setSavedMap(initialSaved);
      }
    } catch (err) {
      console.error('Failed to load diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e, diseaseId) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/dashboard/saved-diseases/${diseaseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedMap(prev => ({
          ...prev,
          [diseaseId]: data.is_saved
        }));
      }
    } catch (err) {
      console.error('Toggle save error:', err);
    }
  };

  const filtered = diseases.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || 
           d.headline.toLowerCase().includes(q) || 
           d.anatomical_system.toLowerCase().includes(q) ||
           d.category.toLowerCase().includes(q);
  });

  return (
    <div className="disease-library-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '780px', marginBottom: '32px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Knowledge Catalog</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            Disease Library & Clinical Foundations
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Explore verified biological overviews, cellular mechanics, risk factors, and prevention frameworks across 10 major chronic, infectious, and metabolic conditions.
          </p>
        </div>

        <MedicalDisclaimer compact />

        {/* Filter & Search Bar */}
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
          {/* Top Row: Search & View Toggle */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, anatomical system, or biological topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono-tag" style={{ color: 'var(--text-muted)', marginRight: '4px' }}>
                {filtered.length} condition{filtered.length === 1 ? '' : 's'}
              </span>
              <button
                className={`btn btn-sm ${viewMode === 'cards' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setViewMode('cards')}
                title="Card Grid View"
              >
                <LayoutGrid size={15} />
                Cards
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
                title="Index Table View"
              >
                <ListFilter size={15} />
                Index Table
              </button>
            </div>
          </div>

          {/* Bottom Row: Category Chips */}
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

        {/* Content Listing */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading clinical entries...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '8px' }}>No conditions matched your filter</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Try searching with another keyword or resetting the category filter to "All".
            </p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {filtered.map(d => {
              const isSaved = !!savedMap[d.id];
              return (
                <div
                  key={d.id}
                  onClick={() => onNavigate(`/diseases/${d.slug}`)}
                  className="editorial-card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge badge-subtle">{d.category}</span>
                      <button
                        onClick={(e) => handleToggleSave(e, d.id)}
                        style={{
                          color: isSaved ? 'var(--accent)' : 'var(--text-muted)',
                          padding: '4px'
                        }}
                        title={isSaved ? 'Bookmarked in your library' : 'Save to your library'}
                      >
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.25 }}>
                      {d.name}
                    </h2>

                    <div className="mono-tag" style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                      {d.anatomical_system}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                      {d.headline}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Global Prevalence: <strong style={{ color: 'var(--text-secondary)' }}>{d.prevalence}</strong>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary)'
                    }}>
                      <span>Explore 8-Section Module</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Condition</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>System</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Global Prevalence</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Key Clinical Insight</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => onNavigate(`/diseases/${d.slug}`)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-canvas)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {d.name}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-subtle">{d.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {d.anatomical_system}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {d.prevalence}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                      {d.key_stat}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); onNavigate(`/diseases/${d.slug}`); }}
                      >
                        Explore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
