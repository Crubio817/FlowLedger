# Workstream Module v2.1

A comprehensive, multi-tenant workstream management system for FlowLedger that enables a seamless flow from Signal → Candidate → Pursuit → Engagement. Built with enterprise reliability, featuring event-driven processing, state machines, SLA monitoring, and AI integration.

## 🚀 Features

### Core Workstream Flow
- **Signals**: Capture and analyze incoming lead signals from multiple sources
- **Candidates**: Qualify and nurture potential opportunities with confidence scoring
- **Pursuits**: Manage active deals through Pink/Red stage gates with checklist validation
- **Proposals**: Version-controlled proposal management with send tracking

### Advanced Capabilities
- **Multi-Tenant Architecture**: Complete org_id isolation for enterprise security
- **Event-Driven Processing**: Asynchronous outbox pattern for reliable side effects
- **State Machines**: Hard-enforced transitions with business rule validation
- **SLA Monitoring**: Automated breach detection with amber/red alerting
- **Checklist Gating**: Required validations for Pink/Red stage progression
- **AI Integration**: MCP-powered enrichment, analysis, and proposal drafting
- **Today Panel**: Unified operational dashboard with priority management
- **Kanban Boards**: Visual pipeline management with drag-and-drop
- **Audit Trail**: Immutable event logging with comprehensive payload storage

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with zinc dark theme
- **UI Components**: Radix UI primitives + custom components
- **State Management**: React hooks + local state
- **API Client**: Custom HTTP client with retry logic
- **Routing**: React Router v6 with lazy loading

### Database Schema (SQL Server)
```sql
-- Core entities with multi-tenancy
CREATE TABLE signal (
  signal_id int IDENTITY PRIMARY KEY,
  org_id int NOT NULL,
  snippet nvarchar(500) NOT NULL,
  source_type varchar(20) NOT NULL, -- email, phone, web, referral, linkedin, other
  urgency_score int NOT NULL CHECK (urgency_score BETWEEN 1 AND 100),
  cluster_id varchar(50),
  cluster_count int,
  owner_user_id int,
  status varchar(20) NOT NULL DEFAULT 'new', -- new, triaged, candidate_created, ignored
  metadata_json nvarchar(max),
  has_candidate bit DEFAULT 0,
  created_utc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_utc datetime2
);

CREATE TABLE candidate (
  candidate_id int IDENTITY PRIMARY KEY,
  org_id int NOT NULL,
  signal_id int REFERENCES signal(signal_id),
  title nvarchar(200) NOT NULL,
  client_id int,
  contact_name nvarchar(100),
  contact_email nvarchar(100),
  value_band varchar(20) NOT NULL CHECK (value_band IN ('small', 'medium', 'large', 'enterprise')),
  confidence int NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  status varchar(20) NOT NULL DEFAULT 'new', -- new, triaged, nurture, on_hold, promoted, archived
  owner_user_id int,
  last_touch_at datetime2,
  promoted_at datetime2,
  notes nvarchar(max),
  sla_badge varchar(10), -- green, amber, red
  created_utc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_utc datetime2
);

CREATE TABLE pursuit (
  pursuit_id int IDENTITY PRIMARY KEY,
  org_id int NOT NULL,
  candidate_id int NOT NULL REFERENCES candidate(candidate_id),
  title nvarchar(200) NOT NULL,
  client_id int,
  stage varchar(20) NOT NULL DEFAULT 'qual', -- qual, pink, red, submit, won, lost
  due_date datetime2,
  owner_user_id int,
  forecast_value_usd int,
  probability int NOT NULL DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  description nvarchar(max),
  checklist_required bit DEFAULT 0,
  checklist_complete bit DEFAULT 0,
  submitted_at datetime2,
  decision_at datetime2,
  sla_badge varchar(10), -- green, amber, red
  created_utc datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_utc datetime2
);
```

