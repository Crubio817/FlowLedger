# FlowLedger UI Roadmap v2.3
## Building on Completed v2.2 Backend Integration

> **Status**: Ready for implementation - All v2.2 backend APIs and types integrated ✅  
> **Focus**: UI layer development for Spotlight, Memory, and Enhanced Workstream features

## 🎯 Priority UI Components

### Phase 1: Core User Experience (Weeks 1-2)

| Component | Status | Priority | Description |
|-----------|--------|----------|-------------|
| ✅ EnhancedTodayPanel | **Implemented** | P0 | Priority tier filtering, ICP badges, promotion alerts |
| ✅ SpotlightScoreCard | **Implemented** | P0 | Score breakdown with explainable AI |
| ✅ MemoryCard | **Implemented** | P0 | Context cards with atom timeline |
| 🔄 CandidateDetail | **Enhanced** | P1 | Ready for spotlight + memory integration |

### Phase 2: Power User Features (Weeks 3-4)

| Component | Status | Priority | Description |
|-----------|--------|----------|-------------|
| 🆕 SpotlightBuilder | **Planned** | P1 | Drag-drop rule builder for spotlights |
| 🆕 IdentityResolver | **Planned** | P1 | Conflict resolution interface |
| 🆕 EngagementTimeline | **Planned** | P2 | Pursuit milestone visualization |
| 🆕 WorkloadDashboard | **Planned** | P2 | Capacity analytics and insights |

### Phase 3: Administrative & Analytics (Weeks 5-6)

| Component | Status | Priority | Description |
|-----------|--------|----------|-------------|
| 🆕 ConfigurationManager | **New** | P2 | Dynamic rule management |
| 🆕 MemoryAtomEditor | **New** | P3 | Manual context editing/redaction |
| 🆕 PriorityCalibrator | **New** | P3 | Scoring adjustment interface |

---

## 🧱 Detailed Component Specifications

### 1. 🌟 SpotlightScoreCard Component

**Purpose**: Display explainable AI scoring for candidates/signals with actionable breakdowns

**API Integration**:
```typescript
// Hook into existing API
const spotlightData = await getSpotlightScores('candidate', candidateId, spotlightId);
```

**UI Layout**:
```
┌─────────────────────────────────────┐
│ 🎯 Match Score: 87%                 │
│ ⭐ Priority Tier: HIGH              │
├─────────────────────────────────────┤
│ Score Breakdown:                    │
│ ✅ +15  Industry Alignment          │
│ ✅ +12  Budget Match               │
│ ✅ +8   Urgency Score              │
│ ⚠️  +2   Geographic Fit            │
│ ❌ -10  Team Size Mismatch         │
├─────────────────────────────────────┤
│ [Rescore] [View Full Analysis]      │
└─────────────────────────────────────┘
```

**File Location**: `src/components/SpotlightScoreCard.tsx`

**Integration Points**:
- Embed in `CandidateDetail.tsx` (right sidebar)
- Add to `TodayPanel.tsx` (hover cards)
- Include in `PursuitDetail.tsx`

---

### 2. 🧠 MemoryCard Component

**Purpose**: Display contextual memory atoms with timeline and key insights

**API Integration**:
```typescript
// Hook with ETag caching
const memoryCard = await getMemoryCard('candidate', candidateId, etag);
```

**UI Layout**:
```
┌─────────────────────────────────────┐
│ 🧠 Context Memory                   │
│ Last updated: 2 hours ago           │
├─────────────────────────────────────┤
│ 🔴 Key Risks:                       │
│ • Budget concerns mentioned 3x      │
│ • Competitor evaluation in progress │
│                                     │
│ 💡 Preferences:                     │
│ • Prefers quarterly billing         │
│ • Remote-first implementation       │
│                                     │
│ 📝 Recent Notes:                    │
│ • "Decision by end of Q3" - Sarah   │
│ • Technical demo requested          │
├─────────────────────────────────────┤
│ [View Timeline] [Add Context]       │
└─────────────────────────────────────┘
```

**Variants**:
- `MemoryCard` - Full context panel
- `MemoryCardCompact` - Inline summary
- `MemoryCardDrawer` - Slide-out detailed view

**File Location**: `src/components/MemoryCard.tsx`

---

### 3. ✨ SpotlightBuilder Component

**Purpose**: Visual rule builder for creating and editing spotlight profiles

