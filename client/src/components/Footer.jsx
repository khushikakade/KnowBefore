import React from 'react';
import { ShieldAlert, ExternalLink, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-subtle)',
      borderTop: '1px solid var(--border-medium)',
      padding: '48px 0 32px',
      marginTop: '64px'
    }}>
      <div className="app-container">
        
        {/* Top Editorial Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          
          {/* Brand & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                KNOWBEFORE
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              From Information to Awareness to Action. An interactive clinical education platform bridging evidence-based biological science and personal preventative agency.
            </p>
            <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              DISCOVER → UNDERSTAND → TEST → REMEMBER → PREVENT → ACT → TRACK
            </div>
          </div>

          {/* Core Product Modules */}
          <div>
            <div className="editorial-kicker" style={{ marginBottom: '12px' }}>Knowledge Architecture</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => onNavigate('/diseases')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Disease Library (10 Conditions)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/warning-signs')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Warning Sign Explorer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/myth-fact')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Myth vs Fact Interactive
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/awareness-check')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Awareness Checks & Evaluations
                </button>
              </li>
            </ul>
          </div>

          {/* Action Modules */}
          <div>
            <div className="editorial-kicker" style={{ marginBottom: '12px' }}>Personal Action</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => onNavigate('/prevention-checklist')} style={{ textAlign: 'left', color: 'inherit' }}>
                  5-Pillar Prevention Checklists
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/doctor-discussion')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Doctor Discussion Planner & Worksheet
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/campaigns')} style={{ textAlign: 'left', color: 'inherit' }}>
                  Public Health Action Campaigns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} style={{ textAlign: 'left', color: 'inherit' }}>
                  User Journey & Progress Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Sources & Methodology */}
          <div>
            <div className="editorial-kicker" style={{ marginBottom: '12px' }}>Clinical Reference Standards</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              All prevention parameters and physiological mechanisms are cross-referenced against published clinical practice guidelines:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-subtle">WHO Guidelines</span>
              <span className="badge badge-subtle">AHA / ACC 2023</span>
              <span className="badge badge-subtle">ADA Standards</span>
              <span className="badge badge-subtle">GINA Asthma</span>
              <span className="badge badge-subtle">USPSTF Screening</span>
            </div>
          </div>

        </div>

        {/* Detailed Medical Education Notice */}
        <div style={{
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          marginBottom: '28px'
        }}>
          <ShieldAlert size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Important Educational & Non-Diagnostic Disclaimer:</strong>{' '}
            KnowBefore is strictly an educational awareness platform. It is not designed to diagnose, treat, cure, or prevent any medical disease or health condition. Physiological symptoms and warning signals described herein may be associated with various differential diagnoses. Never disregard professional medical advice or delay seeking care because of information read on KnowBefore. In emergency situations, immediately dial your local emergency services (e.g. 911, 112, 999).
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} KnowBefore Public Health Platform. Designed for intentional human awareness.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Privacy & Content Integrity</span>
            <span>·</span>
            <span>Editorial Standards</span>
            <span>·</span>
            <span>Accessible WCAG 2.1 AA Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