### Key Constraints & Indexes
```sql
-- Idempotency constraints
CREATE UNIQUE INDEX UX_pursuit_once_per_candidate ON pursuit (candidate_id) WHERE stage != 'lost';
CREATE UNIQUE INDEX UX_proposal_version_once ON proposal (pursuit_id, version);

-- Performance indexes
CREATE INDEX IX_candidate_board ON candidate (org_id, status, owner_user_id) INCLUDE (title, value_band, confidence);
CREATE INDEX IX_pursuit_board ON pursuit (org_id, stage, owner_user_id) INCLUDE (title, forecast_value_usd, due_date);
CREATE INDEX IX_event_unprocessed ON work_event (org_id, processed_at) WHERE processed_at IS NULL;
```

## 📊 Views

### Operational Views
```sql
-- Today Panel: Unified urgent items
CREATE VIEW v_today_panel AS
SELECT 
  'signal' as item_type,
  signal_id as item_id,
  LEFT(snippet, 100) as label,
  status as state,
  owner_user_id,
  created_utc as last_touch_at,
  DATEADD(hour, 24, created_utc) as due_date,
  urgency_score,
  org_id
FROM signal WHERE status IN ('new', 'triaged')
UNION ALL
-- ... candidates and pursuits
```

### Analytics Views
```sql
-- Funnel Metrics
CREATE VIEW v_workstream_funnel AS
SELECT 
  org_id,
  COUNT(CASE WHEN item_type = 'signal' THEN 1 END) as signals,
  COUNT(CASE WHEN item_type = 'candidate' THEN 1 END) as candidates,
  COUNT(CASE WHEN item_type = 'pursuit' THEN 1 END) as pursuits,
  COUNT(CASE WHEN item_type = 'pursuit' AND stage = 'won' THEN 1 END) as won
FROM v_workstream_items
GROUP BY org_id;
```

## 🔗 API Endpoints

### Authentication
All endpoints require JWT authentication with org_id extraction:
```typescript
// Middleware extracts org_id from JWT token
const orgId = extractOrgIdFromToken(req.headers.authorization);
```

### Core Endpoints

#### Signals
```http
GET    /api/workstream/signals?clustered=true&source=email&urgency_min=60
POST   /api/workstream/signals
POST   /api/workstream/signals/{id}/create-candidate
POST   /api/workstream/signals/{id}/ignore
```

#### Candidates  
```http
GET    /api/workstream/candidates?status=triaged&value_band=large&sla=red
POST   /api/workstream/candidates
PATCH  /api/workstream/candidates/{id}
POST   /api/workstream/candidates/{id}/promote
POST   /api/workstream/candidates/{id}/drip
```

#### Pursuits
```http
GET    /api/workstream/pursuits?stage=pink&due_before=2024-12-31
POST   /api/workstream/pursuits
PATCH  /api/workstream/pursuits/{id}
POST   /api/workstream/pursuits/{id}/stage
POST   /api/workstream/pursuits/{id}/submit
POST   /api/workstream/pursuits/{id}/won
POST   /api/workstream/pursuits/{id}/lost
```

#### Today Panel
```http
GET    /api/workstream/today
```

## 🎯 State Machines

### Candidate States
```typescript
const CANDIDATE_TRANSITIONS = {
  new: ['triaged'],
  triaged: ['nurture', 'on_hold', 'promoted', 'archived'],
  nurture: ['triaged', 'promoted', 'archived'],
  on_hold: ['triaged', 'archived'],
  promoted: [], // Terminal
  archived: [], // Terminal
};
```

### Pursuit Stages
```typescript
const PURSUIT_TRANSITIONS = {
  qual: ['pink', 'lost'],
  pink: ['red', 'lost'],
  red: ['submit', 'lost'],
  submit: ['won', 'lost'],
  won: [],   // Terminal
  lost: [],  // Terminal
};
```

## ⚡ Event-Driven Processing