**API Integration**:
```typescript
// Configuration management
const config = await getConfiguration('spotlight', 'default_rules');
await updateConfiguration({
  config_type: 'spotlight',
  config_key: 'custom_spotlight_1',
  config_value: spotlightRules
});
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🌟 Spotlight Builder: "High-Value Enterprise"              │
├─────────────────────────────────────────────────────────────┤
│ Drag & Drop Rules Builder:                                  │
│                                                             │
│ 📊 Scoring Rules:                    🎯 Target Profile:    │
│ ┌─ Industry Match ──────┐           ┌─ Preview ───────┐    │
│ │ Weight: 25%           │           │ Score: 85%      │    │
│ │ Required: Technology  │           │ Tier: HIGH      │    │
│ └───────────────────────┘           │ ICP: Band A     │    │
│                                     └─────────────────┘    │
│ ┌─ Budget Range ────────┐                                  │
│ │ Weight: 30%           │           📋 Active Rules:      │
│ │ Min: $50k             │           • Industry: Tech      │
│ └───────────────────────┘           • Budget: >$50k       │
│                                     • Urgency: >7/10      │
│ [+ Add Rule] [Test Profile]         • Team: 10-500        │
├─────────────────────────────────────────────────────────────┤
│ [Save] [Cancel] [Preview on Sample Data]                   │
└─────────────────────────────────────────────────────────────┘
```

**File Location**: `src/pages/admin/SpotlightBuilder.tsx`
**Route**: `/admin/spotlights/:id?`

---

### 4. 🔄 Enhanced TodayPanel

**Purpose**: Upgrade existing TodayPanel with v2.2 priority features

**API Integration**: Already available via updated `getTodayPanel()`

**New Features**:
- Priority tier filtering tabs
- ICP band indicators
- Memory context hints
- Spotlight promotion nudges

**UI Enhancement**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Today's Priorities                    🔍 [Filter ▼]     │
├─────────────────────────────────────────────────────────────┤
│ [🔴 Critical 3] [🟡 High 7] [🔵 Medium 12] [⚪ Low 8]      │
├─────────────────────────────────────────────────────────────┤
│ 🎯 Ready to Promote (2):                                   │
│ ┌─ Acme Corp Expansion ────────────── ICP: A ──── 🧠───┐   │
│ │ Score: 89% • Value: $125k • Due: Today              │   │
│ │ 💡 "Budget approved" - Recent memory                  │   │
│ └─────────────────────────────────── [Promote] ─────┘   │
│                                                             │
│ 🚨 Overdue & Critical (1):                                 │
│ ┌─ TechStart Integration ─────────── ICP: B ──── ⚠️ ───┐   │
│ │ Score: 76% • Value: $80k • Overdue: 3 days          │   │
│ └─────────────────────────────────── [Review] ──────┘   │
└─────────────────────────────────────────────────────────────┘
```

**File Location**: Update existing `src/components/TodayPanel.tsx`

---

### 5. 🔍 IdentityResolver Component

**Purpose**: Handle contact/client identity conflicts with resolution workflows

**API Integration**:
```typescript
const conflicts = await getIdentityConflicts('pending');
await resolveIdentityConflict(conflictId, resolution);
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Identity Conflicts (3 pending)                          │
├─────────────────────────────────────────────────────────────┤
│ ⚠️  Contact Match Conflict:                                │
│                                                             │
│ Signal: john.doe@acme.com          Existing: j.doe@acme.com │
│ ┌─ New Contact ────────┐          ┌─ Existing Contact ───┐  │
│ │ John Doe             │    VS    │ J. Doe              │  │
│ │ VP Engineering       │          │ VP Engineering      │  │
│ │ Acme Corp           │          │ Acme Corporation    │  │
│ │ Confidence: 85%      │          │ Last seen: 2 weeks  │  │
│ └──────────────────────┘          └─────────────────────┘  │
│                                                             │
│ Resolution Options:                                         │
│ ○ Merge into existing (recommended)                         │
│ ○ Keep as separate contacts                                 │
│ ○ Manual review required                                    │
│                                                             │
│ [Resolve] [Flag for Review] [Ignore]                       │
└─────────────────────────────────────────────────────────────┘
```

**File Location**: `src/components/IdentityResolver.tsx`
**Page**: `src/pages/admin/IdentityManagement.tsx`

---

### 6. 📈 EngagementTimeline Component

**Purpose**: Visual timeline for pursuit progression with memory integration

**API Integration**:
```typescript
const pursuit = await getPursuit(pursuitId);
const events = await getWorkEvents(pursuitId);
const memory = await getMemoryCard('pursuit', pursuitId);
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📈 Engagement Timeline: Acme Corp Expansion                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🟢──●──────●──────●──────○────────○ [Today]                │
│    │      │      │      │        │                         │
│   Qual   Pink   Red  Submit   Signed                       │
│                                                             │
│ ● Sep 1: Promoted to Pink Stage                            │
│   🧠 "Budget confirmed at $125k" - Sarah                   │
│   📋 Checklist: 8/10 complete                              │
│                                                             │
│ ● Sep 5: Advanced to Red Stage                             │
│   🧠 "Legal review in progress" - Mike                     │
│   📄 Proposal v2.1 sent                                    │
│                                                             │
│ ○ Sep 15: Submit Stage (Projected)                         │
│   ⏰ SLA: 2 days remaining                                  │
│   🚨 Blocker: Legal approval pending                       │
│                                                             │
│ [Add Milestone] [View Full History]                        │
└─────────────────────────────────────────────────────────────┘
```

**File Location**: `src/components/EngagementTimeline.tsx`

---

## 🔄 Behavioral Patterns & Smart Features

### Memory-Aware Routing
```typescript
// Component enhancement pattern
const { data: memoryCard } = useQuery({
  queryKey: ['memory', entityType, entityId],
  queryFn: () => getMemoryCard(entityType, entityId, etag),
  staleTime: 30000, // 30 second cache
});

