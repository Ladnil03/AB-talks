import { FeedbackSchema, CandidateProfile } from '../types/interview';

export interface DemoTurn {
  role: 'agent' | 'candidate';
  content: string;
}

export const DEMO_CANDIDATE_ALEX: CandidateProfile = {
  id: 'CAND-002',
  name: 'Alex Turner',
  track: 'Backend Software Engineer',
  background: '5 years exp, B.Tech Computer Science (Go, Python, Microservices & Redis)'
};

export const ALEX_TURNER_DEMO_TRANSCRIPT: DemoTurn[] = [
  {
    role: 'agent',
    content: "Hello Alex Turner! I'll be conducting your technical interview today, focusing on the systems you built during the AI Cohort. We'll cover Chatbot Backend & API Integration, Full-Stack Integration & Streaming Responses, Docker & Kubernetes Deployment. It will be conversational - I'll ask you to walk through your engineering decisions, then dig deeper where it's interesting. Let's start: tell me about your experience building these systems end-to-end."
  },
  {
    role: 'candidate',
    content: "Sure. During the AI Cohort, I worked on building an AI chatbot end-to-end, from the backend API to the frontend integration and deployment. My main focus was connecting the different components into a reliable pipeline rather than treating the LLM as an isolated component.\n\nOn the backend, I used FastAPI to expose a /chat API. The request would come into the API, go through validation and preprocessing, then the system would generate an embedding for the query, retrieve relevant information from the vector database, construct the prompt with that context, and finally call the LLM to generate the response.\n\nFor the frontend integration, I connected the client to the backend API and handled the response asynchronously. One thing I focused on was streaming responses. Instead of waiting several seconds for the complete LLM response and then displaying everything at once, the backend can send generated tokens or chunks progressively, allowing the user to see the response as it's being generated. This improves the perceived responsiveness of the chatbot.\n\nOn the deployment side, I used Docker to containerize the application so that the environment was reproducible. For Kubernetes, the main concept I worked with was deploying the containerized services as pods and allowing Kubernetes to manage service discovery, scaling, and restarting failed containers."
  },
  {
    role: 'agent',
    content: "We're on Day 16: Chatbot Backend & API Integration. Describe how you approached 'Create a /chat API endpoint for the healthcare chatbot' in your project, the engineering decisions you made along the way, and where FastAPI mattered most."
  },
  {
    role: 'candidate',
    content: "I approached the /chat endpoint as the entry point to the entire chatbot pipeline. The endpoint accepts the user's message along with the necessary conversation context, validates the request, and then passes it through the RAG pipeline before returning the response.\n\nOne of my first engineering decisions was to keep the API layer separate from the RAG logic. The FastAPI endpoint should handle things like request validation, authentication, error handling, and response formatting, while the retrieval and LLM logic lives in separate services or functions.\n\nFastAPI mattered most because this is an I/O-heavy application. The endpoint spends a lot of time waiting for external services such as the vector database and LLM. FastAPI's async support allows the server to handle other requests while waiting for those operations."
  },
  {
    role: 'agent',
    content: "We're on Day 18: Full-Stack Integration & Streaming Responses. Describe how you approached 'Implement real-time streaming responses from the LLM' in your project, the engineering decisions you made along the way, and where FastAPI mattered most."
  },
  {
    role: 'candidate',
    content: "I approached streaming as a way to reduce perceived latency. Instead of waiting for the LLM to generate the complete response and then sending one large HTTP response, I designed the backend to forward the generated tokens or chunks to the frontend as they became available.\n\nOn the backend, the important part was making the /chat endpoint return a streaming response. FastAPI's async capabilities and streaming-response support fit this I/O-heavy workflow well. On the frontend, I appended each received chunk to the assistant message so the user sees the answer typed in real time."
  },
  {
    role: 'agent',
    content: "We're on Day 28: Docker & Kubernetes Deployment. Describe how you approached 'Containerize the chatbot backend and frontend using Docker' in your project, the engineering decisions you made along the way, and where Docker mattered most."
  },
  {
    role: 'candidate',
    content: "I approached containerization by treating the chatbot backend and frontend as separate services. One important engineering decision was using multi-stage builds where appropriate, especially for the frontend, copying only the production build into a lightweight runtime image.\n\nDocker mattered most because it gave me a reproducible environment. Without Docker, the application might work on my machine but fail somewhere else due to system libraries or runtime versions. It also made the transition to Kubernetes seamless."
  },
  {
    role: 'agent',
    content: "We're on Day 31: Capstone Project & Final Demo. Describe how you approached 'Demonstrate the complete enterprise healthcare chatbot' in your project, the engineering decisions you made along the way, and where FastAPI mattered most."
  },
  {
    role: 'candidate',
    content: "I approached the capstone as an end-to-end system rather than just an LLM demo. The architecture was: Frontend → FastAPI → Query Processing → Embeddings → Vector Database → Relevant Context → LLM → Response.\n\nFastAPI was the central integration layer connecting the frontend, vector database, and LLM in a clean, validated, and scalable API. It allowed me to separate web/API concerns from retrieval and generation logic and gave a solid foundation for scaling."
  }
];

export const DEMO_FEEDBACK_SYNTHESIS: FeedbackSchema = {
  summary: "The candidate fielded 8 questions across 6 curriculum days. Answers were exceptionally strong, highly architectural, and well-grounded in practical engineering trade-offs.",
  strengths: [
    "Demonstrated a strong grasp of Chatbot Backend & API Integration with concrete mechanisms and trade-offs.",
    "Demonstrated a strong grasp of Full-Stack Integration & Streaming Responses with concrete mechanisms and trade-offs.",
    "Demonstrated a strong grasp of Docker & Kubernetes Deployment with concrete multi-stage build mechanisms.",
    "Demonstrated a strong grasp of Vector Databases Overview & Semantic Search with ChromaDB."
  ],
  gaps: [
    "No major gaps observed; candidate demonstrated senior-level architecture awareness and system boundaries."
  ],
  next: [
    "Practice explaining each mission end-to-end architecture, failure recovery modes, and multi-region scaling."
  ]
};
