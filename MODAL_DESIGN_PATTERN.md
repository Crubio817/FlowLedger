# Modern Modal Design Pattern

This document outlines the design pattern used for modern modals in FlowLedger, exemplified by the CreateClientModalNew component.

## Design Principles

### Visual Hierarchy
- **Header with gradient background**: `bg-gradient-to-r from-zinc-900 to-zinc-950`
- **Progress indicators**: Subtle gradient bars to show completion status
- **Icon-based sections**: Each section has a distinctive icon for quick recognition
- **Card-based preview**: Right-side preview cards show real-time form state

### Color Scheme
- **Primary accent**: Cyan/blue gradients (`from-cyan-500 to-blue-500`)
- **Background layers**: Multiple zinc shades for depth
- **Status indicators**: Color-coded badges (cyan for active, purple for prospect)
- **Interactive states**: Hover effects with color transitions

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header (gradient background + progress indicator)        │
├─────────────────────────────────────────────────────────┤
│ Smart Extract Section (AI-powered URL extraction)       │
├─────────────────────────────────────────────────────────┤
│ Two-Column Layout:                                      │
│ ┌──────────────────────┬────────────────────────────────┤
│ │ Left: Form Fields    │ Right: Preview + Dynamic       │
│ │ - Company Info       │   Sections                     │
│ │ - Industry Selection │ - Company Preview Card         │
│ │ - Status Toggle      │ - Contacts (multiple)          │
│ │ - Task Pack          │ - Notes (multiple)             │
│ └──────────────────────┴ - Locations (multiple)         │
│                        └ - Pro Tips                     │
├─────────────────────────────────────────────────────────┤
│ Footer (actions with primary CTA)                      │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Header Section
```tsx
<div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
        <Building className="text-cyan-400" size={20} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Modal Title</h2>
        <p className="text-sm text-zinc-400 mt-0.5">Subtitle description</p>
      </div>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
      <X className="text-zinc-400 hover:text-white" size={20} />
    </button>
  </div>
  {/* Progress indicator */}
  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
    <div className="h-full w-1/3 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
  </div>
</div>
```

### 2. Smart Extract Section (AI-Powered Features)
```tsx
<div className="p-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-transparent">
  <div className="flex items-center gap-2 mb-3">
    <Zap className="text-amber-400" size={16} />
    <span className="text-sm font-medium text-zinc-300">Quick Setup</span>
    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">AI Powered</span>
  </div>
  {/* URL input with extract button */}
</div>
```

### 3. Form Styling
```tsx
// Standard input styling
<input
  className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-900 transition-all"
/>

// Toggle buttons (status selection)
<button
  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
    isActive 
      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
      : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
  }`}
>

// Textarea for notes
<textarea
  rows={3}
  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 text-sm resize-none"
/>

// Add item buttons
<button className="w-full px-4 py-2.5 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2">
  <Plus size={16} />
  Add a note
</button>
```

### 4. Dynamic Sections
```tsx
// Notes Section
<div>
  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
    <FileText size={16} />
    Notes
  </h3>
  {/* Dynamic note items with add/remove functionality */}
</div>

// Locations Section  
<div>
  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
    <MapPin size={16} />
    Locations
  </h3>
  {/* Address fields: street, city, state, postal code, country */}
</div>
```
```tsx
<div className="p-4 bg-gradient-to-b from-zinc-900/50 to-zinc-900/30 border border-zinc-800 rounded-xl">
  <div className="flex items-center gap-2 mb-3">
    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
      <Building size={16} className="text-cyan-400" />
    </div>
    <div>
      <h4 className="text-sm font-medium text-white">Preview Title</h4>
      <p className="text-xs text-zinc-500">Subtitle</p>
    </div>
  </div>
  {/* Preview content */}
</div>
```

### 5. Primary CTA Button
```tsx
<button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
  Create Client
  <ArrowRight size={16} />
</button>
```

## Interactive Features

### Loading States
- Spinner icons for async operations
- Disabled states with opacity reduction
- Loading text changes ("Extracting...", "Creating...")

### Success Feedback
- Toast notifications for actions
- Visual checkmarks for completed steps
- Color-coded status indicators

### Dynamic Content
- Real-time preview updates
- Conditional rendering based on form state
- Progressive disclosure of advanced options

## Accessibility Features

- Proper form labels and ARIA attributes
- Keyboard navigation support
- Focus management
- High contrast colors for readability

## Usage Guidelines

1. **Always include a header** with icon, title, and subtitle
2. **Use the AI-powered section** for complex data entry scenarios
3. **Implement real-time previews** when possible
4. **Provide clear visual feedback** for all user actions
5. **Use consistent spacing** and the established color palette
6. **Include helpful tips** in sidebar areas

## Files to Reference

- `/src/components/CreateClientModalNew.tsx` - Complete implementation with notes and locations
- `/src/ui/button.tsx` - Button component variations
- `/src/ui/input.tsx` - Input styling patterns

This pattern should be used for all future modal implementations to maintain design consistency across the application.
