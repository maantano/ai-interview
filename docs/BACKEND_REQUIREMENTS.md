# Backend/API Requirements

## Current Implementation Status

### ✅ Completed Features
- **Local Storage System** for session persistence
- **Mock Data Layer** with sample questions and analysis
- **Answer Analysis Algorithm** (basic scoring logic)
- **Local State Management** for interview sessions

### ❌ Missing Backend Infrastructure

#### Critical Priority
1. **Database Architecture**
   - User management system
   - Session data persistence
   - Question bank management
   - Analytics data storage

2. **Authentication & Authorization**
   - JWT token management
   - OAuth integration (Google, LinkedIn)
   - Role-based access control
   - Session security

3. **AI Integration Layer**
   - OpenAI GPT-4 API integration
   - Real-time answer analysis
   - Dynamic question generation
   - Personalized feedback system

## API Endpoints Specification

### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/oauth/google
POST /api/auth/oauth/linkedin
```

### User Management
```typescript
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
GET    /api/users/settings
PUT    /api/users/settings
POST   /api/users/avatar
```

### Interview Session Endpoints
```typescript
POST   /api/sessions                    // Start new session
GET    /api/sessions                    // Get user sessions
GET    /api/sessions/:id               // Get specific session
PUT    /api/sessions/:id               // Update session
DELETE /api/sessions/:id               // Delete session
POST   /api/sessions/:id/complete      // Complete session
```

### Question Management
```typescript
GET    /api/questions                  // Get questions by category
GET    /api/questions/:id             // Get specific question
POST   /api/questions/generate        // AI-generate questions
GET    /api/questions/categories      // Get available categories
GET    /api/questions/difficulties    // Get difficulty levels
```

### Answer Analysis
```typescript
POST   /api/analysis/answer           // Analyze user answer
GET    /api/analysis/:id              // Get analysis result
POST   /api/analysis/batch            // Batch analyze answers
GET    /api/analysis/feedback/:id     // Get detailed feedback
```

### Analytics & Reporting
```typescript
GET    /api/analytics/user-stats      // User performance stats
GET    /api/analytics/progress        // Progress over time
GET    /api/analytics/skills          // Skill analysis
GET    /api/analytics/benchmarks     // Comparison data
POST   /api/analytics/export         // Export data
```

### Admin Endpoints
```typescript
GET    /api/admin/users               // User management
GET    /api/admin/sessions            // Session overview
GET    /api/admin/analytics           // Platform analytics
POST   /api/admin/questions           // Add questions
PUT    /api/admin/questions/:id       // Update questions
DELETE /api/admin/questions/:id       // Delete questions
```

## Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin'
  preferences: {
    jobCategory: JobCategory
    difficulty: 'easy' | 'medium' | 'hard'
    notifications: boolean
    language: 'ko' | 'en'
  }
  subscription: {
    type: 'free' | 'premium'
    expiresAt?: Date
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}
```

### Interview Session Model
```typescript
interface InterviewSession {
  id: string
  userId: string
  category: JobCategory
  customCategory?: string
  status: 'active' | 'completed' | 'abandoned'
  questions: SessionQuestion[]
  results: AnalysisResult[]
  totalScore?: number
  duration: number // in seconds
  createdAt: Date
  completedAt?: Date
  metadata: {
    userAgent: string
    platform: string
    sessionSource: string
  }
}

interface SessionQuestion {
  id: string
  questionId: string
  order: number
  startedAt: Date
  answeredAt?: Date
  answer?: string
  timeSpent: number // in seconds
}
```

### Question Model
```typescript
interface Question {
  id: string
  category: JobCategory
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'behavioral' | 'technical' | 'situational'
  question: string
  tags: string[]
  expectedKeywords: string[]
  sampleAnswer: string
  evaluationCriteria: {
    understanding: string
    logic: string
    specificity: string
    jobFit: string
  }
  isActive: boolean
  createdBy: string // admin ID
  createdAt: Date
  updatedAt: Date
  usageCount: number
  averageScore: number
}
```

