import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, 
  HelpCircle, Award, BarChart2, Check, AlertCircle 
} from 'lucide-react';

export default function AwarenessCheckPage({ onNavigate }) {
  const { user, setAuthModalOpen } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confirmedAnswers, setConfirmedAnswers] = useState({});
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        if (data.quizzes?.length > 0) {
          startQuiz(data.quizzes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data.quiz);
        setQuizData(data.questions || []);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setConfirmedAnswers({});
        setSnapshot(null);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    // If already confirmed for this question, don't allow changing
    if (confirmedAnswers[questionId]) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleConfirmAnswer = (questionId) => {
    setConfirmedAnswers(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('knowbefore_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: selectedAnswers })
      });

      if (res.ok) {
        const data = await res.json();
        setSnapshot(data);
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
    }
  };

  const restartCurrentQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setConfirmedAnswers({});
    setSnapshot(null);
  };

  const currentQ = quizData?.[currentIndex];
  const isCurrentConfirmed = currentQ ? !!confirmedAnswers[currentQ.id] : false;
  const currentSelectedOpt = currentQ ? selectedAnswers[currentQ.id] : null;

  return (
    <div className="awareness-check-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          <div className="editorial-kicker" style={{ marginBottom: '8px' }}>Interactive Self-Assessment</div>
          <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15, marginBottom: '16px' }}>
            Awareness Check
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Educational knowledge evaluation. Discover what you truly know about physiological signs, risk factors, and evidence-based prevention without clinical grading pressure.
          </p>
        </div>

        <MedicalDisclaimer compact />

        {/* Quiz Selector Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '24px 0 32px' }}>
          {quizzes.map(q => (
            <button
              key={q.id}
              onClick={() => startQuiz(q.id)}
              className={`btn btn-sm ${activeQuiz?.id === q.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {q.title}
            </button>
          ))}
        </div>

        {/* QUIZ INTERFACE OR SNAPSHOT RESULTS */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading awareness check questions...
          </div>
        ) : snapshot ? (
          /* ==============================================================
             YOUR AWARENESS SNAPSHOT (Final Educational Results)
             ============================================================== */
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: 'clamp(24px, 4vw, 44px)',
            maxWidth: '840px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="editorial-kicker" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
                Evaluation Complete
              </div>
              <h2 className="serif-display" style={{ fontSize: '2.25rem', marginBottom: '8px' }}>
                Your Awareness Snapshot
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
                {snapshot.summaryMessage}
              </p>
            </div>

            {/* Score & Key Metric */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '36px'
            }}>
              <div>
                <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>SCORE</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>
                  {snapshot.score} / {snapshot.totalQuestions}
                </div>
              </div>
              <div>
                <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>ACCURACY</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>
                  {snapshot.percentage}%
                </div>
              </div>
              <div>
                <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>PERSPECTIVE</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                  Educational Awareness
                </div>
              </div>
            </div>

            {/* Categorical Breakdown Bars */}
            <div style={{ marginBottom: '36px' }}>
              <div className="editorial-kicker" style={{ marginBottom: '16px' }}>Domain Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(snapshot.categoryStats).map(([cat, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                          {stats.correct} / {stats.total} ({pct}%)
                        </span>
                      </div>
                      <div style={{
                        height: '10px',
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-pill)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--ochre)' : 'var(--accent)',
                          transition: 'width 600ms ease-in-out'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Steps Road map */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <button className="btn btn-secondary" onClick={restartCurrentQuiz}>
                <RotateCcw size={16} />
                Retake This Quiz
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('/prevention-checklist')}>
                  Go to Prevention Checklists
                </button>
                <button className="btn btn-primary" onClick={() => onNavigate('/dashboard')}>
                  View in Your Journey Dashboard
                </button>
              </div>
            </div>

          </div>
        ) : currentQ ? (
          /* ==============================================================
             ACTIVE QUESTION INTERACTION
             ============================================================== */
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: '780px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)'
          }}>
            
            {/* Progress Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="mono-tag" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                QUESTION {currentIndex + 1} OF {quizData.length}
              </span>
              <span className="badge badge-subtle">{currentQ.category}</span>
            </div>

            <div style={{
              height: '4px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '2px',
              marginBottom: '28px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / quizData.length) * 100}%`,
                backgroundColor: 'var(--primary)',
                transition: 'width 250ms ease-out'
              }} />
            </div>

            {/* Question Text */}
            <h2 className="serif-display" style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.625rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginBottom: '28px'
            }}>
              {currentQ.question_text}
            </h2>

            {/* Answer Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {currentQ.options.map((opt) => {
                const isSelected = currentSelectedOpt === opt.id;
                const isCorrect = opt.is_correct === 1;

                let borderStyle = '1px solid var(--border-subtle)';
                let bgStyle = 'var(--bg-canvas)';

                if (isSelected && !isCurrentConfirmed) {
                  borderStyle = '2px solid var(--primary)';
                  bgStyle = 'var(--primary-light)';
                } else if (isCurrentConfirmed) {
                  if (isCorrect) {
                    borderStyle = '2px solid var(--success)';
                    bgStyle = 'var(--success-light)';
                  } else if (isSelected && !isCorrect) {
                    borderStyle = '2px solid var(--danger)';
                    bgStyle = 'var(--danger-light)';
                  }
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-sm)',
                      border: borderStyle,
                      backgroundColor: bgStyle,
                      cursor: isCurrentConfirmed ? 'default' : 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                      {opt.option_text}
                    </span>

                    {isCurrentConfirmed && isCorrect && (
                      <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                    )}
                    {isCurrentConfirmed && isSelected && !isCorrect && (
                      <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Educational Explanation Box (Shown once confirmed) */}
            {isCurrentConfirmed && (
              <div style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '18px 20px',
                marginBottom: '28px',
                animation: 'fadeIn 200ms ease-in-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <HelpCircle size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Why this matters clinically:
                  </strong>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {currentQ.options.find(o => o.id === currentSelectedOpt)?.explanation || currentQ.rationale_correct}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!isCurrentConfirmed ? (
                <button
                  className="btn btn-primary"
                  onClick={() => handleConfirmAnswer(currentQ.id)}
                  disabled={!currentSelectedOpt}
                >
                  Confirm Answer & Read Biological Rationale
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  {currentIndex < quizData.length - 1 ? 'Next Question' : 'View Awareness Snapshot'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>No questions available.</div>
        )}

      </div>
    </div>
  );
}