### Outbox Pattern
```typescript
// work_event table for async processing
interface WorkEvent {
  event_id: number;
  org_id: number;
  entity_type: 'signal' | 'candidate' | 'pursuit' | 'proposal';
  entity_id: number;
  event_name: string; // e.g., 'candidate.promoted', 'pursuit.submit'
  payload_json: any;
  processed_at?: string;
  retry_count: number;
  next_retry_at?: string;
  error_message?: string;
}
```

### Event Handlers
- `candidate.promoted` → Create proposal v1
- `pursuit.submit` → Send notification email
- `pursuit.won` → Notify team + update forecasting
- `signal.created` → Trigger AI analysis (if configured)

## 📋 SLA Rules

### Default SLA Thresholds
```typescript
const SLA_RULES = {
  TRIAGE_SLA: 24,    // Signal → first touch (hours)
  PROPOSAL_SLA: 72,  // Promote → submit (hours)
  RESPONSE_SLA: 96,  // Submit → decision (hours)
};
```

### SLA Status Calculation
```typescript
function calculateSlaStatus(dueDate: string): 'green' | 'amber' | 'red' {
  const due = new Date(dueDate);
  const hoursUntilDue = (due.getTime() - Date.now()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 'red';    // Overdue
  if (hoursUntilDue < 6) return 'amber';  // Due soon
  return 'green';                         // On track
}
```

## 🤖 AI Integration (MCP)

### Available Tools
```typescript
// Signal enrichment
const enrichResult = await enrichSignal(signalId, 'fullenrich');

// Signal analysis  
const analysis = await analyzeSignal(signalId);

// Proposal drafting
const draft = await draftProposal(pursuitId, context);
```

### MCP Providers
- **FullEnrich**: Contact and company data enrichment
- **Clay**: Additional enrichment source
- **OpenAI**: Analysis and content generation

## 🎨 UI Components

### Design System
Following FlowLedger's established patterns:
- **Colors**: Zinc palette with cyan accents
- **Typography**: System fonts with clear hierarchy
- **Components**: Radix UI primitives + custom implementations
- **Layout**: Consistent spacing with backdrop blur effects

### Key Components
- `TodayPanel`: Unified dashboard with filtering
- `SignalsPage`: List view with clustering and enrichment
- `CandidatesPage`: Kanban + list views with drag-and-drop
- `PursuitsPage`: Stage-based kanban with action modals
- `DetailDrawer`: Shared component for entity details

### Responsive Design
- **Mobile**: Collapsible navigation with touch-friendly interactions
- **Tablet**: Optimized kanban columns and modal sizing
- **Desktop**: Full feature set with keyboard shortcuts

## 🔒 Security & Multi-Tenancy

### Row-Level Security
```sql
-- All queries must include org_id filter
WHERE org_id = @orgId
```

### Cross-Org Protection
```typescript
// Verify access before operations
const entity = await getEntity(id);
if (entity.org_id !== userOrgId) {
  throw new Error('Access denied');
}
```

### PII Handling
- Only metadata in work_event table
- Full content stored in dedicated systems
- GDPR-compliant data retention

## 📈 Performance

### Frontend Optimizations
- **Code Splitting**: Lazy-loaded route components
- **Virtualization**: Large lists with react-window
- **Memoization**: React.memo for expensive renders
- **Debouncing**: Search and filter inputs
- **Optimistic Updates**: Immediate UI feedback

### Backend Optimizations
- **Indexed Queries**: Board views optimized with covering indexes
- **Pagination**: Consistent limit/offset patterns
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections

### Performance Targets
- **Page Load**: <400ms initial render
- **Interactions**: <100ms response time
- **Kanban DnD**: 60fps smooth animations
- **Search**: <200ms result display

## 🧪 Testing Strategy

### Unit Tests
```typescript
// State machine transitions
describe('Candidate State Machine', () => {
  it('should allow new → triaged transition', () => {
    expect(canTransition('new', 'triaged')).toBe(true);
  });
});
```

### Integration Tests
```typescript
// API endpoint testing
describe('POST /api/workstream/candidates/{id}/promote', () => {
  it('should create pursuit when promoting candidate', async () => {
    const response = await request(app)
      .post('/api/workstream/candidates/1/promote')
      .send({ title: 'Test Pursuit' });
    expect(response.status).toBe(201);
  });
});
```