### Analysis Result Model
```typescript
interface AnalysisResult {
  id: string
  sessionId: string
  questionId: string
  userAnswer: string
  scores: {
    understanding: number // 0-25
    logic: number // 0-25
    specificity: number // 0-25
    jobFit: number // 0-25
  }
  totalScore: number // 0-100
  strengths: string[]
  improvements: string[]
  detailedFeedback: {
    grammar: string
    structure: string
    content: string
    suggestions: string[]
  }
  aiAnalysis: {
    model: string // GPT-4, etc.
    confidence: number
    processingTime: number
  }
  idealAnswer: string
  createdAt: Date
}
```

### Analytics Model
```typescript
interface UserAnalytics {
  id: string
  userId: string
  date: Date
  metrics: {
    sessionsCompleted: number
    averageScore: number
    timeSpent: number
    questionsAnswered: number
    improvementRate: number
  }
  skillBreakdown: {
    [skillName: string]: {
      score: number
      trend: 'improving' | 'stable' | 'declining'
      questionsCount: number
    }
  }
  createdAt: Date
}
```

## AI Integration Points

### OpenAI GPT-4 Integration
```typescript
interface AIService {
  analyzeAnswer(question: string, answer: string, context: AnalysisContext): Promise<AnalysisResult>
  generateQuestion(category: JobCategory, difficulty: string, previousQuestions: string[]): Promise<Question>
  generateFeedback(analysis: AnalysisResult): Promise<DetailedFeedback>
  generateIdealAnswer(question: string, jobContext: JobContext): Promise<string>
}

interface AnalysisContext {
  jobCategory: JobCategory
  userLevel: 'entry' | 'mid' | 'senior'
  previousAnswers: string[]
  sessionDuration: number
}
```

### AI Prompt Templates
```typescript
const ANALYSIS_PROMPT = `
Analyze this interview answer for a ${jobCategory} position:

Question: ${question}
Answer: ${answer}

Evaluate on:
1. Understanding (0-25): How well did they understand the question?
2. Logic (0-25): Is the answer logically structured?
3. Specificity (0-25): Are there concrete examples and details?
4. Job Fit (0-25): How relevant is this to the job role?

Provide specific feedback and improvement suggestions.
Format the response as JSON.
`

const QUESTION_GENERATION_PROMPT = `
Generate a ${difficulty} level interview question for a ${jobCategory} position.
Avoid these previously asked questions: ${previousQuestions.join(', ')}

The question should:
- Test relevant skills for the role
- Be appropriate for the difficulty level
- Encourage detailed, specific answers
- Be commonly asked in real interviews
`
```

## Session Management

### Session Lifecycle
1. **Session Creation**
   - Generate unique session ID
   - Initialize with user preferences
   - Create session record in database
   - Start analytics tracking

2. **Question Flow**
   - Generate/select next question based on algorithm
   - Track question start time
   - Monitor user engagement
   - Handle session timeouts

3. **Answer Processing**
   - Validate answer input
   - Queue for AI analysis
   - Store preliminary data
   - Provide immediate feedback

4. **Session Completion**
   - Calculate final scores
   - Generate comprehensive report
   - Update user analytics
   - Archive session data

### Session Security
```typescript
interface SessionSecurity {
  maxDuration: number // 2 hours
  timeoutWarning: number // 5 minutes before timeout
  maxQuestionsPerSession: number // 20 questions
  rateLimiting: {
    answersPerMinute: number // 2 answers per minute
    sessionsPerDay: number // 5 sessions per day
  }
}
```

## Error Handling Strategy

### Error Categories
```typescript
enum ErrorType {
  AUTHENTICATION = 'auth_error',
  VALIDATION = 'validation_error',
  AI_SERVICE = 'ai_service_error',
  DATABASE = 'database_error',
  RATE_LIMIT = 'rate_limit_error',
  NETWORK = 'network_error',
  INTERNAL = 'internal_error'
}

interface APIError {
  type: ErrorType
  message: string
  details?: any
  code: string
  timestamp: Date
  requestId: string
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    code: string
    details?: any
  }
  requestId: string
  timestamp: string
}
```

