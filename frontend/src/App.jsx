import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import HeroUpload from './components/HeroUpload';
import LoadingProgress from './components/LoadingProgress';
import ErrorAlert from './components/ErrorAlert';
import OverviewSection from './components/OverviewSection';
import ResumeSection from './components/ResumeSection';
import DevSignalsSection from './components/DevSignalsSection';
import CrossVerificationSection from './components/CrossVerificationSection';
import JobMatchesSection from './components/JobMatchesSection';
import RoadmapSection from './components/RoadmapSection';
import CopilotChat from './components/CopilotChat';
import HistoryModal from './components/HistoryModal';
import api from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app' | 'auth'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(() => api.getSavedUser());
  
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastParams, setLastParams] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [groqStatus, setGroqStatus] = useState({ groq_active: false });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Theme Management (Persisted in localStorage with system preference fallback)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('careerlens_theme');
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('careerlens_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Initial health check and token verification
  useEffect(() => {
    async function checkBackend() {
      try {
        const health = await api.checkHealth();
        setGroqStatus(health);
      } catch (err) {
        console.warn('Backend offline:', err);
      }
    }
    checkBackend();

    // Verify session if token stored
    async function verifyUser() {
      const token = localStorage.getItem('careerlens_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setCurrentUser(res.user);
          }
        } catch {
          // Token expired or invalid
          api.logout();
          setCurrentUser(null);
        }
      }
    }
    verifyUser();
  }, []);

  // Main evaluation trigger
  const handleAnalyze = async ({ file, githubUsername, leetcodeUsername }) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    setLastParams({ file, githubUsername, leetcodeUsername });
    setCurrentView('app');

    try {
      const result = await api.evaluateUnified({
        file,
        githubUsername,
        leetcodeUsername,
        onUploadProgress: (progress) => setUploadProgress(progress)
      });

      setAnalysisData(result);
      setActiveTab('overview');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if confetti fails
      }
    } catch (err) {
      console.error('Unified evaluation failed:', err);
      const rawDetail = err.response?.data?.detail;
      const detail = rawDetail || (err.message === 'Network Error'
        ? 'Network Error: The backend service may be waking up from sleep or temporarily unreachable. Please click Retry below.'
        : err.message || 'Evaluation pipeline encountered an unexpected error.');
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  // Update roadmap when user changes target role dynamically in Roadmap tab
  const handleRoadmapUpdate = (newRoadmap, newRole) => {
    setAnalysisData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        roadmap: newRoadmap,
        target_role: newRole || newRoadmap?.target_role || prev.target_role,
      };
    });
  };

  // Update custom JD match results dynamically
  const handleCustomJdUpdate = (newJdResult) => {
    setAnalysisData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        custom_jd_match: newJdResult,
        target_role: newJdResult?.job_title || prev.target_role,
      };
    });
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
    setIsLoading(false);
    setActiveTab('overview');
    setCurrentView('app');
  };

  const handleStartAudit = () => {
    if (currentUser) {
      setCurrentView('app');
    } else {
      setAuthMode('register');
      setCurrentView('auth');
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    // After login, proceed to the evaluation portal
    setCurrentView('app');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleLoadEvaluation = (loadedAnalysis) => {
    setAnalysisData(loadedAnalysis);
    setError(null);
    setIsLoading(false);
    setCurrentView('app');
    setActiveTab('overview');
    setIsHistoryOpen(false);
  };

  // Guard: require authentication for the application analysis page
  useEffect(() => {
    if (currentView === 'app' && !currentUser) {
      setAuthMode('login');
      setCurrentView('auth');
    }
  }, [currentView, currentUser]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'app' && !currentUser) {
            setAuthMode('login');
            setCurrentView('auth');
          } else {
            setCurrentView(view);
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasData={!!analysisData}
        onReset={handleReset}
        groqStatus={groqStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="app-main-container">
        {/* VIEW 1: DEDICATED LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            onStartAudit={handleStartAudit}
            onOpenAuth={handleOpenAuth}
            hasData={!!analysisData}
            onViewDashboard={() => setCurrentView('app')}
            currentUser={currentUser}
          />
        )}

        {/* VIEW 2: AUTHENTICATION PAGE (LOGIN / REGISTER) */}
        {currentView === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onBackHome={() => setCurrentView('landing')}
          />
        )}

        {/* VIEW 3: APPLICATION (EVALUATION OR DASHBOARD) */}
        {currentView === 'app' && (
          <>
            {/* Loading Pipeline State */}
            {isLoading && (
              <LoadingProgress uploadProgress={uploadProgress} />
            )}

            {/* Error State */}
            {!isLoading && error && (
              <ErrorAlert error={error} onRetry={() => lastParams && handleAnalyze(lastParams)} />
            )}

            {/* Initial Portal State: Upload & Inputs */}
            {!isLoading && !error && !analysisData && (
              <HeroUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}

            {/* Evaluated Dashboard View */}
            {!isLoading && !error && analysisData && (
              <div>
                {activeTab === 'overview' && (
                  <OverviewSection data={analysisData} setActiveTab={setActiveTab} />
                )}
                {activeTab === 'roadmap' && (
                  <RoadmapSection data={analysisData} onRoadmapUpdate={handleRoadmapUpdate} />
                )}
                {activeTab === 'resume' && (
                  <ResumeSection data={analysisData} />
                )}
                {activeTab === 'dev' && (
                  <DevSignalsSection data={analysisData} />
                )}
                {activeTab === 'verification' && (
                  <CrossVerificationSection data={analysisData} />
                )}
                {activeTab === 'jobs' && (
                  <JobMatchesSection
                    data={analysisData}
                    onJdMatchUpdate={handleCustomJdUpdate}
                    onRoadmapUpdate={handleRoadmapUpdate}
                    setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === 'copilot' && (
                  <CopilotChat evaluationId={analysisData.evaluation_id} initialContext={analysisData} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        background: 'var(--bg-surface)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
          <button 
            onClick={() => setCurrentView('landing')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Home
          </button>
          <span>•</span>
          <button 
            onClick={() => setCurrentView('app')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Evaluate Profile
          </button>
          {currentUser && (
            <>
              <button 
                onClick={() => setIsHistoryOpen(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Audit History
              </button>
              <span>•</span>
            </>
          )}
          {!currentUser ? (
            <button 
              onClick={() => handleOpenAuth('login')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Sign In
            </button>
          ) : (
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Sign Out
            </button>
          )}
        </div>
        <div>
          CareerLens AI • Next-Generation Candidate Verification & Career Intelligence
        </div>
      </footer>

      {/* Full Audit History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadEvaluation={handleLoadEvaluation}
        currentEvaluationId={analysisData?.evaluation_id}
      />
    </div>
  );
}
