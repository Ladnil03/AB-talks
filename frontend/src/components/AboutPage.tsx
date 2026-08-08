import React, { useEffect, useRef, useState } from 'react';
import {
  FileCheck,
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Eye,
  GitBranch,
  Network,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import robinImg from '../assets/robin.jpeg';
import beastBoyImg from '../assets/beast boy!!.jpeg';
import cyborgImg from '../assets/cyborg.jpeg';


interface AboutPageProps {
  onGoToCandidateHub: () => void;
  onLaunchDemo?: () => void;
}

interface CanvasNode {
  id: string;
  label: string;
  role: string;
  col: number;
  row: number;
  description: string;
  techStack: string[];
  latency: string;
  badge: string;
}

interface SimulationStep {
  stepNum: number;
  title: string;
  activeNodeId: string;
  fromNodeId?: string;
  toNodeId?: string;
  phaseLabel: string;
  summary: string;
  requestPayload: string;
  responsePayload: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGoToCandidateHub,
  onLaunchDemo
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-client');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Nodes metadata
  const nodes: CanvasNode[] = [
    {
      id: 'node-client',
      label: '01. Candidate Client UI',
      role: 'Frontend Presentation',
      col: 0,
      row: 1,
      description: 'Single-Page Application built with React 18 & TypeScript. Manages real-time candidate answers, response ideas, and PDF dossier exports.',
      techStack: ['React 18', 'Vite', 'TypeScript', 'Lucide Icons'],
      latency: '12ms',
      badge: 'Client'
    },
    {
      id: 'node-gateway',
      label: '02. FastAPI Gateway',
      role: 'Async REST Router',
      col: 1,
      row: 1,
      description: 'FastAPI backend (/api/interview) handling request validation, thread MemorySaver checkpointer retrieval, and CORS middleware.',
      techStack: ['FastAPI', 'Uvicorn', 'Pydantic v2', 'CORS'],
      latency: '18ms',
      badge: 'Router'
    },
    {
      id: 'node-graph',
      label: '03. LangGraph Orchestrator',
      role: 'State Machine Engine',
      col: 2,
      row: 1,
      description: 'Compiled StateGraph executing interview turns. Uses interrupt() to pause at scenario questions, waiting for candidate HTTP resumes.',
      techStack: ['LangGraph', 'MemorySaver Checkpointer', 'StateGraph', 'Python 3.11'],
      latency: '45ms',
      badge: 'Core Engine'
    },
    {
      id: 'node-llm',
      label: '04. Multi-LLM Router',
      role: 'Model Provider Client',
      col: 3,
      row: 0,
      description: 'Provider-agnostic LLM client supporting Groq (Llama 3.3 70B), Anthropic (Claude 3.5 Sonnet), OpenAI (GPT-4o mini), and offline mock fallback.',
      techStack: ['Groq SDK', 'Anthropic SDK', 'OpenAI SDK', 'Deterministic Mock'],
      latency: '320ms',
      badge: 'LLM Client'
    },
    {
      id: 'node-rag',
      label: '05. Curriculum & RAG',
      role: 'Vector & Mission Store',
      col: 3,
      row: 2,
      description: 'Loads 31-day AI Cohort curriculum dataset (objectives, tools). Pairs candidate background with scenario anchors.',
      techStack: ['Curriculum Dataset', 'Synthetic Candidates', 'Day Planner'],
      latency: '24ms',
      badge: 'Data RAG'
    },
    {
      id: 'node-report',
      label: '06. Synthesis & PDF Dossier',
      role: 'Evaluation Output',
      col: 4,
      row: 1,
      description: 'Synthesizes final assessment results into executive summary, demonstrated strengths, identified gaps, and printable PDF dossiers.',
      techStack: ['CSS Print Engine', 'PDF Letterhead Formatter', 'Synthesis Builder'],
      latency: '150ms',
      badge: 'PDF Dossier'
    }
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // REAL Live Turn Simulation Steps from Alex Turner's Demo Transcript
  const simSteps: SimulationStep[] = [
    {
      stepNum: 1,
      title: 'Step 1: Candidate Input Submission',
      activeNodeId: 'node-client',
      fromNodeId: 'node-client',
      toNodeId: 'node-gateway',
      phaseLabel: 'Candidate -> API Gateway',
      summary: 'Candidate Alex Turner submits technical response regarding FastAPI, Docker, and streaming chatbot integration.',
      requestPayload: JSON.stringify({
        sessionId: 'sess_177053421',
        candidate: { id: 'CAND-002', name: 'Alex Turner', track: 'Backend Software Engineer' },
        message: 'During the AI Cohort, I worked on building an AI chatbot end-to-end using FastAPI to expose a /chat API, Docker containerization, and streaming responses...'
      }, null, 2),
      responsePayload: JSON.stringify({
        status: 'Transmitting payload over HTTP POST /api/interview',
        bytesSent: 742,
        transport: 'fetch() async'
      }, null, 2)
    },
    {
      stepNum: 2,
      title: 'Step 2: FastAPI Preprocessing & Routing',
      activeNodeId: 'node-gateway',
      fromNodeId: 'node-gateway',
      toNodeId: 'node-graph',
      phaseLabel: 'FastAPI -> LangGraph Engine',
      summary: 'FastAPI validates InterviewRequest JSON, loads checkpointer session from MemorySaver, and invokes run_turn().',
      requestPayload: JSON.stringify({
        endpoint: 'POST /api/interview',
        sessionStoreKey: 'sess_177053421',
        incomingMessage: 'During the AI Cohort, I worked on building an AI chatbot end-to-end...'
      }, null, 2),
      responsePayload: JSON.stringify({
        status: '200 OK',
        threadConfig: { configurable: { thread_id: 'sess_177053421' } },
        invokedGraph: 'compiled_graph.invoke()'
      }, null, 2)
    },
    {
      stepNum: 3,
      title: 'Step 3: LangGraph State Resume & Turn Control',
      activeNodeId: 'node-graph',
      fromNodeId: 'node-graph',
      toNodeId: 'node-rag',
      phaseLabel: 'LangGraph State Machine',
      summary: 'LangGraph resumes from interrupt(), appends candidate answer to transcript, and evaluates current curriculum day.',
      requestPayload: JSON.stringify({
        currentNode: 'node_evaluate_answer',
        phase: 'AWAIT_ANSWER -> EVALUATE',
        questions_asked: 1,
        current_day_index: 0,
        days_covered: [16]
      }, null, 2),
      responsePayload: JSON.stringify({
        transcript_appended: true,
        candidate_entry: { role: 'candidate', content: 'During the AI Cohort...', day: 16 }
      }, null, 2)
    },
    {
      stepNum: 4,
      title: 'Step 4: Curriculum Anchors & RAG Retrieval',
      activeNodeId: 'node-rag',
      fromNodeId: 'node-graph',
      toNodeId: 'node-rag',
      phaseLabel: 'LangGraph <-> Curriculum RAG',
      summary: 'Retrieves Day 16 Chatbot Backend & API Integration mission objectives and calculates candidate performance signal.',
      requestPayload: JSON.stringify({
        day_no: 16,
        title: 'Chatbot Backend & API Integration',
        candidate_track: 'Backend Software Engineer'
      }, null, 2),
      responsePayload: JSON.stringify({
        objectives: ['Create a /chat API endpoint for the healthcare chatbot'],
        tools: ['FastAPI', 'Uvicorn', 'Pydantic'],
        signal: 'standard'
      }, null, 2)
    },
    {
      stepNum: 5,
      title: 'Step 5: LLM Model Provider Generation',
      activeNodeId: 'node-llm',
      fromNodeId: 'node-graph',
      toNodeId: 'node-llm',
      phaseLabel: 'LangGraph <-> Multi-LLM Provider',
      summary: 'Groq (Llama 3.3 70B) evaluates answer depth as DEEP and generates next primary scenario question prompt.',
      requestPayload: JSON.stringify({
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        schema: { depth: 'SHALLOW|MEDIUM|DEEP', should_follow_up: 'bool' },
        promptKind: 'question'
      }, null, 2),
      responsePayload: JSON.stringify({
        eval_result: { depth: 'DEEP', should_follow_up: false, reasoning: 'Answer covered FastAPI async mechanisms & trade-offs.' },
        next_question: 'We\'re on Day 16: Chatbot Backend & API Integration. Describe how you approached...'
      }, null, 2)
    },
    {
      stepNum: 6,
      title: 'Step 6: InterviewResponse Return & Interrupt Pause',
      activeNodeId: 'node-report',
      fromNodeId: 'node-graph',
      toNodeId: 'node-client',
      phaseLabel: 'LangGraph -> Client UI Return',
      summary: 'LangGraph pauses execution at interrupt(question), returning InterviewResponse JSON reply to client UI.',
      requestPayload: JSON.stringify({
        phase: 'ASKING -> AWAIT_ANSWER',
        questions_asked: 2,
        days_covered: [16]
      }, null, 2),
      responsePayload: JSON.stringify({
        reply: "We're on Day 16: Chatbot Backend & API Integration. Describe how you approached 'Create a /chat API endpoint for the healthcare chatbot' in your project, the engineering decisions you made along the way, and where FastAPI mattered most.",
        done: false,
        questionsAsked: 2
      }, null, 2)
    }
  ];

  const currentSim = simSteps[simStepIndex];

  // Auto-Play Simulation Loop
  useEffect(() => {
    if (!isSimPlaying) return;

    const timer = setInterval(() => {
      setSimStepIndex((prev) => {
        const next = (prev + 1) % simSteps.length;
        setSelectedNodeId(simSteps[next].activeNodeId);
        return next;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [isSimPlaying]);

  // Sync selected node when user steps manually
  const handleSetStep = (index: number) => {
    setIsSimPlaying(false);
    setSimStepIndex(index);
    setSelectedNodeId(simSteps[index].activeNodeId);
  };

  // 2D Sequential Single-Packet Flow Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animFrameId: number;
    let particleT = 0;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || 900;
      const height = 460;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clean Light Blueprint Grid Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calculate 5-column node coordinates
      const numCols = 5;
      const colWidth = (width - 160) / (numCols - 1);
      const startX = 80;

      const getNodePos = (node: CanvasNode) => {
        const x = startX + node.col * colWidth;
        let y = height / 2;
        if (node.row === 0) y = height / 2 - 120;
        if (node.row === 2) y = height / 2 + 120;
        return { x, y };
      };

      const cardWidth = 155;
      const cardHeight = 74;

      particleT = (particleT + 0.025) % 1;

      const activeNodeId = currentSim.activeNodeId;
      const fromNodeId = currentSim.fromNodeId;
      const toNodeId = currentSim.toNodeId;

      // Render Connection Channels
      const renderEdge = (fromId: string, toId: string) => {
        const fromNode = nodes.find((n) => n.id === fromId);
        const toNode = nodes.find((n) => n.id === toId);
        if (!fromNode || !toNode) return;

        const p1 = getNodePos(fromNode);
        const p2 = getNodePos(toNode);

        const isActiveChannel = (fromId === fromNodeId && toId === toNodeId) || (fromId === toNodeId && toId === fromNodeId);

        const midX = p1.x + (p2.x - p1.x) * 0.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(midX, p1.y, midX, p2.y, p2.x, p2.y);

        if (isActiveChannel) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([]);
          ctx.shadowColor = 'rgba(37, 99, 235, 0.4)';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // EXACT FLOW: ONLY ONE DATA PACKET passing on the active layer edge!
        if (isActiveChannel) {
          const t = particleT;
          const bx = Math.pow(1 - t, 3) * p1.x + 3 * Math.pow(1 - t, 2) * t * midX + 3 * (1 - t) * Math.pow(t, 2) * midX + Math.pow(t, 3) * p2.x;
          const by = Math.pow(1 - t, 3) * p1.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p2.y;

          // Glowing Outer Ring
          ctx.beginPath();
          ctx.arc(bx, by, 11, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.25)';
          ctx.fill();

          // Single Core Packet Dot
          ctx.beginPath();
          ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#2563eb';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Direction Arrow Marker at Midpoint
          const arrowX = midX;
          const arrowY = (p1.y + p2.y) / 2;
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Draw Edges sequentially
      renderEdge('node-client', 'node-gateway');
      renderEdge('node-gateway', 'node-graph');
      renderEdge('node-graph', 'node-llm');
      renderEdge('node-graph', 'node-rag');
      renderEdge('node-graph', 'node-report');

      // Render 2D Node Cards with Layer Status
      nodes.forEach((node, nodeIdx) => {
        const pos = getNodePos(node);
        const isActiveNode = node.id === activeNodeId;
        const isHovered = node.id === hoveredNodeId;
        const isCompleted = nodeIdx < simStepIndex;

        const x = pos.x - cardWidth / 2;
        const y = pos.y - cardHeight / 2;

        ctx.save();

        if (isActiveNode) {
          ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 5;
        } else if (isHovered) {
          ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 3;
        } else {
          ctx.shadowColor = 'rgba(15, 23, 42, 0.04)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, cardWidth, cardHeight, 10);
        } else {
          ctx.rect(x, y, cardWidth, cardHeight);
        }

        ctx.fillStyle = isActiveNode ? '#eff6ff' : '#ffffff';
        ctx.fill();

        ctx.lineWidth = isActiveNode ? 2.5 : isHovered ? 2 : 1.5;
        ctx.strokeStyle = isActiveNode ? '#2563eb' : isCompleted ? '#16a34a' : isHovered ? '#3b82f6' : '#cbd5e1';
        ctx.stroke();

        ctx.restore();

        // Node Title Text
        ctx.fillStyle = isActiveNode ? '#1e3a8a' : '#0f172a';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(node.label, x + 10, y + 26);

        // Node Role Subtext
        ctx.fillStyle = '#64748b';
        ctx.font = '400 10.5px "Inter", sans-serif';
        ctx.fillText(node.role, x + 10, y + 44);

        // Step Status Badge Pill
        const statusText = isActiveNode ? 'PROCESSING' : isCompleted ? '✓ PASSED' : 'QUEUED';
        const badgeX = x + cardWidth - (isActiveNode ? 72 : isCompleted ? 56 : 50);
        const badgeY = y + 48;
        const badgeW = isActiveNode ? 64 : isCompleted ? 48 : 42;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, 16, 8);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, 16);
        }
        ctx.fillStyle = isActiveNode ? '#dbeafe' : isCompleted ? '#dcfce7' : '#f1f5f9';
        ctx.fill();

        ctx.fillStyle = isActiveNode ? '#1e40af' : isCompleted ? '#15803d' : '#64748b';
        ctx.font = '700 8.5px "Inter", sans-serif';
        ctx.fillText(statusText, badgeX + 4, badgeY + 11);
      });

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [simStepIndex, isSimPlaying, hoveredNodeId]);

  // Handle Canvas Hover & Click
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = 460;
    const numCols = 5;
    const colWidth = (width - 160) / (numCols - 1);
    const startX = 80;
    const cardWidth = 155;
    const cardHeight = 74;

    let foundId: string | null = null;

    nodes.forEach((node) => {
      const cx = startX + node.col * colWidth;
      let cy = height / 2;
      if (node.row === 0) cy = height / 2 - 120;
      if (node.row === 2) cy = height / 2 + 120;

      const x1 = cx - cardWidth / 2;
      const x2 = cx + cardWidth / 2;
      const y1 = cy - cardHeight / 2;
      const y2 = cy + cardHeight / 2;

      if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
        foundId = node.id;
      }
    });

    setHoveredNodeId(foundId);
  };

  const handleCanvasClick = () => {
    if (hoveredNodeId) {
      setSelectedNodeId(hoveredNodeId);
      const stepIdx = simSteps.findIndex((s) => s.activeNodeId === hoveredNodeId);
      if (stepIdx !== -1) {
        setSimStepIndex(stepIdx);
      }
    }
  };

  // TEEN TITANS GO Team Details (Avatar, Name & Role)
  const teamMembers = [
    {
      name: 'Tirth Bhanderi',
      role: 'Full-Stack Engineer',
      avatar: robinImg,
      initials: 'TB'
    },
    {
      name: 'Nil Lad',
      role: 'DevOps Engineer',
      avatar: cyborgImg,
      initials: 'NL'
    },
    {
      name: 'Manan Panchal',
      role: 'AI Engineer',
      avatar: beastBoyImg,
      initials: 'MP'
    }
  ];

  return (
    <div className="landing-view">
      {/* 1. Header Section */}
      <section className="setup-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge-tag" style={{ marginBottom: '0.6rem' }}>
              <Sparkles size={14} />
              <span>Interactive Request-Response Flow Simulator</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: '2.2rem', textAlign: 'left' }}>
              Live Turn Simulation & Architecture Flow
            </h1>
            <p className="hero-subtitle" style={{ textAlign: 'left', fontSize: '1.05rem', maxWidth: '780px' }}>
              Watch a real candidate turn payload flow step-by-step through the FastAPI gateway, LangGraph state engine, and LLM model provider.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={onGoToCandidateHub}
            >
              <User size={18} />
              <span>Select Candidate</span>
            </button>
            {onLaunchDemo && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onLaunchDemo}
              >
                <Sparkles size={16} />
                <span>60s Pitch Demo</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Interactive Request-Response Simulation Canvas */}
      <section className="setup-card">
        {/* Simulation Control Toolbar */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="tag-pill" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, marginBottom: '0.4rem', display: 'inline-block' }}>
              {currentSim.phaseLabel}
            </span>
            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
              {currentSim.title}
            </h2>
          </div>

          {/* Stepper & Auto-Play Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSetStep((simStepIndex - 1 + simSteps.length) % simSteps.length)}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
            >
              <ChevronLeft size={15} />
              <span>Previous Step</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsSimPlaying((prev) => !prev)}
              style={{ padding: '0.4rem 1.1rem', fontSize: '0.85rem' }}
            >
              {isSimPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isSimPlaying ? 'Pause Simulation' : 'Auto-Play Live Flow'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSetStep((simStepIndex + 1) % simSteps.length)}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
            >
              <span>Next Step</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Step Badge Selection Bar */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {simSteps.map((step, idx) => (
            <button
              key={idx}
              type="button"
              className={`filter-tab ${simStepIndex === idx ? 'active' : ''}`}
              onClick={() => handleSetStep(idx)}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Step 0{step.stepNum}
            </button>
          ))}
        </div>        {/* Canvas Render Workspace */}
        <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '460px',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: 'var(--shadow-soft)',
              cursor: hoveredNodeId ? 'pointer' : 'default'
            }}
          />
        </div>

        {/* Continuous System Node Interconnection & Flow Chain Map */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={16} style={{ color: '#2563eb' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Continuous Layer-by-Layer Data Transmission Pipeline
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Single Data Packet Flow Mode: <span style={{ color: '#16a34a' }}>● Active</span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
            {nodes.map((node, i) => {
              const isActive = node.id === currentSim.activeNodeId;
              const isCompleted = i < simStepIndex;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    const idx = simSteps.findIndex((s) => s.activeNodeId === node.id);
                    if (idx !== -1) handleSetStep(idx);
                  }}
                  style={{
                    background: isActive ? '#eff6ff' : isCompleted ? '#f0fdf4' : '#f8fafc',
                    border: isActive ? '2px solid #2563eb' : isCompleted ? '1.5px solid #22c55e' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isActive ? '#1e40af' : isCompleted ? '#15803d' : '#64748b' }}>
                      LAYER 0{i + 1}
                    </span>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isActive ? '#2563eb' : isCompleted ? '#22c55e' : '#cbd5e1',
                      boxShadow: isActive ? '0 0 6px #2563eb' : isCompleted ? '0 0 6px #22c55e' : 'none'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isActive ? '#1e3a8a' : isCompleted ? '#14532d' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.badge}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Live Request & Response Payload Inspector */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderLeft: '4px solid #2563eb',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Eye size={18} style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                Live Step {currentSim.stepNum} Payload Inspector: {currentSim.title}
              </span>
            </div>
            <span className="tag-pill" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>
              Active Layer: {selectedNode.label}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            {currentSim.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Live Request JSON */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Incoming Request Payload (JSON)
              </span>
              <pre style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: '0.75rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                marginTop: '0.4rem',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                maxHeight: '180px'
              }}>
                <code>{currentSim.requestPayload}</code>
              </pre>
            </div>

            {/* Live Response JSON */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Processed Response / State Mutation (JSON)
              </span>
              <pre style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: '0.75rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                marginTop: '0.4rem',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                maxHeight: '180px'
              }}>
                <code>{currentSim.responsePayload}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Final Output Generation Result (Displayed at Final Layer Synthesis) */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #16a34a',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                Final Output Generation: Complete AI Evaluation & Response Output
              </span>
            </div>
            <span className="tag-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, border: 'none' }}>
              Layer 06 Output Ready
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Output Item 1: AI Generated Follow-Up Question */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                1. Generated AI Follow-Up Question Prompt
              </div>
              <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.5 }}>
                "We're on Day 16: Chatbot Backend & API Integration. Describe how you approached 'Create a /chat API endpoint' in your project, the engineering decisions you made along the way, and where FastAPI mattered most."
              </p>
            </div>

            {/* Output Item 2: Candidate Evaluation Score */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                2. Computed Candidate Competency Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>DEEP</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                  Answer covered FastAPI async mechanics & structural trade-offs. Signal: <strong style={{ color: '#16a34a' }}>Strong Hire</strong>
                </div>
              </div>
            </div>

            {/* Output Item 3: PDF Dossier Certificate Synthesis */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                3. Synthesized PDF Dossier & Certificate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                <FileCheck size={26} style={{ color: '#9333ea' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Alex_Turner_Dossier.pdf</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Executive Summary + Strengths + Gaps</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Architectural Pillars */}
      <section className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon">
            <GitBranch size={20} />
          </div>
          <h3 className="pillar-title">LangGraph Interrupt Engine</h3>
          <p className="pillar-desc">
            State machine pauses execution at scenario questions via interrupt() and resumes cleanly upon candidate HTTP message submission without blocking main looper threads.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <ShieldCheck size={20} />
          </div>
          <h3 className="pillar-title">Deterministic Fallback Safeguard</h3>
          <p className="pillar-desc">
            Gracefully degrades to structured offline mock mode on API rate limits or network issues, guaranteeing 100% uptime and zero runtime crashes.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <FileCheck size={20} />
          </div>
          <h3 className="pillar-title">Printable PDF Dossiers</h3>
          <p className="pillar-desc">
            Generates high-contrast formal printable PDF synthesis reports and candidate competency certificates.
          </p>
        </div>
      </section>

      {/* 4. Engineering Team Details Section */}
      <section className="setup-card">
        <div className="section-header">
          <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
            <User size={22} style={{ color: 'var(--accent-primary)' }} />
            TEEN TITANS GO
          </h2>
          <p className="section-description">
            The core engineers who built the Dayflow AI Interviewer autonomous evaluation platform.
          </p>
        </div>

        <div className="candidate-grid">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="step-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    minWidth: '52px',
                    minHeight: '52px',
                    maxWidth: '52px',
                    maxHeight: '52px',
                    aspectRatio: '1 / 1',
                    flexShrink: 0,
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid #2563eb',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{member.name}</h3>
                  <span className="tag-pill" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, border: 'none' }}>
                    {member.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
