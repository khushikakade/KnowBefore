import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import DiseaseLibraryPage from './pages/DiseaseLibraryPage';
import DiseaseDetailPage from './pages/DiseaseDetailPage';
import WarningSignExplorerPage from './pages/WarningSignExplorerPage';
import MythVsFactPage from './pages/MythVsFactPage';
import AwarenessCheckPage from './pages/AwarenessCheckPage';
import PreventionChecklistPage from './pages/PreventionChecklistPage';
import DoctorDiscussionPage from './pages/DoctorDiscussionPage';
import CampaignsPage from './pages/CampaignsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Sync with browser history back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update dynamic SEO title per page
  useEffect(() => {
    window.scrollTo(0, 0);

    if (currentPath === '/') {
      document.title = 'KnowBefore — From Information to Awareness to Action';
    } else if (currentPath.startsWith('/diseases/')) {
      const slug = currentPath.split('/')[2];
      const titleCase = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      document.title = `${titleCase} — Clinical Overview & Prevention | KnowBefore`;
    } else if (currentPath === '/diseases') {
      document.title = 'Disease Library & Foundations | KnowBefore';
    } else if (currentPath === '/warning-signs') {
      document.title = 'Warning Sign Explorer | KnowBefore';
    } else if (currentPath === '/myth-fact') {
      document.title = 'Myth vs Fact Interactive | KnowBefore';
    } else if (currentPath === '/awareness-check') {
      document.title = 'Awareness Check & Evaluations | KnowBefore';
    } else if (currentPath === '/prevention-checklist') {
      document.title = '5-Pillar Prevention Checklists | KnowBefore';
    } else if (currentPath === '/doctor-discussion') {
      document.title = 'Doctor Discussion List & Consultation Sheet | KnowBefore';
    } else if (currentPath.startsWith('/campaigns')) {
      document.title = 'Public Health Action Campaigns | KnowBefore';
    } else if (currentPath === '/dashboard') {
      document.title = 'Your Journey Dashboard | KnowBefore';
    } else if (currentPath === '/admin') {
      document.title = 'Admin Console & Analytics | KnowBefore';
    }
  }, [currentPath]);

  const navigate = (path) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  // Route Resolver
  const renderCurrentPage = () => {
    // 1. Disease Detail (/diseases/:slug)
    if (currentPath.startsWith('/diseases/') && currentPath.length > '/diseases/'.length) {
      const slug = currentPath.split('/')[2];
      return <DiseaseDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 2. Specific routes
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/diseases':
        return <DiseaseLibraryPage onNavigate={navigate} />;
      case '/warning-signs':
        return <WarningSignExplorerPage onNavigate={navigate} />;
      case '/myth-fact':
        return <MythVsFactPage onNavigate={navigate} />;
      case '/awareness-check':
        return <AwarenessCheckPage onNavigate={navigate} />;
      case '/prevention-checklist':
        return <PreventionChecklistPage onNavigate={navigate} />;
      case '/doctor-discussion':
        return <DoctorDiscussionPage onNavigate={navigate} />;
      case '/campaigns':
      case '/campaigns/know-your-numbers':
      case '/campaigns/demystifying-prediabetes':
      case '/campaigns/breathing-room':
        return <CampaignsPage onNavigate={navigate} />;
      case '/dashboard':
        return <UserDashboardPage onNavigate={navigate} />;
      case '/admin':
        return <AdminDashboardPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="knowbefore-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Masthead */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Page Body */}
      <main style={{ flex: 1 }}>
        {renderCurrentPage()}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      {/* Editorial Footer */}
      <Footer onNavigate={navigate} />

    </div>
  );
}
