# Memory Module

The Memory Module is a foundational component of FlowLedger that provides institutional knowledge capture and retrieval across all entities.

## 🎯 **Core Philosophy**

The Memory Module is designed as a **standalone, reusable foundation** that other modules integrate with, rather than being built into each individual module. This follows clean architecture principles and makes memory functionality available system-wide.

## 🏗️ **Architecture**

```
src/modules/memory/
├── components/
│   ├── MemoryCard.tsx           # Main memory display component
│   ├── MemoryAtom.tsx           # Individual memory item (future)
│   ├── MemoryTimeline.tsx       # Timeline view (future)
│   └── MemorySearch.tsx         # Search interface (future)
├── hooks/
│   └── useMemory.ts             # React Query hooks
├── services/
│   ├── memory.api.ts            # API client
│   └── memory.types.ts          # TypeScript types
└── index.ts                     # Public API exports
```

## 🚀 **Quick Integration**

Any FlowLedger module can integrate memory functionality in just a few lines:

```tsx
import { MemoryCard } from '../memory/index.ts';

const YourComponent = ({ entityId }) => (
  <div className="layout">
    <main>Your main content</main>
    <aside>
      <MemoryCard 
        entityType="your_entity_type"
        entityId={entityId}
      />
    </aside>
  </div>
);
```

## 📋 **Memory Atom Types**

- **Decision** (🎯): Important business decisions
- **Risk** (⚠️): Identified risks and mitigation strategies  
- **Preference** (❤️): Client preferences and requirements
- **Status** (📊): Status changes and updates
- **Note** (📝): General notes and observations
- **Milestone** (🏁): Key milestones and achievements

## 🎨 **Component Variants**

### **MemoryCard**
```tsx
<MemoryCard 
  entityType="candidate"
  entityId={123}
  compact={false}           // Compact or full view
  expandable={true}         // Can be collapsed/expanded
  showTimeline={false}      // Show chronological timeline
  maxAtoms={10}            // Max atoms to show initially
  onAddNote={handleNote}   // Custom note handler
/>
```

## 🔗 **API Integration**

The memory module follows FlowLedger's existing patterns:

- **Error Handling**: Uses `withErrors()` wrapper with toast notifications
- **HTTP Client**: Leverages existing `http` client with retry logic
- **React Query**: Standard caching and synchronization patterns
- **TypeScript**: Full type safety with generated types

## 📦 **Exported API**

```tsx
// Components
import { MemoryCard } from '../memory/index.ts';

// Hooks
import { 
  useMemoryCard,
  useMemoryCapture,
  useMemorySearch 
} from '../memory/index.ts';

// Types
import { 
  MemoryAtom,
  MemoryCardType,
  CreateMemoryAtom 
} from '../memory/index.ts';

// Utilities
import { 
  createMemoryTrigger,
  memoryEntityHelper 
} from '../memory/index.ts';
```

## 🔧 **Backend Requirements**

The memory module expects these API endpoints:

```
GET    /memory/card?entity_type=candidate&entity_id=123
GET    /memory/atoms?entity_type=candidate&entity_id=123
POST   /memory/atoms
PUT    /memory/atoms/{id}
DELETE /memory/atoms/{id}
GET    /memory/search?q=query
GET    /memory/timeline?entity_type=candidate&entity_id=123
POST   /memory/atoms/{id}/redact
```

## 🎯 **Integration Examples**

### **Sidebar Integration** (Candidates, Clients)
```tsx
<div className="detail-layout">
  <main className="main-content">
    {/* Existing content */}
  </main>
  <aside className="sidebar w-80">
    <MemoryCard entityType="candidate" entityId={candidateId} />
  </aside>
</div>
```

### **Tab Integration** (Engagements)
```tsx
<TabContainer>
  <TabList>
    <Tab>Overview</Tab>
    <Tab>Features</Tab>
    <Tab>Memory</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
      <MemoryCard 
        entityType="engagement" 
        entityId={engagementId}
        showTimeline={true}
      />
    </TabPanel>
  </TabPanels>
</TabContainer>
```

### **Inline Integration** (Communications)
```tsx
<div className="comm-thread">
  <div className="messages">
    {/* Messages */}
  </div>
  <div className="context-panel">
    <MemoryCard 
      entityType="comms_thread" 
      entityId={threadId}
      compact={true}
    />
  </div>
</div>
```

## 🔄 **Memory Capture Patterns**

### **Manual Capture**
```tsx
const { captureMemory } = useMemoryCapture();

const handleAddNote = () => {
  captureMemory(
    'candidate',     // entity type
    candidateId,     // entity ID
    noteContent,     // content
    'note',          // atom type
    ['urgent']       // tags
  );
};
```

### **Automatic Capture** (Future)
```tsx
// Trigger memory capture on entity state changes
useEffect(() => {
  if (candidate.status !== previousStatus) {
    captureMemory(
      'candidate',
      candidateId,
      `Status changed from ${previousStatus} to ${candidate.status}`,
      'status'
    );
  }
}, [candidate.status]);
```

## 📈 **Development Phases**

### **Phase 1: Foundation** ✅
- [x] Core memory types and API
- [x] Basic MemoryCard component
- [x] React Query hooks
- [x] Integration example

### **Phase 2: Entity Integration** (Next)
- [ ] Candidates module integration
- [ ] Engagements module integration  
- [ ] Communications module integration
- [ ] Clients module integration

### **Phase 3: Advanced Features** (Future)
- [ ] MemoryTimeline component
- [ ] MemorySearch component
- [ ] Bulk operations
- [ ] AI-powered insights

### **Phase 4: Polish** (Future)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Advanced UX features
- [ ] Comprehensive testing

## 🎨 **Design System Integration**

The Memory Module follows FlowLedger's design system:

- **Glass morphism**: `bg-zinc-900/50 border border-zinc-800`
- **Color palette**: Purple accents for memory (`text-purple-400`)
- **Typography**: Consistent with existing components
- **Icons**: Lucide icons matching the existing icon set
- **Animations**: Subtle hover effects and transitions

## 🧪 **Testing Strategy**

```tsx
// Component testing
import { render, screen } from '@testing-library/react';
import { MemoryCard } from '../memory/index.ts';

test('renders memory card with atoms', () => {
  render(
    <MemoryCard entityType="candidate" entityId={123} />
  );
  expect(screen.getByText('Institutional Memory')).toBeInTheDocument();
});
```

## 📚 **Usage Guidelines**

### **Do's**
- ✅ Use MemoryCard for entity detail views
- ✅ Capture meaningful business context
- ✅ Follow the atom type conventions
- ✅ Provide relevant tags

### **Don'ts**
- ❌ Don't capture sensitive information without redaction
- ❌ Don't duplicate information available elsewhere
- ❌ Don't use memory for temporary UI state
- ❌ Don't ignore the loading and error states

---

The Memory Module provides a solid foundation for institutional knowledge capture across FlowLedger, designed to integrate seamlessly with existing architecture while providing powerful memory capabilities.
