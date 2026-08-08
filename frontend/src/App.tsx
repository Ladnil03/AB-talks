import React, { useState, useEffect } from 'react';
import { Bot, Home, Users } from 'lucide-react';
import { LandingPage, DEFAULT_CANDIDATES } from './components/LandingPage';
import { CandidateSelectionPage } from './components/CandidateSelectionPage';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackCard } from './components/FeedbackCard';
import { sendInterviewTurn } from './services/api';
import { ChatMessage, FeedbackSchema, CandidateProfile } from './types/interview';
import { 
  ALEX_TURNER_DEMO_TRANSCRIPT, 
  DEMO_CANDIDATE_ALEX, 
  DEMO_FEEDBACK_SYNTHESIS 
} from './data/demoTranscript';

type PageState = 'home' | 'candidates' | 'interview' | 'feedback';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>('home');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(DEFAULT_CANDIDATES[0]);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSchema | null>(null);

  // Auto-Play Hackathon Demo State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isDemoPaused, setIsDemoPaused] = useState<boolean>(false);
  const [demoIndex, setDemoIndex] = useState<number>(0);

  // Smooth scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Hackathon Demo Auto-Play Loop
  useEffect(() => {
    if (!isDemoMode || isDemoPaused) return;

    if (demoIndex >= ALEX_TURNER_DEMO_TRANSCRIPT.length) {
      // Demo completed -> show feedback & certificate
      setFeedback(DEMO_FEEDBACK_SYNTHESIS);
      setCurrentPage('feedback');
      setIsDemoMode(false);
      return;
    }

    const timer = setTimeout(() => {
      const turn = ALEX_TURNER_DEMO_TRANSCRIPT[demoIndex];
      const newMsgObj: ChatMessage = {
        id: `demo_${Date.now()}_${demoIndex}`,
        role: turn.role,
        content: turn.content,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, newMsgObj]);
      setDemoIndex((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isDemoMode, isDemoPaused, demoIndex]);

  const handleStartDemo = () => {
    setSelectedCandidate(DEMO_CANDIDATE_ALEX);
    setSessionId(`demo_sess_${Date.now()}`);
    setMessages([]);
    setFeedback(null);
    setDemoIndex(0);
    setIsDemoPaused(false);
    setIsDemoMode(true);
    setCurrentPage('interview');
  };

  const handleFastForwardDemo = () => {
    const allMessages: ChatMessage[] = ALEX_TURNER_DEMO_TRANSCRIPT.map((t, idx) => ({
      id: `demo_${Date.now()}_${idx}`,
      role: t.role,
      content: t.content,
      timestamp: new Date().toISOString()
    }));

    setMessages(allMessages);
    setFeedback(DEMO_FEEDBACK_SYNTHESIS);
    setSelectedCandidate(DEMO_CANDIDATE_ALEX);
    setCurrentPage('feedback');
    setIsDemoMode(false);
  };

  const handleTogglePauseDemo = () => {
    setIsDemoPaused((prev) => !prev);
  };

  const handleExitDemo = () => {
    setIsDemoMode(false);
    setIsDemoPaused(false);
    handleRestart();
  };

  const handleStartSession = async () => {
    setIsDemoMode(false);
    const newSessionId = `sess_${Date.now()}`;
    setSessionId(newSessionId);
    setIsLoading(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const initResponse = await sendInterviewTurn({
        sessionId: newSessionId,
        candidate: selectedCandidate
      });

      setMessages([
        {
          id: `msg_${Date.now()}_agent`,
          role: 'agent',
          content: initResponse.reply,
          timestamp: new Date().toISOString()
        }
      ]);

      setCurrentPage('interview');
    } catch (err) {
      console.error('Failed to initialize session:', err);
      // Fallback for development if backend server is not currently running
      setMessages([
        {
          id: `msg_${Date.now()}_agent`,
          role: 'agent',
          content: `Hello ${selectedCandidate.name}! Welcome to your technical assessment for the ${selectedCandidate.track || 'Engineering'} role. Today, we'll dive into real-world engineering trade-offs, architecture decisions, and system resilience. Let me start by asking: could you walk me through an architecture decision you made in your previous projects that you're most proud of?`,
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentPage('interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (isDemoMode) return;

    const userMessageObj: ChatMessage = {
      id: `msg_${Date.now()}_candidate`,
      role: 'candidate',
      content: userMsg,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await sendInterviewTurn({
        sessionId: sessionId,
        message: userMsg
      });

      const agentMessageObj: ChatMessage = {
        id: `msg_${Date.now()}_agent`,
        role: 'agent',
        content: response.reply,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, agentMessageObj]);

      if (response.done && response.feedback) {
        setFeedback(response.feedback);
        setCurrentPage('feedback');
      }
    } catch (err) {
      console.error('Failed to send turn:', err);
      setErrorMessage('Unable to connect to the interview server. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setIsDemoMode(false);
    setIsDemoPaused(false);
    setMessages([]);
    setFeedback(null);
    setErrorMessage(null);
    setCurrentPage('home');
  };

  return (
    <div className="app-container">
      {/* Universal Header Navigation */}
      <header className="app-header">
        <div 
          className="brand-section" 
          onClick={handleRestart}
          style={{ cursor: 'pointer' }}
          title="Return to Home"
        >
          <div className="brand-icon-wrapper">
            <Bot size={24} />
          </div>
          <div className="brand-info">
            <h1>Dayflow AI Interviewer</h1>
            <p>Personalized Autonomous Technical Evaluation</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {currentPage !== 'home' && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setCurrentPage('home')}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <Home size={15} />
              <span>Home</span>
            </button>
          )}

          {currentPage === 'home' && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setCurrentPage('candidates')}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <Users size={15} />
              <span>Select Candidate</span>
            </button>
          )}

          <div className="header-status">
            <span className="status-dot" aria-hidden="true" />
            <span>
              {isDemoMode && `Playing Pitch Demo (${demoIndex}/${ALEX_TURNER_DEMO_TRANSCRIPT.length})`}
              {!isDemoMode && currentPage === 'home' && 'Ready for Assessment'}
              {!isDemoMode && currentPage === 'candidates' && 'Candidate Hub'}
              {!isDemoMode && currentPage === 'interview' && `Candidate: ${selectedCandidate.name}`}
              {!isDemoMode && currentPage === 'feedback' && 'Evaluation Complete'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Router */}
      <main>
        {currentPage === 'home' && (
          <LandingPage
            onGoToCandidateHub={() => setCurrentPage('candidates')}
            onLaunchDemo={handleStartDemo}
            error={errorMessage}
          />
        )}

        {currentPage === 'candidates' && (
          <CandidateSelectionPage
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            onStartSession={handleStartSession}
            onGoHome={() => setCurrentPage('home')}
            isLoading={isLoading}
            error={errorMessage}
          />
        )}

        {currentPage === 'interview' && (
          <InterviewRoom
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedCandidate={selectedCandidate}
            isDemoMode={isDemoMode}
            isDemoPaused={isDemoPaused}
            demoStepIndex={demoIndex}
            totalDemoSteps={ALEX_TURNER_DEMO_TRANSCRIPT.length}
            onTogglePauseDemo={handleTogglePauseDemo}
            onFastForwardDemo={handleFastForwardDemo}
            onExitDemo={handleExitDemo}
          />
        )}

        {currentPage === 'feedback' && feedback && (
          <FeedbackCard
            feedback={feedback}
            onRestart={handleRestart}
            selectedCandidate={selectedCandidate}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <p>© Dayflow AI Technical Evaluator • Autonomous Assessment Agent Platform</p>
      </footer>
    </div>
  );
};
