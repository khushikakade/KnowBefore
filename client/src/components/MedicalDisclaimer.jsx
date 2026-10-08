import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="disclaimer-strip">
        <div className="app-container disclaimer-inner">
          <ShieldAlert size={14} color="var(--accent)" />
          <span>
            <strong>Educational Notice:</strong> KnowBefore provides structured health education and awareness. We do not provide clinical medical diagnosis or treatment plans.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-subtle)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '4px solid var(--primary)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-md) var(--space-lg)',
      margin: 'var(--space-lg) 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <ShieldAlert size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Non-Diagnostic Public Health Notice
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            KnowBefore provides evidence-based educational information and risk awareness. It does not replace professional clinical evaluation, diagnosis, or treatment. Health signals can be associated with multiple physiological conditions. If you are experiencing concerning symptoms, please consult a qualified healthcare professional. In an acute medical emergency, call emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
