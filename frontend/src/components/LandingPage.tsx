import React from 'react';
import { CandidateProfile } from '../types/interview';

export const DEFAULT_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_001',
    name: 'Sarah Chen',
    track: 'Senior Backend Engineer',
    background: '5 years Python & Go building high-throughput payment gateways and distributed microservices'
  },
  {
    id: 'cand_002',
    name: 'Marcus Rodriguez',
    track: 'Staff Full Stack Engineer',
    background: '8 years enterprise web applications, real-time analytics platforms, and resilient system architecture'
  }
];

interface LandingPageProps {
  selectedCandidate: CandidateProfile;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onStartSession: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedCandidate,
  onSelectCandidate,
  onStartSession,
  isLoading,
  error
}) => {
  return (
    <div className="landing-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge-tag">
          AI Technical Interview Platform
        </div>
        <h1 className="hero-title">
          Adaptive, Experience-Driven Technical Interviews
        </h1>
        <p className="hero-subtitle">
          An automated evaluation agent that personalizes scenarios based on actual engineering background, dynamically tests architectural trade-offs, and synthesizes structured performance feedback.
        </p>
      </section>

      {/* Error state if any */}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Candidate Profile Selection Card */}
      <section className="card setup-card">
        <div className="section-header">
          <h2 className="section-title">Select Candidate Profile</h2>
          <p className="section-description">
            Choose a candidate profile to initialize a personalized technical interview session.
          </p>
        </div>

        <div className="candidate-grid">
          {DEFAULT_CANDIDATES.map((cand) => {
            const isSelected = selectedCandidate.id === cand.id;
            return (
              <button
                key={cand.id}
                type="button"
                className={`candidate-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectCandidate(cand)}
                disabled={isLoading}
                aria-pressed={isSelected}
              >
                <div className="candidate-card-top">
                  <div className="candidate-meta">
                    <span className="candidate-name">{cand.name}</span>
                    <span className="candidate-track">{cand.track}</span>
                  </div>
                  <div className="candidate-radio" aria-hidden="true">
                    <div className="candidate-radio-inner" />
                  </div>
                </div>
                <p className="candidate-summary">{cand.background}</p>
                <div className="candidate-tags">
                  <span className="tag-pill">ID: {cand.id}</span>
                  <span className="tag-pill">Anchor Evaluation</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="action-row">
          <span className="action-hint">
            Session initializes adaptive questions grounded in the selected profile.
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={onStartSession}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Initializing Interview...</span>
              </>
            ) : (
              <span>Start Technical Interview</span>
            )}
          </button>
        </div>
      </section>

      {/* Three Pillars Overview */}
      <section className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon">01</div>
          <h3 className="pillar-title">Personalized Anchors</h3>
          <p className="pillar-desc">
            Evaluates candidate track and selects targeted curriculum anchor areas based on previous project missions.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">02</div>
          <h3 className="pillar-title">Dynamic Probing</h3>
          <p className="pillar-desc">
            Deep-dives into architecture trade-offs with context-aware follow-up questions when responses require depth.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">03</div>
          <h3 className="pillar-title">Structured Feedback</h3>
          <p className="pillar-desc">
            Synthesizes key strengths, identified technical gaps, and recommended next steps directly from candidate responses.
          </p>
        </div>
      </section>
    </div>
  );
};
