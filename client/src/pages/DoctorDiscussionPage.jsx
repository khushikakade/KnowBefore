import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  MessageSquare, Plus, Trash2, Edit3, CheckSquare, Square, 
  Printer, ArrowRight, Check, AlertCircle, FileText, Sparkles 
} from 'lucide-react';

export default function DoctorDiscussionPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diseases, setDiseases] = useState([]);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newDiseaseId, setNewDiseaseId] = useState('');
  const [newPriority, setNewPriority] = useState('routine');

  // Notes state
  const [activeNotesId, setActiveNotesId] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const diseasesRes = await fetch('/api/diseases');
      if (diseasesRes.ok) {
        const dData = await diseasesRes.json();
        setDiseases(dData.diseases || []);
      }

      if (user) {
        const res = await fetch('/api/doctor-questions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || []);
          setTemplates(data.templates || []);
        }
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
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
          question: newQuestion,
          rationale: newRationale,
          disease_id: newDiseaseId ? parseInt(newDiseaseId) : null,
          priority: newPriority
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(prev => [data.question, ...prev]);
        setIsAdding(false);
        setNewQuestion('');
        setNewRationale('');
        setNewDiseaseId('');
        showToast('Question added to your consultation sheet.');
      }
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleToggleDiscussed = async (q) => {
    try {
      const nextStatus = !q.is_discussed;
      const res = await fetch(`/api/doctor-questions/${q.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({ is_discussed: nextStatus })
      });

      if (res.ok) {
        setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_discussed: nextStatus ? 1 : 0 } : item));
        showToast(nextStatus ? 'Marked as discussed with doctor.' : 'Unmarked discussed status.');
      }
    } catch (err) {
      console.error('Toggle discussed error:', err);
    }
  };

  const handleSaveNotes = async (qId) => {
    try {
      const res = await fetch(`/api/doctor-questions/${qId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({ doctor_notes: doctorNotes })
      });

      if (res.ok) {
        setQuestions(prev => prev.map(item => item.id === qId ? { ...item, doctor_notes: doctorNotes } : item));
        setActiveNotesId(null);
        showToast('Doctor notes saved.');
      }
    } catch (err) {
      console.error('Save notes error:', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      const res = await fetch(`/api/doctor-questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}` }
      });

      if (res.ok) {
        setQuestions(prev => prev.filter(item => item.id !== id));
        showToast('Question removed.');
      }
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  const handleAddFromTemplate = async (template) => {
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
          question: template.question,
          rationale: template.rationale,
          disease_id: template.disease_id,
          priority: 'routine'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(prev => [data.question, ...prev]);
        showToast('Clinical template imported.');
      }
    } catch (err) {
      console.error('Import template error:', err);
    }
  };

  return (
    <div className="doctor-discussion-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '28px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Clinical Preparation</div>
            <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
              Doctor Discussion List & Consultation Sheet
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Doctor visits are often brief and overwhelming. Organize high-yield diagnostic questions beforehand, eliminate consultation anxiety, and record doctor feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }} className="no-print">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Print Consultation Sheet
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAdding(!isAdding)}
            >
              <Plus size={15} />
              Add Custom Question
            </button>
          </div>
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

        {/* Add Question Form (Collapsed by default) */}
        {isAdding && (
          <form
            onSubmit={handleCreateQuestion}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              margin: '24px 0 32px',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="no-print"
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
              Add a New Question for Your Doctor
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is my target blood pressure range given my family history?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Clinical Rationale / Why you're asking
                </label>
                <input
                  type="text"
                  placeholder="e.g. Need to benchmark my home blood pressure tracking."
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Associated Condition (Optional)
                </label>
                <select
                  value={newDiseaseId}
                  onChange={(e) => setNewDiseaseId(e.target.value)}
                  className="input-field"
                >
                  <option value="">General Health Review</option>
                  {diseases.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '6px' }}>
                  Discussion Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="input-field"
                >
                  <option value="routine">Routine Check</option>
                  <option value="high">High Priority (Discuss First)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save to Discussion List
              </button>
            </div>
          </form>
        )}

        {/* Questions List */}
        {!user ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '40px 24px',
            textAlign: 'center',
            margin: '24px 0'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
              Sign In to Build Your Personal Doctor Discussion List
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 20px' }}>
              Save custom questions, mark items as discussed, record physician instructions, and print clean consultation worksheets.
            </p>
            <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
              Sign In or Try Clara Demo
            </button>
          </div>
        ) : loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading doctor discussion list...
          </div>
        ) : questions.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '48px 24px',
            textAlign: 'center',
            margin: '24px 0'
          }}>
            <FileText size={32} color="var(--border-strong)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '6px' }}>
              Your Doctor Discussion List is Empty
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px' }}>
              Click "Add Custom Question" above or choose recommended questions from the clinical templates below.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0 40px' }}>
            {questions.map(q => {
              const isDiscussed = q.is_discussed === 1;
              const isEditingNotes = activeNotesId === q.id;

              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${isDiscussed ? 'var(--border-subtle)' : q.priority === 'high' ? 'var(--accent-border)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '24px',
                    opacity: isDiscussed ? 0.75 : 1,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleToggleDiscussed(q)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          border: `2px solid ${isDiscussed ? 'var(--success)' : 'var(--border-strong)'}`,
                          backgroundColor: isDiscussed ? 'var(--success)' : 'transparent',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title={isDiscussed ? 'Marked as discussed' : 'Click to mark as discussed'}
                      >
                        {isDiscussed && <Check size={14} />}
                      </button>

                      <span className={`badge ${q.priority === 'high' ? 'badge-sienna' : 'badge-subtle'}`}>
                        {q.priority === 'high' ? 'High Priority' : 'Routine'}
                      </span>

                      {q.disease_name && (
                        <span className="badge badge-pine">{q.disease_name}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }} className="no-print">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          if (isEditingNotes) {
                            setActiveNotesId(null);
                          } else {
                            setActiveNotesId(q.id);
                            setDoctorNotes(q.doctor_notes || '');
                          }
                        }}
                      >
                        <Edit3 size={13} />
                        {q.doctor_notes ? 'Edit Notes' : 'Add Notes'}
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '1.1875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    textDecoration: isDiscussed ? 'line-through' : 'none'
                  }}>
                    "{q.question}"
                  </h3>

                  {q.rationale && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      <strong>Clinical Context:</strong> {q.rationale}
                    </p>
                  )}

                  {/* Existing Doctor Notes */}
                  {q.doctor_notes && !isEditingNotes && (
                    <div style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: '3px solid var(--primary)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '12px 16px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      marginTop: '12px'
                    }}>
                      <div className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>
                        NOTES FROM DOCTOR'S APPOINTMENT
                      </div>
                      <p style={{ lineHeight: 1.5, margin: 0 }}>{q.doctor_notes}</p>
                    </div>
                  )}

                  {/* Inline Edit Notes Form */}
                  {isEditingNotes && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }} className="no-print">
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                        Doctor's Advice & Answers:
                      </label>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Type notes given by your doctor during your consultation..."
                        className="input-field"
                        style={{ marginBottom: '10px' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setActiveNotesId(null)}>
                          Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveNotes(q.id)}>
                          Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CLINICAL TEMPLATES IMPORT SHELF */}
        {templates.length > 0 && (
          <div style={{
            marginTop: '48px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '32px'
          }} className="no-print">
            <div style={{ marginBottom: '20px' }}>
              <div className="editorial-kicker">Clinical Question Templates</div>
              <h2 className="serif-display" style={{ fontSize: '1.5rem', marginTop: '4px' }}>
                Recommended Evidence-Based Inquiries
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Import high-value questions authored by clinical specialists directly into your worksheet.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {templates.slice(0, 6).map(t => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-subtle">{t.disease_name}</span>
                      <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>{t.category}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.35 }}>
                      "{t.question}"
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                      {t.rationale}
                    </p>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAddFromTemplate(t)}
                  >
                    <Plus size={13} />
                    Import to Worksheet
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
