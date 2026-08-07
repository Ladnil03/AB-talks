import React from 'react';
import { FeedbackSchema } from '../types/interview';

interface FeedbackCardProps {
  feedback: FeedbackSchema;
  onRestart: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onRestart }) => {
  return (
    <div style={{
      background: 'rgba(22, 30, 46, 0.9)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 0 35px rgba(99, 102, 241, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>Technical Performance Evaluation</h2>
        <span style={{
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          Assessment Complete
        </span>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', lineHeight: '1.6' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Executive Summary</h4>
        <p style={{ color: '#f1f5f9' }}>{feedback.summary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px' }}>
          <h4 style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Key Strengths</h4>
          <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {feedback.strengths.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px' }}>
          <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Identified Gaps</h4>
          <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {feedback.gaps.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px' }}>
        <h4 style={{ color: '#6366f1', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Recommended Next Steps</h4>
        <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {feedback.next.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={onRestart}
        style={{
          alignSelf: 'flex-start',
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Start New Interview Session
      </button>
    </div>
  );
};
