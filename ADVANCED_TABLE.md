# Advanced Table Component

A next-level data table component built for FlowLedger with modern animations, filtering, and interactive features.

## ✨ Features

### Core Functionality
- **Smart Sorting**: Click any column header to sort ascending/descending
- **Advanced Filtering**: Multi-column filters with text search, dropdowns, and range inputs
- **Column Visibility**: Toggle columns on/off with dropdown menu
- **Pagination**: Smooth pagination with page numbers
- **Row Selection**: Select individual rows or all with checkboxes
- **Expandable Rows**: Click any row to reveal detailed information

### Visual Design
- **FlowLedger Integration**: Uses your exact color scheme (#4997D0 accent)
- **Smooth Animations**: Staggered row animations, hover effects, and transitions
- **Responsive Layout**: Works on all screen sizes
- **Glass Morphism**: Backdrop blur effects and modern card styling
- **Status Indicators**: Color-coded status badges and performance bars

### Interactive Elements
- **Email Copy**: Click to copy email addresses to clipboard
- **Live Search**: Real-time filtering as you type
- **Hover Effects**: Subtle glow and highlight effects
- **Loading States**: Smooth transitions between data states
- **Action Buttons**: View, Edit, Delete actions per row

### Data Features
- **Real-time Stats**: Dynamic calculation of averages and totals
- **Performance Metrics**: Visual progress bars for performance scores
- **Trend Indicators**: Up/down arrows for change metrics
- **Rating Display**: Star ratings with numeric values
- **Revenue Formatting**: Proper currency formatting with deal counts

## 🚀 Usage

### Basic Implementation
```tsx
import AdvancedTable from '../components/AdvancedTable';

function MyPage() {
  return <AdvancedTable />;
}
```

### Navigation
Access the table demo at: **http://localhost:5173/table-demo**

Or use the sidebar navigation → "Table Demo"

## 🎨 Design Integration

### Color Scheme
- **Primary Accent**: #4997D0 (Your FlowLedger blue)
- **Background**: #101010 (Matches your app background)
- **Grid Pattern**: Uses your existing 20px grid
- **Animations**: Respects your app's transition timing

### Typography
- **Headers**: Gradient text effects with your accent color
- **Body Text**: Consistent with your app's text hierarchy
- **Icons**: Lucide React icons (same as your sidebar)

## 🔧 Customization

### Adding New Columns
Update the `TeamMember` interface and add to `columnVisibility`:

```tsx
interface TeamMember {
  // existing fields...
  newField: string;
}

const [columnVisibility, setColumnVisibility] = useState({
  // existing columns...
  newField: true
});
```

### Changing Data Source
Replace the `initialData` array with your API data:

```tsx
const [data, setData] = useState<TeamMember[]>([]);

useEffect(() => {
  fetchTeamData().then(setData);
}, []);
```

### Styling Modifications
- **Colors**: Update the `#4997D0` values throughout the component
- **Animations**: Modify the CSS keyframes at the bottom
- **Layout**: Adjust the grid classes and spacing

## 📊 Data Structure

Each team member object should have:

```tsx
{
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  revenue: number;
  change: number; // percentage change
  joinDate: string; // ISO date string
  performance: number; // 0-100 percentage
  deals: number;
  satisfaction: number; // 0-5 rating
  location: string;
  phone: string;
  lastActive: string;
  projects: number;
  department: string;
}
```

## 🎭 Animation Details

### Row Entrance
- Staggered fade-in with 100ms delays
- Smooth slide-up from 20px below
- 600ms duration with ease-out timing

### Hover Effects
- Gradient background on row hover
- Glow effects on action buttons
- Color transitions on text elements

### Interactive Feedback
- Pulse animations on status indicators
- Scale transforms on button hover
- Smooth color transitions throughout

## 🔍 Performance Features

### Optimizations
- **Memoized Data Processing**: useMemo for filtered/sorted data
- **Efficient Re-renders**: Proper state management
- **Lazy Loading Ready**: Pagination structure supports virtual scrolling

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators

## 🎯 Perfect For

- **Team Management**: Employee/member dashboards
- **Client Lists**: Customer relationship management
- **Project Tracking**: Task and project management
- **Analytics Dashboards**: Performance and metrics displays
- **Admin Panels**: Any data-heavy administrative interface

## 🚀 Try It Now

1. Navigate to `/table-demo` in your FlowLedger app
2. Explore all the interactive features:
   - Sort by clicking column headers
   - Filter using the input fields
   - Select rows with checkboxes
   - Click rows to expand details
   - Copy emails by clicking the copy icon
   - Toggle column visibility
   - Navigate through pages

The table is fully integrated with your app's design system and ready for production use!