// Show memory indicator badge
{memoryCard?.atoms?.length > 0 && (
  <Badge variant="memory" className="ml-2">
    🧠 {memoryCard.atoms.length}
  </Badge>
)}
```

### Spotlight Promotion Nudges
```typescript
// Auto-promotion detection
const shouldPromote = candidate.spotlight_scores?.overall_score >= 0.8 
  && candidate.icp_band === 'A';

{shouldPromote && (
  <Alert className="border-green-200 bg-green-50">
    <Star className="h-4 w-4" />
    <AlertTitle>Ready to Promote</AlertTitle>
    <AlertDescription>
      High ICP match score ({candidate.spotlight_scores.overall_score}%). 
      Consider promoting to pursuit.
    </AlertDescription>
    <Button size="sm" className="mt-2">Promote Now</Button>
  </Alert>
)}
```

### Quality Gate UI Enforcement
```typescript
// Stage transition validation
const handleStageChange = async (newStage: string) => {
  try {
    const result = await changePursuitStage(pursuitId, newStage);
    if (result.quality_gates_passed?.failed_checks?.length > 0) {
      setGateErrors(result.quality_gates_passed.failed_checks);
      setShowGateDialog(true);
      return;
    }
    // Success path
  } catch (error) {
    toast.error('Stage transition failed');
  }
};
```

### Auto-Prioritization in Lists
```typescript
// Automatic sorting by priority score
const sortedItems = useMemo(() => {
  return items.sort((a, b) => {
    // Primary: priority tier (critical > high > medium > low)
    const tierOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const tierDiff = tierOrder[b.priority_tier] - tierOrder[a.priority_tier];
    if (tierDiff !== 0) return tierDiff;
    
    // Secondary: priority score
    return (b.priority_score || 0) - (a.priority_score || 0);
  });
}, [items]);
```

---

## 🛠 Implementation Strategy

### Week 1-2: Foundation
1. **SpotlightScoreCard** - Core scoring display
2. **MemoryCard** - Context visualization  
3. **Enhanced TodayPanel** - Priority filtering

### Week 3-4: Power Features
1. **SpotlightBuilder** - Admin rule builder
2. **IdentityResolver** - Conflict resolution
3. **EngagementTimeline** - Pursuit visualization

### Week 5-6: Polish & Analytics
1. **ConfigurationManager** - Rule management
2. **WorkloadDashboard** - Analytics views
3. **Performance optimizations** - Caching & loading

### Technical Considerations

**State Management**:
- Use React Query for server state with stale-while-revalidate
- Zustand for UI state (filters, selections, modal states)
- Context for memory card caching with ETag optimization

**Component Library Alignment**:
- Radix UI for accessible primitives
- Tailwind for styling consistency
- Lucide icons for visual hierarchy
- Framer Motion for smooth animations

**Performance Optimizations**:
- Virtualization for large lists (TodayPanel, timeline)
- Memory card ETag caching to prevent redundant requests
- Code splitting for admin components
- Preload spotlight scores on hover

---

## 📋 Ready for Implementation

The backend v2.2 integration is complete with all necessary APIs and types. **Phase 1 components are now implemented** with enhanced v2.2 capabilities.

### ✅ **COMPLETED - Phase 1**
1. **SpotlightScoreCard** - Full scoring display with explainable AI breakdown
2. **MemoryCard** - Context visualization with atom timeline and manual editing
3. **EnhancedTodayPanel** - Priority filtering, promotion alerts, and intelligent sorting

### 🎯 **NEXT STEPS - Phase 2**
1. 🌟 **SpotlightBuilder** - Admin interface for creating scoring rules
2. 🔍 **IdentityResolver** - Conflict resolution workflow UI
3. 📈 **EngagementTimeline** - Pursuit progression visualization

### 📁 **Implementation Files Created**
- `src/components/SpotlightScoreCard.tsx` - Explainable AI scoring interface
- `src/components/MemoryCard.tsx` - Memory atom management with variants
- `src/components/EnhancedTodayPanel.tsx` - Priority-driven dashboard

**Success Metrics**:
- ✅ Faster candidate qualification through spotlight insights
- ✅ Improved context retention via memory integration  
- ✅ Higher conversion rates through priority-driven workflows
- ✅ Reduced manual work via intelligent automation

**Technical Implementation**:
- Uses React Query for optimized data fetching with stale-while-revalidate
- Implements proper TypeScript types aligned with v2.2 backend
- Follows established design patterns with Tailwind CSS and Radix UI
- Includes loading states, error handling, and responsive design
