import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Minus,
  User,
  Briefcase,
  Info
} from 'lucide-react';

interface AvailabilitySlot {
  date: string;
  hours_available: number;
  hours_allocated: number;
  max_hours: number;
  conflicts: Conflict[];
  assignments: Assignment[];
}

interface Conflict {
  id: number;
  type: 'overallocation' | 'leave' | 'holiday' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface Assignment {
  id: number;
  client_name: string;
  project_name: string;
  hours: number;
  status: 'confirmed' | 'tentative' | 'proposed';
}

interface AvailabilityHeatmapProps {
  personId: number;
  personName?: string;
  startDate: string;
  endDate: string;
  className?: string;
}

export const AvailabilityHeatmap: React.FC<AvailabilityHeatmapProps> = ({
  personId,
  personName,
  startDate,
  endDate,
  className = ''
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Mock data for demonstration
  const mockAvailabilityData: AvailabilitySlot[] = [
    {
      date: '2025-09-08',
      hours_available: 6,
      hours_allocated: 8,
      max_hours: 8,
      conflicts: [
        { id: 1, type: 'overallocation', description: 'Over-allocated by 2 hours', severity: 'high' }
      ],
      assignments: [
        { id: 1, client_name: 'TechCorp', project_name: 'API Development', hours: 6, status: 'confirmed' },
        { id: 2, client_name: 'StartupXYZ', project_name: 'UI Review', hours: 2, status: 'tentative' }
      ]
    },
    {
      date: '2025-09-09',
      hours_available: 8,
      hours_allocated: 6,
      max_hours: 8,
      conflicts: [],
      assignments: [
        { id: 3, client_name: 'TechCorp', project_name: 'API Development', hours: 6, status: 'confirmed' }
      ]
    },
    {
      date: '2025-09-10',
      hours_available: 8,
      hours_allocated: 4,
      max_hours: 8,
      conflicts: [],
      assignments: [
        { id: 4, client_name: 'FinanceInc', project_name: 'Dashboard', hours: 4, status: 'confirmed' }
      ]
    },
    {
      date: '2025-09-11',
      hours_available: 0,
      hours_allocated: 0,
      max_hours: 8,
      conflicts: [
        { id: 2, type: 'leave', description: 'Personal Leave', severity: 'low' }
      ],
      assignments: []
    },
    {
      date: '2025-09-12',
      hours_available: 8,
      hours_allocated: 8,
      max_hours: 8,
      conflicts: [],
      assignments: [
        { id: 5, client_name: 'TechCorp', project_name: 'API Development', hours: 4, status: 'confirmed' },
        { id: 6, client_name: 'ConsultingPro', project_name: 'Strategy Review', hours: 4, status: 'confirmed' }
      ]
    },
    {
      date: '2025-09-13',
      hours_available: 4,
      hours_allocated: 2,
      max_hours: 4,
      conflicts: [],
      assignments: [
        { id: 7, client_name: 'StartupXYZ', project_name: 'Planning', hours: 2, status: 'proposed' }
      ]
    },
    {
      date: '2025-09-14',
      hours_available: 0,
      hours_allocated: 0,
      max_hours: 0,
      conflicts: [
        { id: 3, type: 'holiday', description: 'Weekend', severity: 'low' }
      ],
      assignments: []
    }
  ];

  const getAvailabilityColor = (slot: AvailabilitySlot) => {
    const utilization = slot.max_hours > 0 ? slot.hours_allocated / slot.max_hours : 0;
    
    if (slot.conflicts.some(c => c.severity === 'high')) {
      return 'bg-red-500'; // Overallocated or high conflicts
    }
    if (slot.conflicts.some(c => c.type === 'leave' || c.type === 'holiday')) {
      return 'bg-zinc-600'; // Leave/Holiday
    }
    if (utilization >= 1) {
      return 'bg-amber-500'; // Fully allocated
    }
    if (utilization >= 0.75) {
      return 'bg-[#4997D0]'; // Mostly allocated
    }
    if (utilization >= 0.25) {
      return 'bg-emerald-500'; // Partially allocated
    }
    return 'bg-zinc-700'; // Available
  };

  const getAvailabilityText = (slot: AvailabilitySlot) => {
    if (slot.conflicts.some(c => c.type === 'leave' || c.type === 'holiday')) {
      return 'Unavailable';
    }
    if (slot.hours_allocated > slot.max_hours) {
      return 'Overallocated';
    }
    if (slot.hours_allocated === slot.max_hours) {
      return 'Fully Allocated';
    }
    if (slot.hours_allocated === 0) {
      return 'Available';
    }
    return 'Partially Allocated';
  };

  const getConflictIcon = (type: Conflict['type']) => {
    switch (type) {
      case 'overallocation': return <AlertTriangle className="text-red-400" size={14} />;
      case 'leave': return <User className="text-blue-400" size={14} />;
      case 'holiday': return <Calendar className="text-purple-400" size={14} />;
      default: return <Info className="text-amber-400" size={14} />;
    }
  };

  const getAssignmentStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'tentative': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'proposed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const selectedSlot = selectedDate ? mockAvailabilityData.find(slot => slot.date === selectedDate) : null;

  // Generate week days
  const generateWeekDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const weekDays = generateWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="text-[#4997D0]" size={20} />
          Availability Calendar {personName && `• ${personName}`}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-zinc-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#4997D0] rounded"></div>
            <span className="text-zinc-400">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-zinc-400">Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-zinc-400">Conflict</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-zinc-400 py-2">
            {day}
          </div>
        ))}
        
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const slot = mockAvailabilityData.find(s => s.date === dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all duration-200 relative
                ${isSelected ? 'border-[#4997D0] scale-105' : 'border-transparent hover:border-zinc-600'}
                ${slot ? getAvailabilityColor(slot) : 'bg-zinc-800'}
              `}
            >
              <div className="text-xs font-medium text-white">
                {day.getDate()}
              </div>
              
              {slot && (
                <>
                  {slot.conflicts.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  <div className="text-xs text-white/80 mt-1">
                    {slot.hours_allocated}h
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedSlot && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">
              {new Date(selectedDate!).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedSlot.conflicts.some(c => c.severity === 'high') ? 'bg-red-500/20 text-red-400' :
                selectedSlot.hours_allocated === selectedSlot.max_hours ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {getAvailabilityText(selectedSlot)}
              </span>
            </div>
          </div>

          {/* Availability Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedSlot.hours_available}h</div>
              <div className="text-xs text-zinc-400">Available</div>
            </div>
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedSlot.hours_allocated}h</div>
              <div className="text-xs text-zinc-400">Allocated</div>
            </div>
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-lg font-bold text-white">{selectedSlot.max_hours}h</div>
              <div className="text-xs text-zinc-400">Capacity</div>
            </div>
          </div>

          {/* Conflicts */}
          {selectedSlot.conflicts.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400" />
                Conflicts & Issues
              </h5>
              <div className="space-y-2">
                {selectedSlot.conflicts.map((conflict) => (
                  <div 
                    key={conflict.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg border ${
                      conflict.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                      conflict.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    {getConflictIcon(conflict.type)}
                    <div className="flex-1">
                      <div className="text-sm text-white">{conflict.description}</div>
                      <div className="text-xs text-zinc-400 capitalize">{conflict.type} • {conflict.severity} severity</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {selectedSlot.assignments.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Briefcase size={14} className="text-[#4997D0]" />
                Assignments ({selectedSlot.assignments.length})
              </h5>
              <div className="space-y-2">
                {selectedSlot.assignments.map((assignment) => (
                  <div 
                    key={assignment.id} 
                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{assignment.project_name}</div>
                      <div className="text-xs text-zinc-400">{assignment.client_name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-white font-medium">{assignment.hours}h</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getAssignmentStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSlot.assignments.length === 0 && selectedSlot.conflicts.length === 0 && selectedSlot.hours_available > 0 && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <div className="text-emerald-400 font-medium">Fully Available</div>
              <div className="text-zinc-400 text-sm">No assignments or conflicts</div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {mockAvailabilityData.reduce((sum, slot) => sum + slot.hours_available, 0)}h
          </div>
          <div className="text-xs text-zinc-400">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#4997D0] mb-1">
            {mockAvailabilityData.reduce((sum, slot) => sum + slot.hours_allocated, 0)}h
          </div>
          <div className="text-xs text-zinc-400">Allocated</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {Math.round(mockAvailabilityData.reduce((sum, slot) => sum + (slot.max_hours > 0 ? slot.hours_allocated / slot.max_hours : 0), 0) / mockAvailabilityData.length * 100)}%
          </div>
          <div className="text-xs text-zinc-400">Utilization</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {mockAvailabilityData.reduce((sum, slot) => sum + slot.conflicts.length, 0)}
          </div>
          <div className="text-xs text-zinc-400">Conflicts</div>
        </div>
      </div>
    </div>
  );
};