### Error Handling Implementation
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: categorizeError(error),
      message: getErrorMessage(error),
      code: getErrorCode(error),
      details: isDevelopment ? error.stack : undefined
    },
    requestId: req.id,
    timestamp: new Date().toISOString()
  }
  
  // Log error
  logger.error('API Error', errorResponse)
  
  // Send response
  res.status(getHttpStatus(error)).json(errorResponse)
})
```

## Security Considerations

### API Security
1. **Authentication**
   - JWT with refresh tokens
   - Token blacklisting
   - Multi-factor authentication option

2. **Rate Limiting**
   ```typescript
   const rateLimits = {
     auth: '5 requests per minute',
     analysis: '10 requests per minute',
     questions: '30 requests per minute',
     export: '2 requests per hour'
   }
   ```

3. **Input Validation**
   ```typescript
   const answerValidation = {
     maxLength: 5000,
     minLength: 10,
     allowedCharacters: /^[a-zA-Z0-9\s\.,!?-]+$/,
     profanityFilter: true
   }
   ```

4. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement CORS policies
   - Regular security audits

### Privacy Compliance
- GDPR compliance for EU users
- Data retention policies
- User data export functionality
- Right to deletion implementation

## Performance Requirements

### Response Time Targets
- Authentication: < 200ms
- Question retrieval: < 300ms
- Answer analysis: < 5 seconds
- Analytics queries: < 1 second
- Export generation: < 30 seconds

### Scalability Planning
- Database connection pooling
- Redis for session storage
- CDN for static assets
- Auto-scaling server instances
- Queue system for AI processing

### Monitoring & Logging
```typescript
interface APIMetrics {
  responseTime: number
  errorRate: number
  throughput: number
  aiServiceLatency: number
  databaseLatency: number
}

interface LogStructure {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  service: string
  operation: string
  userId?: string
  sessionId?: string
  duration: number
  metadata: any
}
```

## Database Schema

### PostgreSQL Tables
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(20) DEFAULT 'user',
  preferences JSONB,
  subscription JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Sessions table
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  custom_category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  total_score INTEGER,
  duration INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  type VARCHAR(30) NOT NULL,
  question TEXT NOT NULL,
  tags TEXT[],
  expected_keywords TEXT[],
  sample_answer TEXT,
  evaluation_criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  average_score DECIMAL(5,2)
);

-- Analysis results table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  user_answer TEXT NOT NULL,
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  strengths TEXT[],
  improvements TEXT[],
  detailed_feedback JSONB,
  ai_analysis JSONB,
  ideal_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Structure
```typescript
// Session data (TTL: 2 hours)
session:{sessionId} = {
  userId: string,
  currentQuestion: Question,
  answers: Answer[],
  startTime: timestamp,
  lastActivity: timestamp
}

// Rate limiting (TTL: varies)
rate_limit:{userId}:{endpoint} = {
  count: number,
  resetTime: timestamp
}

// Cache frequently accessed data (TTL: 1 hour)
questions:{category}:{difficulty} = Question[]
user_stats:{userId} = UserAnalytics
```

## Deployment Architecture

### Infrastructure Requirements
- **API Server**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis cluster
- **Queue**: Redis Queue or AWS SQS
- **AI Service**: OpenAI API integration
- **File Storage**: AWS S3 for exports
- **CDN**: CloudFlare for static assets

### Environment Configuration
```yaml
# Production
DATABASE_URL: postgresql://...
REDIS_URL: redis://...
OPENAI_API_KEY: sk-...
JWT_SECRET: ...
CORS_ORIGINS: https://interview-practice.com
LOG_LEVEL: info

# Staging
DATABASE_URL: postgresql://staging...
REDIS_URL: redis://staging...
OPENAI_API_KEY: sk-staging...
JWT_SECRET: staging-secret
CORS_ORIGINS: https://staging.interview-practice.com
LOG_LEVEL: debug
```