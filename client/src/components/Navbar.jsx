import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, BookOpen, CheckSquare, MessageSquare, BarChart2, Shield, Menu, X, ChevronDown, UserCircle, LogOut } from 'lucide-react';

export default function Navbar({ currentPath, onNavigate, onOpenSearch }) {
  const { user, logout, setAuthModalOpen, setAuthMode, loginWithDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNav = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const navLinks = [
    { label: 'Explore', path: '/diseases', icon: Compass, sub: 'Library & Signs' },
    { label: 'Warning Signs', path: '/warning-signs', icon: Compass },
    { label: 'Awareness Check', path: '/awareness-check', icon: BookOpen },
    { label: 'Myth vs Fact', path: '/myth-fact', icon: BookOpen },
    { label: 'Prevention', path: '/prevention-checklist', icon: CheckSquare },
    { label: 'Doctor Planner', path: '/doctor-discussion', icon: MessageSquare },
    { label: 'Campaigns', path: '/campaigns', icon: Compass },
    { label: 'Your Journey', path: '/dashboard', icon: BarChart2 }
  ];

  return (
    <header style={{
      backgroundColor: 'var(--bg-canvas)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        
        {/* Brand Masthead */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', cursor: 'pointer' }} onClick={() => handleNav('/')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent)',
              borderRadius: '2px'
            }} />
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4375rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}>
              KNOWBEFORE
            </span>
          </div>
          <span className="editorial-kicker" style={{
            display: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.6875rem'
          }}>
            Awareness to Action
          </span>
        </div>

        {/* Desktop Primary Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          <button
            onClick={() => handleNav('/diseases')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath.startsWith('/diseases') ? 600 : 500,
              color: currentPath.startsWith('/diseases') ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath.startsWith('/diseases') ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Disease Library
          </button>

          <button
            onClick={() => handleNav('/warning-signs')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/warning-signs' ? 600 : 500,
              color: currentPath === '/warning-signs' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/warning-signs' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Warning Signs
          </button>

          <button
            onClick={() => handleNav('/myth-fact')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/myth-fact' ? 600 : 500,
              color: currentPath === '/myth-fact' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/myth-fact' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Myth vs Fact
          </button>

          <button
            onClick={() => handleNav('/awareness-check')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/awareness-check' ? 600 : 500,
              color: currentPath === '/primary' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/awareness-check' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Awareness Check
          </button>

          <button
            onClick={() => handleNav('/prevention-checklist')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/prevention-checklist' ? 600 : 500,
              color: currentPath === '/prevention-checklist' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/prevention-checklist' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Checklists
          </button>

          <button
            onClick={() => handleNav('/doctor-discussion')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/doctor-discussion' ? 600 : 500,
              color: currentPath === '/doctor-discussion' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/doctor-discussion' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Doctor Planner
          </button>

          <button
            onClick={() => handleNav('/campaigns')}
            style={{
              padding: '8px 12px',
              fontSize: '0.875rem',
              fontWeight: currentPath === '/campaigns' ? 600 : 500,
              color: currentPath === '/campaigns' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: currentPath === '/campaigns' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            Campaigns
          </button>

          {user && (
            <button
              onClick={() => handleNav('/dashboard')}
              style={{
                padding: '8px 12px',
                fontSize: '0.875rem',
                fontWeight: currentPath === '/dashboard' ? 600 : 500,
                color: currentPath === '/dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: currentPath === '/dashboard' ? '2px solid var(--primary)' : '2px solid transparent'
              }}
            >
              Your Journey
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNav('/admin')}
              style={{
                padding: '8px 12px',
                fontSize: '0.875rem',
                fontWeight: currentPath === '/admin' ? 600 : 500,
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Shield size={14} />
              Admin
            </button>
          )}
        </nav>

        {/* Right Actions: Search trigger, Role Badge & User Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem'
            }}
            title="Search clinical knowledge base (Ctrl+K)"
          >
            <Search size={15} color="var(--primary)" />
            <span style={{ display: 'none' }} className="search-label">Search...</span>
            <span className="mono-tag" style={{
              padding: '1px 5px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.625rem',
              color: 'var(--text-muted)'
            }}>
              Ctrl K
            </span>
          </button>

          {/* User profile dropdown / Demo role switch */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: user.avatar_color || 'var(--primary)',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </span>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name?.split(' ')[0]}
                </span>
                <span className={`badge ${user.role === 'admin' ? 'badge-sienna' : 'badge-pine'}`} style={{ fontSize: '0.625rem' }}>
                  {user.role}
                </span>
                <ChevronDown size={12} color="var(--text-muted)" />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                >
                  Join Free
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '240px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 0',
                zIndex: 2000
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <button
                    onClick={() => handleNav('/dashboard')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <BarChart2 size={14} color="var(--primary)" />
                    Personal Journey Dashboard
                  </button>

                  <button
                    onClick={() => handleNav('/doctor-discussion')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={14} color="var(--primary)" />
                    Doctor Discussion List
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNav('/admin')}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--accent)'
                      }}
                    >
                      <Shield size={14} color="var(--accent)" />
                      Admin Management Console
                    </button>
                  )}
                </div>

                {/* Reviewer Quick Role Switcher */}
                <div style={{
                  padding: '8px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)'
                }}>
                  <div className="mono-tag" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    SWITCH ROLE DEMO
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { loginWithDemo('user'); setUserMenuOpen(false); }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.6875rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: user.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                        color: user.role === 'user' ? 'white' : 'inherit'
                      }}
                    >
                      Clara
                    </button>
                    <button
                      onClick={() => { loginWithDemo('admin'); setUserMenuOpen(false); }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.6875rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: user.role === 'admin' ? 'var(--primary)' : 'var(--bg-surface)',
                        color: user.role === 'admin' ? 'white' : 'inherit'
                      }}
                    >
                      Dr. Thorne
                    </button>
                    <button
                      onClick={() => { loginWithDemo('guest'); setUserMenuOpen(false); }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.6875rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    >
                      Guest
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--danger)'
                    }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
            style={{ display: 'inline-flex', padding: '6px' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNav(link.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                textAlign: 'left',
                backgroundColor: currentPath === link.path ? 'var(--bg-subtle)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                fontWeight: currentPath === link.path ? 600 : 500,
                fontSize: '0.9375rem'
              }}
            >
              <link.icon size={16} color="var(--primary)" />
              {link.label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNav('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                textAlign: 'left',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }}
            >
              <Shield size={16} color="var(--accent)" />
              Admin Console
            </button>
          )}
        </div>
      )}

      {/* CSS Helper for Responsive Navbar */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .search-label { display: inline !important; }
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
}
