import React from 'react';
import {
  Sparkles,
  ArrowRight,
  User,
  Brain,
  Layers,
  Award,
  Sliders,
  Activity,
  CheckCircle2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { CandidateProfile } from '../types/interview';

export const DEFAULT_CANDIDATES: CandidateProfile[] = [
  {
    id: 'CAND-001',
    name: 'Sarah Johnson',
    track: 'Senior Data Engineer',
    background: '9 years exp, MS Computer Science (Distributed Systems, Spark, Data Warehousing)'
  },
  {
    id: 'CAND-002',
    name: 'Alex Turner',
    track: 'Backend Software Engineer',
    background: '5 years exp, B.Tech Computer Science (Go, Python, Microservices & Redis)'
  },
  {
    id: 'CAND-003',
    name: 'Emily Chen',
    track: 'AI / ML Engineer',
    background: '6 years exp, MS Artificial Intelligence (LLM Orchestration, PyTorch, Vector DBs)'
  }
];

interface LandingPageProps {
  onGoToCandidateHub: () => void;
  onLaunchDemo?: () => void;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToCandidateHub,
  onLaunchDemo,
  error
}) => {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-view">
      {/* 1. Hero Section (First Fold: Value Proposition & Primary Action) */}
      <section className="hero-section">
        <div className="badge-tag">
          <Sparkles size={14} />
          <span>Dayflow Engine v1.0 • Autonomous AI Technical Evaluator</span>
        </div>

        <h1 className="hero-title">
          Grounded Technical Evaluation for Engineering Teams
        </h1>

        <p className="hero-subtitle">
          Conduct adaptive, multi-turn technical interviews grounded in real-world candidate experience.
          Dynamically probes architectural trade-offs, evaluates system design depth, and generates structured feedback reports.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onGoToCandidateHub}
            style={{ padding: '0.95rem 2rem', fontSize: '1rem' }}
          >
            <User size={18} />
            <span>Select Candidate Profile</span>
            <ArrowRight size={18} />
          </button>

          {onLaunchDemo && (
            <button
              type="button"
              className="btn-primary"
              onClick={onLaunchDemo}
              style={{
                padding: '0.95rem 1.85rem',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)'
              }}
            >
              <Sparkles size={18} />
              <span>Launch 60s Pitch Demo</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={() => scrollToSection('how-it-works-section')}
            style={{ padding: '0.95rem 1.6rem', fontSize: '0.95rem' }}
          >
            <span>How Platform Works</span>
          </button>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          <Activity size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Platform Metrics & Proof Banner (Second Fold: Credibility & High Impact Stats) */}
      <section className="metrics-banner-grid">
        <div className="metric-box">
          <span className="metric-num">3-Day</span>
          <span className="metric-label">Adaptive Scenario Curriculum</span>
        </div>
        <div className="metric-box">
          <span className="metric-num">Multi-Turn</span>
          <span className="metric-label">Contextual Follow-up Probing</span>
        </div>
        <div className="metric-box">
          <span className="metric-num">100%</span>
          <span className="metric-label">Experience-Grounded Anchors</span>
        </div>
      </section>

      {/* 3. Core Platform Pillars & Value Features (Third Fold: Capability Highlights) */}
      <section className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon">
            <Brain size={20} />
          </div>
          <h3 className="pillar-title">Curriculum Anchored</h3>
          <p className="pillar-desc">
            Aligns scenario questions with real-world engineering projects rather than generic trivia or puzzles.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <Layers size={20} />
          </div>
          <h3 className="pillar-title">Targeted Probing</h3>
          <p className="pillar-desc">
            Asks intelligent follow-up questions when a candidate's answer lacks architectural depth or trade-off analysis.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <Award size={20} />
          </div>
          <h3 className="pillar-title">Structured PDF Reports</h3>
          <p className="pillar-desc">
            Provides hiring managers with actionable feedback reports detailing technical competence and printable PDFs.
          </p>
        </div>
      </section>

      {/* 4. How The AI Interview Agent Works (Fourth Fold: Step-by-Step Process) */}
      <section id="how-it-works-section" className="setup-card" style={{ gap: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">
            <Sliders size={22} style={{ color: 'var(--accent-primary)' }} />
            How The AI Interview Agent Works
          </h2>
          <p className="section-description">
            A 3-step autonomous workflow designed for objective, high-signal technical evaluation.
          </p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-badge">Step 01</div>
            <h3 className="step-title">Profile Grounding</h3>
            <p className="step-desc">
              Extracts candidate engineering background and pairs matching scenario anchors from the curriculum dataset.
            </p>
          </div>

          <div className="step-card">
            <div className="step-badge">Step 02</div>
            <h3 className="step-title">Multi-Turn Evaluation</h3>
            <p className="step-desc">
              Conducts a multi-turn conversation probing architecture trade-offs with context-aware follow-up questions.
            </p>
          </div>

          <div className="step-card">
            <div className="step-badge">Step 03</div>
            <h3 className="step-title">Performance Synthesis</h3>
            <p className="step-desc">
              Generates executive summaries, key strengths, identified technical gaps, and formal printable PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Interactive Synthesis Report Showcase (Fifth Fold: Visual Proof & Product Preview) */}
      <section className="setup-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', gap: '1.25rem' }}>
        <div className="section-header">
          <h2 className="section-title">
            <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
            Sample Evaluation Synthesis Preview
          </h2>
          <p className="section-description">
            Example executive feedback output automatically generated upon interview completion.
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Candidate: Sarah Johnson — Senior Data Engineer</span>
            <span className="tag-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>High Competency Signal</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
            "Demonstrated strong mastery in distributed data pipelines, partition strategies, and microservices architecture. Articulated clear trade-offs between latency and event consistency."
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> 3 Key Strengths Identified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Printable PDF Export Ready
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Conversion Launch Banner (Sixth Fold: Primary Action Callout) */}
      <section className="setup-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', border: '1.5px solid #bfdbfe', padding: '3rem 2rem', alignItems: 'center' }}>
        <div className="badge-tag" style={{ background: '#ffffff' }}>
          <Sparkles size={14} />
          <span>Automated Assessment Hub</span>
        </div>

        <h2 className="hero-title" style={{ fontSize: '2.2rem' }}>
          Ready to Start a Technical Candidate Assessment?
        </h2>

        <p className="hero-subtitle" style={{ fontSize: '1.05rem', maxWidth: '620px' }}>
          Browse candidate profiles, inspect curriculum plans, and launch an autonomous technical interview in seconds.
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={onGoToCandidateHub}
          style={{ marginTop: '1rem', padding: '1rem 2.5rem', fontSize: '1.05rem' }}
        >
          <User size={20} />
          <span>Go to Candidate Selection Hub</span>
          <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
};
