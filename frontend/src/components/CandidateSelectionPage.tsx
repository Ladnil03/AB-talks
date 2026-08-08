import React, { useEffect, useState } from 'react';
import { 
  User, 
  Bot, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  ArrowLeft 
} from 'lucide-react';
import { CandidateProfile } from '../types/interview';
import { fetchCandidates } from '../services/api';
import { DEFAULT_CANDIDATES } from './LandingPage';

interface CandidateSelectionPageProps {
  selectedCandidate: CandidateProfile;
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onStartSession: () => void;
  onGoHome: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const CandidateSelectionPage: React.FC<CandidateSelectionPageProps> = ({
  selectedCandidate,
  onSelectCandidate,
  onStartSession,
  onGoHome,
  isLoading
}) => {
  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>(DEFAULT_CANDIDATES);
  const [activeTab, setActiveTab] = useState<'all' | 'data' | 'backend' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCandidates().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setCandidatesList(fetched);
        if (!fetched.some((c) => c.id === selectedCandidate.id)) {
          onSelectCandidate(fetched[0]);
        }
      }
    });
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Filter candidates by track tab & search query
  const filteredCandidates = candidatesList.filter((cand) => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cand.track && cand.track.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cand.background && cand.background.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'data') return cand.track?.toLowerCase().includes('data');
    if (activeTab === 'backend') return cand.track?.toLowerCase().includes('backend') || cand.track?.toLowerCase().includes('software');
    if (activeTab === 'ai') return cand.track?.toLowerCase().includes('ai') || cand.track?.toLowerCase().includes('ml');

    return true;
  });

  return (
    <div className="landing-view">
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={onGoHome}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <span className="badge-tag">
          Candidate Hub • Step 1 of 2
        </span>
      </div>

      {/* Main Selection Setup Card */}
      <section className="setup-card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
              <User size={24} style={{ color: 'var(--accent-primary)' }} />
              Candidate Profile Selection
            </h2>
            <p className="section-description">
              Select an engineering candidate profile to initialize an experience-grounded, multi-turn interview curriculum.
            </p>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <Search size={16} style={{ color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Filter by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="filter-tabs-row">
          <button 
            type="button"
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Candidates ({candidatesList.length})
          </button>
          <button 
            type="button"
            className={`filter-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Engineering
          </button>
          <button 
            type="button"
            className={`filter-tab ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            Backend & Systems
          </button>
          <button 
            type="button"
            className={`filter-tab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            AI & ML Engineering
          </button>
        </div>

        {/* Candidate Cards Grid */}
        <div className="candidate-grid">
          {filteredCandidates.map((cand) => {
            const isSelected = selectedCandidate.id === cand.id;
            const initials = getInitials(cand.name);

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className="candidate-avatar">
                      {initials}
                    </div>
                    <div className="candidate-meta">
                      <span className="candidate-name">{cand.name}</span>
                      <span className="candidate-track">{cand.track || 'Engineering Track'}</span>
                    </div>
                  </div>
                  <div className="candidate-radio" aria-hidden="true">
                    <div className="candidate-radio-inner" />
                  </div>
                </div>

                <p className="candidate-summary">{cand.background}</p>

                <div className="candidate-tags">
                  <span className="tag-pill">ID: {cand.id}</span>
                  <span className="tag-pill">Experience Grounded</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Target Assessment Plan Drawer */}
        {selectedCandidate && (
          <div className="candidate-inspection-box">
            <div className="inspection-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Target Assessment Plan for {selectedCandidate.name}
                </span>
              </div>
              <span className="tag-pill" style={{ background: '#eff6ff', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {selectedCandidate.track}
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Curriculum anchors automatically configured for <strong>{selectedCandidate.name}</strong>. 
              The interview will evaluate architectural trade-offs, concurrency, and system resilience grounded in their background.
            </p>
          </div>
        )}

        {/* Launch Action Footer */}
        <div className="action-row">
          <div className="action-hint">
            <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
            <span>Ready to evaluate performance for {selectedCandidate.name}</span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onStartSession}
            disabled={isLoading}
            style={{ padding: '0.9rem 2rem' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Initializing Interview...</span>
              </>
            ) : (
              <>
                <Bot size={18} />
                <span>Start Technical Interview</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
