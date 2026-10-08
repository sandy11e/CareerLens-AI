import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
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
import api from './api';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastParams, setLastParams] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [groqStatus, setGroqStatus] = useState({ groq_active: false });

  // Initial health check
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
  }, []);

  // Main evaluation trigger
  const handleAnalyze = async ({ file, githubUsername, leetcodeUsername }) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    setLastParams({ file, githubUsername, leetcodeUsername });

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
      const detail = err.response?.data?.detail || err.message || 'Evaluation pipeline encountered an unexpected error.';
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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasData={!!analysisData}
        onReset={handleReset}
        groqStatus={groqStatus}
      />

      {/* Main Content Area - Full Screen & Responsive */}
      <main className="app-main-container">
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
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '18px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        background: '#ffffff'
      }}>
        CareerLens • Candidate Verification & Career Intelligence Platform
      </footer>
    </div>
  );
}
