import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { 
  Shield, Users, BookOpen, HelpCircle, CheckSquare, MessageSquare, 
  BarChart2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function AdminDashboardPage({ onNavigate }) {
  const { user, loginWithDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'diseases' | 'campaigns' | 'submissions'
  const [adminData, setAdminData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // New Disease Form
  const [showNewDisease, setShowNewDisease] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState({
    name: '',
    slug: '',
    category: 'Cardiovascular',
    headline: '',
    overview: '',
    anatomical_system: '',
    prevalence: '',
    key_stat: '',
    hero_quote: '',
    is_featured: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}` };
      const [ovRes, usrRes, subRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/submissions', { headers })
      ]);

      if (ovRes.ok) setAdminData(await ovRes.json());
      if (usrRes.ok) setUsersList((await usrRes.json()).users || []);
      if (subRes.ok) setSubmissionsList((await subRes.json()).submissions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showToast('User role updated successfully.');
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleSubmissionStatus = async (subId, status) => {
    try {
      const res = await fetch(`/api/admin/submissions/${subId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSubmissionsList(prev => prev.map(s => s.id === subId ? { ...s, status } : s));
        showToast(`Submission marked as ${status}.`);
      }
    } catch (err) {
      console.error('Submission update error:', err);
    }
  };

  const handleToggleCampaign = async (campId) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}` }
      });
      if (res.ok) {
        showToast('Campaign status toggled.');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Toggle campaign error:', err);
    }
  };

  const handleCreateDisease = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/diseases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('knowbefore_token')}`
        },
        body: JSON.stringify(diseaseForm)
      });
      if (res.ok) {
        showToast('New clinical condition published.');
        setShowNewDisease(false);
        setDiseaseForm({
          name: '', slug: '', category: 'Cardiovascular', headline: '',
          overview: '', anatomical_system: '', prevalence: '', key_stat: '', hero_quote: '', is_featured: 0
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error('Create disease error:', err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '48px 24px',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          <Shield size={36} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
          <h2 className="serif-display" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            Administrator Access Required
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            This section provides clinical content management, user role control, and system analytics. You can switch immediately to the administrator demonstration profile below.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => loginWithDemo('admin')}
          >
            Switch to Dr. Aris Thorne (Admin Account)
          </button>
        </div>
      </div>
    );
  }

  const { metrics, diseaseEngagement, quizPerformance, campaignStats } = adminData || {};

  return (
    <div className="admin-dashboard-page" style={{ padding: '40px 0 60px' }}>
      <div className="app-container">
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div className="editorial-kicker" style={{ color: 'var(--accent)', marginBottom: '4px' }}>
              Platform Administration & Editorial Governance
            </div>
            <h1 className="serif-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1.15 }}>
              Admin Console & Analytics
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-sienna">Signed in as Dr. Aris Thorne</span>
            <button className="btn btn-secondary btn-sm" onClick={fetchAdminData}>
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        </div>

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
            <CheckCircle2 size={16} color="#A7D3BA" />
            {toastMessage}
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'overview', label: 'System Analytics & Metrics' },
            { id: 'users', label: `User Management (${usersList.length})` },
            { id: 'diseases', label: 'Disease Content' },
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'submissions', label: `Review Submissions (${submissionsList.filter(s => s.status === 'pending').length} pending)` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & PURPOSEFUL ANALYTICS */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '36px'
            }}>
              {[
                { label: 'REGISTERED USERS', value: metrics?.totalUsers || 0, color: 'var(--primary)' },
                { label: 'CLINICAL CONDITIONS', value: metrics?.totalDiseases || 0, color: 'var(--primary)' },
                { label: 'QUIZ ATTEMPTS', value: metrics?.totalQuizAttempts || 0, color: 'var(--accent)' },
                { label: 'AVG QUIZ SCORE', value: `${metrics?.averageQuizScore || 0}%`, color: 'var(--ochre)' },
                { label: 'PREVENTION STEPS LOGGED', value: metrics?.totalChecklistCompletions || 0, color: 'var(--success)' },
                { label: 'DOCTOR QUESTIONS CREATED', value: metrics?.totalDoctorQuestions || 0, color: 'var(--primary)' },
                { label: 'COMMUNITY PLEDGES', value: metrics?.totalCampaignPledges || 0, color: 'var(--accent)' }
              ].map((m, i) => (
                <div key={i} className="editorial-card" style={{ padding: '20px' }}>
                  <div className="mono-tag" style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>{m.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: m.color, lineHeight: 1.1 }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Purposeful Visual Data Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              
              {/* Disease Engagement Breakdown */}
              <div className="editorial-card">
                <div className="editorial-kicker" style={{ marginBottom: '6px' }}>Engagement Distribution</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
                  Condition Bookmarking & Action Adoption
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {diseaseEngagement?.slice(0, 6).map((d, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{d.name}</span>
                        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                          {d.saved_count} saves · {d.checklist_count} steps done
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, (d.checklist_count + d.saved_count) * 15 + 10)}%`,
                          backgroundColor: 'var(--primary)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Performance by Category */}
              <div className="editorial-card">
                <div className="editorial-kicker" style={{ marginBottom: '6px' }}>Knowledge Baseline</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
                  Awareness Quiz Completion & Average Scores
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {quizPerformance?.map((qp, i) => (
                    <div key={i} style={{ padding: '12px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{qp.title}</span>
                        <span className="badge badge-pine">{qp.avg_score || 0}% avg</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Category: {qp.category} · {qp.attempts} recorded attempts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Activity Stats</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Role Change</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          backgroundColor: u.avatar_color || 'var(--primary)', color: 'white',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700
                        }}>
                          {u.full_name?.charAt(0)}
                        </span>
                        {u.full_name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-sienna' : 'badge-pine'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.saved_count} saved · {u.quiz_count} quizzes · {u.questions_count} questions
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          padding: '4px 8px', fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: DISEASE CONTENT MANAGEMENT */}
        {activeTab === 'diseases' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="serif-display" style={{ fontSize: '1.5rem' }}>
                  Condition Modules ({diseaseEngagement?.length || 0})
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Manage disease overviews, biological mechanisms, and clinical sections.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewDisease(!showNewDisease)}
              >
                <Plus size={14} /> Add New Condition Module
              </button>
            </div>

            {/* Create Disease Form */}
            {showNewDisease && (
              <form onSubmit={handleCreateDisease} style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                marginBottom: '28px'
              }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>Publish New Disease Module</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Name *</label>
                    <input
                      type="text" required placeholder="e.g. Chronic Kidney Disease"
                      value={diseaseForm.name}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Slug (URL identifier) *</label>
                    <input
                      type="text" required placeholder="e.g. chronic-kidney-disease"
                      value={diseaseForm.slug}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, slug: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Category *</label>
                    <select
                      value={diseaseForm.category}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Metabolic & Endocrine">Metabolic & Endocrine</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Infectious">Infectious</option>
                      <option value="Women's Health">Women's Health</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Renal">Renal</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Headline *</label>
                  <input
                    type="text" required placeholder="e.g. Progressive Nephron Loss and Filtration Strain"
                    value={diseaseForm.headline}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, headline: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Biological Overview *</label>
                  <textarea
                    rows={4} required placeholder="Detailed clinical mechanism..."
                    value={diseaseForm.overview}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, overview: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Anatomical System</label>
                    <input
                      type="text" placeholder="e.g. Renal & Filtration System"
                      value={diseaseForm.anatomical_system}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, anatomical_system: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Prevalence Stat</label>
                    <input
                      type="text" placeholder="e.g. 1 in 10 adults globally"
                      value={diseaseForm.prevalence}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, prevalence: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '4px' }}>Key Insight Stat</label>
                    <input
                      type="text" placeholder="e.g. 90% unaware of impairment"
                      value={diseaseForm.key_stat}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, key_stat: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewDisease(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Publish Condition
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {diseaseEngagement?.map((d, i) => (
                <div key={i} className="editorial-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-subtle">{d.category}</span>
                      <strong style={{ fontSize: '1.0625rem' }}>{d.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {d.saved_count} saved bookmarks · {d.checklist_count} completed prevention checklists · {d.questions_count} questions
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate(`/diseases/${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                  >
                    View Live Page
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGNS MANAGEMENT */}
        {activeTab === 'campaigns' && (
          <div>
            <h3 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>
              Public Health Campaign Controls
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {campaignStats?.map(c => (
                <div key={c.id} className="editorial-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-pine">{c.category}</span>
                      <strong style={{ fontSize: '1.125rem' }}>{c.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Goal: {c.target_participants} participants · Current Pledges: {c.current_participants + c.registered_pledges}
                    </div>
                  </div>

                  <button
                    className={`btn btn-sm ${c.is_active ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggleCampaign(c.id)}
                  >
                    {c.is_active ? 'Archive Campaign' : 'Reactivate Campaign'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUBMISSIONS REVIEW */}
        {activeTab === 'submissions' && (
          <div>
            <h3 className="serif-display" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>
              Community Question & Feedback Submissions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {submissionsList.map(sub => (
                <div key={sub.id} className="editorial-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-subtle">{sub.submission_type}</span>
                      <span className={`badge ${sub.status === 'pending' ? 'badge-ochre' : 'badge-pine'}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '6px' }}>
                    {sub.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {sub.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span>By: {sub.author_name} ({sub.author_email || 'No email provided'})</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {sub.status !== 'reviewed' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSubmissionStatus(sub.id, 'reviewed')}
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {sub.status !== 'published' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSubmissionStatus(sub.id, 'published')}
                        >
                          Approve / Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
