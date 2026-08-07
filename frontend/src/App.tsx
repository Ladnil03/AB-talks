import React, { useState } from 'react';
import { LandingPage, DEFAULT_CANDIDATES } from './components/LandingPage';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackCard } from './components/FeedbackCard';
import { sendInterviewTurn } from './services/api';
import { ChatMessage, FeedbackSchema, CandidateProfile } from './types/interview';

type PageState = 'landing' | 'interview' | 'feedback';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(DEFAULT_CANDIDATES[0]);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackSchema | null>(null);

  const handleStartSession = async () => {
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
          content: `Hello ${selectedCandidate.name}! Welcome to your technical assessment for the ${selectedCandidate.track} role. Today, we'll dive into real-world engineering trade-offs, architecture decisions, and system resilience. Let's start by discussing your background in ${selectedCandidate.background}.`,
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentPage('interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
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
      setErrorMessage('Unable to connect to the interview server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setFeedback(null);
    setErrorMessage(null);
    setCurrentPage('landing');
  };

  return (
    <div className="app-container">
      {/* Universal Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">AB</div>
          <div className="brand-info">
            <h1>Dayflow AI Interviewer</h1>
            <p>Personalized Technical Evaluation</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot" aria-hidden="true" />
          <span>
            {currentPage === 'landing' && 'Ready for Interview'}
            {currentPage === 'interview' && `Candidate: ${selectedCandidate.name}`}
            {currentPage === 'feedback' && 'Evaluation Complete'}
          </span>
        </div>
      </header>

      {/* Main Content Pages */}
      <main>
        {currentPage === 'landing' && (
          <LandingPage
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            onStartSession={handleStartSession}
            isLoading={isLoading}
            error={errorMessage}
          />
        )}

        {currentPage === 'interview' && (
          <InterviewRoom
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        )}

        {currentPage === 'feedback' && feedback && (
          <FeedbackCard
            feedback={feedback}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};
