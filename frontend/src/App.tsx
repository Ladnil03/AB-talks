import React, { useState, useEffect } from 'react';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackCard } from './components/FeedbackCard';
import { sendInterviewTurn } from './services/api';
import { ChatMessage, FeedbackSchema } from './types/interview';

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackSchema | null>(null);

  const startSession = async () => {
    const newSessionId = `sess_${Date.now()}`;
    setSessionId(newSessionId);
    setIsLoading(true);
    setFeedback(null);

    try {
      const initResponse = await sendInterviewTurn({
        sessionId: newSessionId,
        candidate: {
          id: 'cand_001',
          name: 'Sarah Chen',
          track: 'Senior Backend Engineer',
          background: '5 years high throughput microservices'
        }
      });

      setMessages([
        {
          id: 'msg_0',
          role: 'agent',
          content: initResponse.reply,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to init session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startSession();
  }, []);

  const handleSendMessage = async (userMsg: string) => {
    const userMessageObj: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'candidate',
      content: userMsg,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setIsLoading(true);

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
      }
    } catch (err) {
      console.error('Failed to send turn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1 className="logo-badge">Dayflow AI Interviewer</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Personalized Technical Evaluation</p>
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Candidate: <strong style={{ color: '#f8fafc' }}>Sarah Chen</strong> (cand_001)
        </div>
      </header>

      {feedback ? (
        <FeedbackCard feedback={feedback} onRestart={startSession} />
      ) : (
        <InterviewRoom
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
