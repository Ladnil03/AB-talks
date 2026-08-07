import React, { useState } from 'react';
import { ChatMessage } from '../types/interview';

interface InterviewRoomProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="chat-window">
      <div className="messages-list">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'agent' ? 'msg-agent' : 'msg-candidate'}>
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="msg-agent" style={{ opacity: 0.7 }}>
            AI Interviewer is analyzing your response...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-bar">
        <input
          type="text"
          className="text-input"
          placeholder="Type your technical response..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
