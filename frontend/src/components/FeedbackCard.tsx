import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Printer, 
  Bot, 
  Award, 
  ShieldCheck, 
  BadgeCheck,
  Layers
} from 'lucide-react';
import { FeedbackSchema, CandidateProfile } from '../types/interview';

interface FeedbackCardProps {
  feedback: FeedbackSchema;
  onRestart: () => void;
  selectedCandidate?: CandidateProfile;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
  feedback, 
  onRestart,
  selectedCandidate 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'certificate' | 'full'>('report');

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certId = `CERT-DF-2026-${(selectedCandidate?.id || '001').replace(/[^0-9]/g, '') || '9842'}`;

  const handleCopyReport = () => {
    const textReport = `
=== DAYFLOW AI TECHNICAL EVALUATION REPORT ===
Candidate: ${selectedCandidate?.name || 'Candidate'} (${selectedCandidate?.track || 'Engineering'})
Certificate ID: ${certId}
Date: ${currentDate}

EXECUTIVE SUMMARY:
${feedback.summary}

KEY STRENGTHS:
${feedback.strengths.map((s) => `• ${s}`).join('\n')}

IDENTIFIED GAPS:
${feedback.gaps.map((g) => `• ${g}`).join('\n')}

RECOMMENDED NEXT STEPS:
${feedback.next.map((n) => `• ${n}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="feedback-view print-container">
      {/* Formal Printable PDF Letterhead Header */}
      <div className="pdf-letterhead">
        <div className="pdf-brand-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
              <Bot size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Dayflow AI Evaluation Engine</h1>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Autonomous Candidate Technical Assessment</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#2563eb' }}>
              {activeTab === 'certificate' ? 'OFFICIAL COMPETENCY CERTIFICATE' : 'OFFICIAL EVALUATION REPORT'}
            </span>
            <p style={{ fontSize: '0.8rem', color: '#475569' }}>Issued: {currentDate}</p>
          </div>
        </div>

        <div className="pdf-candidate-meta-bar">
          <div className="meta-item">
            <span className="meta-label">Candidate Name</span>
            <span className="meta-value">{selectedCandidate?.name || 'Candidate Profile'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Target Role / Track</span>
            <span className="meta-value">{selectedCandidate?.track || 'Software Engineer'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Certificate ID</span>
            <span className="meta-value">{certId}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Assessment Result</span>
            <span className="meta-value" style={{ color: '#16a34a', fontWeight: 700 }}>
              Verified (Pass with Distinction)
            </span>
          </div>
        </div>
      </div>

      {/* On-Screen Header Navigation Tabs */}
      <div className="feedback-header no-print">
        <div className="feedback-title-group">
          <h2>Technical Assessment Results</h2>
          <p>Structured evaluation generated for {selectedCandidate?.name || 'Candidate'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <FileText size={15} style={{ display: 'inline', marginRight: '0.3rem' }} />
            Synthesis Report
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            <Award size={15} style={{ display: 'inline', marginRight: '0.3rem' }} />
            Official Certificate
          </button>

          <button
            type="button"
            className={`filter-tab ${activeTab === 'full' ? 'active' : ''}`}
            onClick={() => setActiveTab('full')}
          >
            <Layers size={15} style={{ display: 'inline', marginRight: '0.3rem' }} />
            Full Dossier (Both)
          </button>
        </div>
      </div>

      {/* Official Verified Certificate Card Component */}
      {(activeTab === 'certificate' || activeTab === 'full') && (
        <div className={`certificate-card-box ${activeTab === 'full' ? 'dossier-page-break' : ''}`}>
          <div className="certificate-inner-border">
            <div className="certificate-top-row">
              <div className="certificate-emblem">
                <Award size={28} />
              </div>
              <div className="certificate-header-text">
                <span className="cert-subtitle">DAYFLOW AI EVALUATION ENGINE</span>
                <h3 className="cert-title">CERTIFICATE OF TECHNICAL COMPETENCY</h3>
              </div>
              <div className="certificate-verified-badge">
                <BadgeCheck size={18} />
                <span>Verified ID</span>
              </div>
            </div>

            <div className="certificate-body">
              <p className="cert-present-text">This official certificate is proudly awarded to</p>
              <h2 className="cert-candidate-name">{selectedCandidate?.name || 'Candidate Profile'}</h2>
              <p className="cert-role-text">for demonstrating architectural depth in <strong>{selectedCandidate?.track || 'Engineering Track'}</strong></p>
              <p className="cert-desc-text">
                Has successfully completed an autonomous multi-turn technical evaluation assessing system design trade-offs, concurrency handling, and technical problem-solving.
              </p>
            </div>

            <div className="certificate-footer-row">
              <div className="cert-footer-item">
                <span className="cert-meta-label">Certificate ID</span>
                <span className="cert-meta-val">{certId}</span>
              </div>

              <div className="cert-footer-item">
                <span className="cert-meta-label">Issue Date</span>
                <span className="cert-meta-val">{currentDate}</span>
              </div>

              <div className="cert-footer-item" style={{ textAlign: 'right' }}>
                <span className="cert-meta-label">Authentication Signature</span>
                <span className="cert-meta-val" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                  <ShieldCheck size={15} /> Dayflow AI Engine v1.0
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Synthesis Report Content */}
      {(activeTab === 'report' || activeTab === 'full') && (
        <div className="report-content-wrapper">
          {/* Executive Summary Box */}
          <div className="summary-card-box">
            <span className="summary-card-label">
              <FileText size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
              Executive Performance Summary
            </span>
            <p className="summary-card-text">{feedback.summary}</p>
          </div>

          {/* Grid of Strengths, Gaps, and Next Steps */}
          <div className="feedback-sections-grid">
            {/* Strengths Box */}
            <div className="eval-box strengths">
              <div className="eval-box-header">
                <CheckCircle2 size={20} />
                <span>Demonstrated Technical Strengths</span>
              </div>

              <ul className="eval-list">
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} className="eval-list-item">
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps Box */}
            <div className="eval-box gaps">
              <div className="eval-box-header">
                <AlertTriangle size={20} />
                <span>Identified Technical Gaps</span>
              </div>

              <ul className="eval-list">
                {feedback.gaps.map((gap, idx) => (
                  <li key={idx} className="eval-list-item">
                    <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Steps */}
            <div className="eval-box next">
              <div className="eval-box-header">
                <Sparkles size={20} />
                <span>Recommended Growth & Action Plan</span>
              </div>

              <ul className="eval-list">
                {feedback.next.map((item, idx) => (
                  <li key={idx} className="eval-list-item">
                    <ArrowRight size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Buttons (Hidden in PDF print) */}
      <div className="feedback-actions no-print">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handlePrintPdf}
            style={{ background: '#2563eb' }}
          >
            <Printer size={16} />
            <span>
              {activeTab === 'report' && 'Print / Export Synthesis Report (PDF)'}
              {activeTab === 'certificate' && 'Print / Export Certificate (PDF)'}
              {activeTab === 'full' && 'Print / Export Full Dossier (PDF)'}
            </span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyReport}
          >
            {copied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
            <span>{copied ? 'Report Copied!' : 'Copy Text Summary'}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onRestart}
        >
          <RotateCcw size={16} />
          <span>Start New Interview Session</span>
        </button>
      </div>
    </div>
  );
};
