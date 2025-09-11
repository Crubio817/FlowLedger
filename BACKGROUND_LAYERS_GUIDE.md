# Background Layers Guide

## Issue: Multiple Background Layers

FlowLedger pages can sometimes show "three backgrounds" visually stacked on top of each other, creating visual conflicts and an unclear design hierarchy.

## Root Cause

1. **App-level background** (`src/app.tsx`): `#101010` with 20px grid pattern
2. **Page-level backgrounds**: Individual pages adding `bg-zinc-950` or similar classes
3. **Header backgrounds**: Complex aurora/horizon effects from `TransparentAuroraHeader`

## Solution

### ✅ Do This
- Let pages inherit the app-level background (`#101010` with grid)
- Only add page backgrounds when necessary for specific design requirements
- Use transparent/semi-transparent containers (`bg-zinc-900/50`) for content sections

### ❌ Avoid This
- Adding `bg-zinc-950` or `bg-zinc-900` to page root elements
- Stacking multiple solid background layers
- Overriding the app's background without a specific reason

## Page Structure Pattern

```tsx
// ✅ Good - inherits app background
function MyPage() {
  return (
    <div className="min-h-screen text-white">
      <StandardHeader title="Page Title" />
      
      <div className="pb-6 space-y-6">
        {/* Semi-transparent content containers */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 rounded-lg p-6">
          Content here
        </div>
      </div>
    </div>
  );
}

// ❌ Bad - creates background conflicts  
function MyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* This creates a third background layer */}
    </div>
  );
}
```

## Fixed / Updated
- `TransparentAuroraHeader` - Simplified aurora effects to reduce layering
- `spotlight-demo` route fully removed (demo functionality now accessed via Spotlight components directly)

## App Background Details
- **Color**: `#101010` (very dark gray)
- **Pattern**: 20px grid with `rgba(255,255,255,0.012)` lines
- **Location**: `src/app.tsx` workspace div