### Data Integrity
```sql
-- Validation queries
SELECT candidate_id, COUNT(*) 
FROM pursuit 
WHERE stage != 'lost'
GROUP BY candidate_id 
HAVING COUNT(*) > 1; -- Should return 0 rows
```

## 🚀 Deployment

### Environment Variables
```bash
# Database
DATABASE_URL=sqlserver://server:1433;database=flowledger
JWT_SECRET=your-secret-key

# MCP Integration
MCP_FULLENRICH_API_KEY=your-key
MCP_OPENAI_API_KEY=your-key

# Feature Flags
WORKSTREAM_AI_ENABLED=true
WORKSTREAM_SLA_MONITORING=true
```

### Production Checklist
- [ ] Database migrations applied
- [ ] Indexes created for performance
- [ ] SLA monitoring job scheduled
- [ ] Outbox worker deployed
- [ ] Error tracking configured
- [ ] Performance monitoring enabled

## 📚 Usage Examples

### Creating a Complete Flow
```typescript
// 1. Create signal
const signal = await createSignal({
  snippet: "Interested in process improvement consulting",
  source_type: "email",
  urgency_score: 75
});

// 2. Convert to candidate
const candidate = await createCandidateFromSignal(signal.signal_id, {
  title: "Process Improvement Opportunity",
  value_band: "medium",
  contact_name: "John Smith",
  contact_email: "john@company.com"
});

// 3. Promote to pursuit
const pursuit = await promoteCandidate(candidate.candidate_id, {
  title: "Process Improvement Engagement",
  forecast_value_usd: 150000,
  due_date: "2024-12-31T00:00:00Z"
});

// 4. Advance through stages
await changePursuitStage(pursuit.pursuit_id, 'pink');
await changePursuitStage(pursuit.pursuit_id, 'red');
await submitPursuit(pursuit.pursuit_id);
await markPursuitWon(pursuit.pursuit_id, 165000);
```

### Using the Today Panel
```typescript
// Get today's priorities
const items = await getTodayPanel();

// Filter by type and SLA
const urgentPursuits = items.filter(item => 
  item.item_type === 'pursuit' && 
  item.sla_badge === 'red'
);
```

## 🔧 Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run typecheck

# Generate API types
npm run gen:api
```

### Code Organization
```
src/
├── services/
│   ├── workstream.types.ts      # Type definitions
│   ├── workstream.api.ts        # API client
│   └── workstream.utils.ts      # Utility functions
├── components/
│   ├── TodayPanel.tsx           # Main dashboard
│   └── workstream/              # Workstream components
├── routes/
│   ├── workstream.tsx           # Route wrapper
│   ├── workstream-signals.tsx   # Signals page
│   ├── workstream-candidates.tsx # Candidates page
│   └── workstream-pursuits.tsx  # Pursuits page
└── hooks/
    └── useWorkstream.ts         # Custom hooks
```

## 📋 Roadmap

### Phase 1: Core Implementation ✅
- [x] Database schema and migrations
- [x] API endpoints with authentication
- [x] Frontend components and routing
- [x] State machine enforcement
- [x] Basic SLA monitoring

### Phase 2: Advanced Features 🚧
- [ ] Outbox worker implementation
- [ ] MCP AI integration
- [ ] Advanced analytics views
- [ ] Bulk operations
- [ ] Export functionality

### Phase 3: Enterprise Features 🔮
- [ ] Advanced workflow automation
- [ ] Custom field definitions
- [ ] Integration APIs
- [ ] Advanced reporting
- [ ] Mobile application

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use existing UI components when possible
3. Maintain consistent error handling
4. Add comprehensive tests for new features
5. Update documentation for API changes

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Address review feedback

---

## 📄 License

This module is part of the FlowLedger platform and follows the same licensing terms.

## 📞 Support

For questions or issues with the Workstream Module:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for efficient workstream management**
