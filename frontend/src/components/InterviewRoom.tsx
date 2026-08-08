import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Clock,
  Zap,
  Sparkles,
  Pause,
  Play,
  FastForward,
  XCircle,
  Loader2
} from 'lucide-react';
import { ChatMessage, CandidateProfile } from '../types/interview';

interface InterviewRoomProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  selectedCandidate?: CandidateProfile;
  isDemoMode?: boolean;
  isDemoPaused?: boolean;
  demoStepIndex?: number;
  totalDemoSteps?: number;
  onTogglePauseDemo?: () => void;
  onFastForwardDemo?: () => void;
  onExitDemo?: () => void;
}

// Contextual & Candidate-Aware Dynamic Quick Prompt Generator
const getDynamicQuickPrompts = (messages: ChatMessage[], selectedCandidate?: CandidateProfile): string[] => {
  const lastAgentMsg = [...messages].reverse().find((m) => m.role === 'agent')?.content.toLowerCase() || '';
  const track = selectedCandidate?.track?.toLowerCase() || '';

  const dynamicPrompts: string[] = [];

  // 1. Contextual Keyword-based Prompts (Derived from AI agent's last question)
  if (lastAgentMsg.includes('database') || lastAgentMsg.includes('storage') || lastAgentMsg.includes('sql') || lastAgentMsg.includes('postgres') || lastAgentMsg.includes('warehouse')) {
    dynamicPrompts.push("I would structure the database schema with indexing and partition keys.");
    dynamicPrompts.push("To handle high concurrency, I'd implement connection pooling and read replicas.");
  } else if (lastAgentMsg.includes('cache') || lastAgentMsg.includes('redis') || lastAgentMsg.includes('latency') || lastAgentMsg.includes('performance')) {
    dynamicPrompts.push("I would introduce Redis caching with a TTL write-through strategy.");
    dynamicPrompts.push("To minimize latency, non-blocking asynchronous tasks would process in background.");
  } else if (lastAgentMsg.includes('api') || lastAgentMsg.includes('microservice') || lastAgentMsg.includes('grpc') || lastAgentMsg.includes('service')) {
    dynamicPrompts.push("I'd design gRPC/REST APIs with idempotency keys and rate limiting.");
    dynamicPrompts.push("Let me break down the service boundary and circuit-breaker fault tolerance.");
  } else if (lastAgentMsg.includes('embedding') || lastAgentMsg.includes('vector') || lastAgentMsg.includes('llm') || lastAgentMsg.includes('prompt') || lastAgentMsg.includes('rag')) {
    dynamicPrompts.push("I would use HNSW index vector search paired with a hybrid RAG pipeline.");
    dynamicPrompts.push("To prevent hallucinations, I'd apply strict Pydantic JSON schema validation.");
  }

  // 2. Candidate Role/Track-Specific Prompts
  if (track.includes('data')) {
    dynamicPrompts.push("I'd optimize Apache Spark partition pruning and Delta Lake indexing.");
    dynamicPrompts.push("For streaming throughput, I'd use Kafka with distributed checkpointing.");
  } else if (track.includes('ai') || track.includes('ml')) {
    dynamicPrompts.push("I would implement semantic caching to reduce LLM API cost and latency.");
    dynamicPrompts.push("Let me detail the multi-agent orchestration pattern using MCP and tool bounds.");
  } else if (track.includes('backend') || track.includes('software')) {
    dynamicPrompts.push("I'd implement optimistic locking and database connection pooling.");
    dynamicPrompts.push("Let me outline the asynchronous event queue and retry backoff logic.");
  }

  // 3. Universal Probing Fallbacks
  dynamicPrompts.push("Could you clarify the latency vs consistency requirements for this system?");
  dynamicPrompts.push("Let me outline the core architectural trade-offs for this scenario...");

  // Return top 4 unique prompts
  return Array.from(new Set(dynamicPrompts)).slice(0, 4);
};

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedCandidate,
  isDemoMode = false,
  isDemoPaused = false,
  demoStepIndex = 0,
  totalDemoSteps = 10,
  onTogglePauseDemo,
  onFastForwardDemo,
  onExitDemo
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute dynamic response ideas based on current conversation & candidate track
  const activeQuickPrompts = getDynamicQuickPrompts(messages, selectedCandidate);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isDemoMode) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isDemoMode) return;
    setInput(promptText);
  };

  // Determine stage based on message turn count
  const turnCount = messages.length;
  const currentStageIndex = turnCount <= 2 ? 0 : turnCount <= 5 ? 1 : 2;

  const renderFormattedMessage = (content: string) => {
    // Check if content contains code block markdown ```
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const codeLines = part.slice(3, -3).replace(/^[a-z]+\n/, '');
          return (
            <pre key={index}>
              <code>{codeLines}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }

    return content;
  };

  return (
    <div className="interview-layout">
      {/* Floating Auto-Play Demo Control Banner */}
      {isDemoMode && (
        <div style={{
          gridColumn: '1 / -1',
          background: '#eff6ff',
          color: '#1e3a8a',
          border: '1px solid #bfdbfe',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          marginBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} style={{ color: '#d97706' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              Hackathon Pitch Mode: Playing Turn {demoStepIndex} of {totalDemoSteps}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {onTogglePauseDemo && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onTogglePauseDemo}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', background: '#ffffff', color: '#1e3a8a', border: '1px solid #cbd5e1' }}
              >
                {isDemoPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{isDemoPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            {onFastForwardDemo && (
              <button
                type="button"
                className="btn-primary"
                onClick={onFastForwardDemo}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', background: '#2563eb' }}
              >
                <FastForward size={13} />
                <span>Fast-Forward to Feedback Report</span>
              </button>
            )}

            {onExitDemo && (
              <button
                type="button"
                onClick={onExitDemo}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Exit Pitch Demo Mode"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Telemetry Sidebar */}
      <aside className="telemetry-sidebar">
        {/* Candidate Context Block */}
        <div className="sidebar-block">
          <span className="sidebar-title">Candidate Profile</span>
          <div className="candidate-summary-box">
            <span className="candidate-summary-name">
              {selectedCandidate?.name || 'Selected Candidate'}
            </span>
            <span className="candidate-summary-role">
              {selectedCandidate?.track || 'Software Engineer'}
            </span>
          </div>
        </div>

        {/* Stage Progression */}
        <div className="sidebar-block">
          <span className="sidebar-title">Interview Stage</span>
          <div className="stage-tracker">
            <div className={`stage-step ${currentStageIndex === 0 ? 'active' : ''}`}>
              <span className="stage-num">1</span>
              <span>Introduction & Context</span>
            </div>
            <div className={`stage-step ${currentStageIndex === 1 ? 'active' : ''}`}>
              <span className="stage-num">2</span>
              <span>Architectural Scenario</span>
            </div>
            <div className={`stage-step ${currentStageIndex >= 2 ? 'active' : ''}`}>
              <span className="stage-num">3</span>
              <span>Follow-up & Synthesis</span>
            </div>
          </div>
        </div>

        {/* Dynamic Quick Response Suggestions */}
        <div className="sidebar-block" style={{ flex: 1 }}>
          <span className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={13} style={{ color: 'var(--accent-amber)' }} />
            Dynamic Response Ideas
          </span>
          <div className="quick-prompts-list">
            {activeQuickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-prompt-btn"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading || isDemoMode}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Conversation Stream */}
      <div className="chat-window">
        {/* Top Question Progress Header */}
        <div className="interview-top-bar" style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.03em'
            }}>
              Question {Math.max(1, [...messages].reverse().find(m => m.role === 'agent' && m.questionNumber !== undefined)?.questionNumber ?? 1)}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Min 8 scenario questions across &ge;4 curriculum days
            </span>
          </div>
        </div>

        <div className="messages-list">
          {messages.map((m) => {
            const isAgent = m.role === 'agent';
            const timeStr = new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={m.id}
                className={`chat-msg-row ${isAgent ? 'agent' : 'candidate'}`}
              >
                <div className="msg-avatar">
                  {isAgent ? <Bot size={20} /> : <User size={20} />}
                </div>

                <div className="msg-bubble-content">
                  <div className="msg-header">
                    <span className="msg-sender-name">
                      {isAgent ? 'AI Interviewer' : selectedCandidate?.name || 'Candidate'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={11} /> {timeStr}
                    </span>
                  </div>

                  <div className="msg-bubble">
                    {renderFormattedMessage(m.content)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="chat-msg-row agent">
              <div className="msg-avatar">
                <Bot size={20} />
              </div>
              <div className="msg-bubble-content">
                <div className="msg-header" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="msg-sender-name">AI Interviewer</span>
                  <Loader2 size={13} className="animate-spin" style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>Analyzing response & synthesizing next question...</span>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Interactive Input Form */}
        <form onSubmit={handleSubmit} className="input-bar">
          <input
            type="text"
            className="text-input"
            placeholder={isDemoMode ? "Auto-Play Demo running..." : "Type your technical answer (Press Enter to send)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isDemoMode}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={isLoading || isDemoMode || !input.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <Send size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
