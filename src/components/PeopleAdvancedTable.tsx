import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
  Activity,
  Star,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Brain,
  Shield,
  User,
  BarChart3,
  Plus,
  Filter,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from '../lib/toast.ts';
import KpiCard from './KpiCard.tsx';
import { Badge } from '../ui/badge.tsx';
import { CandidateRankingDemo } from './CandidateRankingDemo.tsx';
import { WebSocketIndicator } from './WebSocketIndicator.tsx';

// Types for People module
interface Person {
  person_id: number;
  name: string;
  email: string;
  level: string; // L1, L2, L3, L4, L5
  timezone: string;
  reliability_score: number;
  availability_next_2_weeks: number; // percentage
  location: string;
  phone: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  skills: PersonSkill[];
  base_rate: number;
  currency: string;
  last_active: string;
  assignments_count: number;
  total_revenue: number;
  performance_score: number;
  client_satisfaction: number;
  join_date: string;
  languages: string[];
  certifications: string[];
}

interface PersonSkill {
  skill_id: number;
  name: string;
  level: number; // 1-5
  last_used_at?: string;
  confidence: number; // 0-1
  category: string;
}

interface PeopleTableFilters {
  search: string;
  level: string;
  status: string;
  department: string;
  skills: string;
  availability: string;
  rate: { min: string; max: string };
}

interface PeopleColumnVisibility {
  name: boolean;
  level: boolean;
  skills: boolean;
  availability: boolean;
  rate: boolean;
  performance: boolean;
  reliability: boolean;
  status: boolean;
  location: boolean;
  actions: boolean;
}

const PeopleAdvancedTable: React.FC = () => {
  // Enhanced sample data matching the API specification
  const initialPeople: Person[] = [
    {
      person_id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      level: 'L4',
      timezone: 'America/New_York',
      reliability_score: 0.95,
      availability_next_2_weeks: 80,
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      department: 'Technology',
      status: 'Active',
      skills: [
        { skill_id: 1, name: 'Python', level: 5, confidence: 0.95, category: 'Programming', last_used_at: '2025-09-01' },
        { skill_id: 2, name: 'React', level: 4, confidence: 0.88, category: 'Frontend', last_used_at: '2025-08-15' },
        { skill_id: 3, name: 'AWS', level: 4, confidence: 0.85, category: 'Cloud', last_used_at: '2025-09-05' }
      ],
      base_rate: 185,
      currency: 'USD',
      last_active: '2 hours ago',
      assignments_count: 8,
      total_revenue: 485000,
      performance_score: 92,
      client_satisfaction: 4.8,
      join_date: '2021-03-15',
      languages: ['English', 'Mandarin', 'Spanish'],
      certifications: ['AWS Solutions Architect', 'Scrum Master']
    },
    {
      person_id: 2,
      name: 'Marcus Johnson',
      email: 'marcus.johnson@company.com',
      level: 'L5',
      timezone: 'America/Los_Angeles',
      reliability_score: 0.98,
      availability_next_2_weeks: 60,
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      department: 'Consulting',
      status: 'Active',
      skills: [
        { skill_id: 4, name: 'Strategy Consulting', level: 5, confidence: 0.95, category: 'Business', last_used_at: '2025-09-08' },
        { skill_id: 5, name: 'Financial Analysis', level: 5, confidence: 0.92, category: 'Finance', last_used_at: '2025-09-06' },
        { skill_id: 6, name: 'Project Management', level: 4, confidence: 0.90, category: 'Management', last_used_at: '2025-09-07' }
      ],
      base_rate: 295,
      currency: 'USD',
      last_active: '30 minutes ago',
      assignments_count: 12,
      total_revenue: 825000,
      performance_score: 96,
      client_satisfaction: 4.9,
      join_date: '2020-01-10',
      languages: ['English', 'French'],
      certifications: ['PMP', 'CFA', 'Six Sigma Black Belt']
    },
    {
      person_id: 3,
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@company.com',
      level: 'L3',
      timezone: 'Europe/Madrid',
      reliability_score: 0.89,
      availability_next_2_weeks: 90,
      location: 'Madrid, Spain',
      phone: '+34 123 456 789',
      department: 'Design',
      status: 'Active',
      skills: [
        { skill_id: 7, name: 'UI/UX Design', level: 5, confidence: 0.93, category: 'Design', last_used_at: '2025-09-08' },
        { skill_id: 8, name: 'Figma', level: 5, confidence: 0.95, category: 'Tools', last_used_at: '2025-09-08' },
        { skill_id: 9, name: 'User Research', level: 4, confidence: 0.87, category: 'Research', last_used_at: '2025-09-05' }
      ],
      base_rate: 125,
      currency: 'EUR',
      last_active: '1 hour ago',
      assignments_count: 6,
      total_revenue: 285000,
      performance_score: 88,
      client_satisfaction: 4.7,
      join_date: '2022-05-20',
      languages: ['Spanish', 'English', 'Portuguese'],
      certifications: ['Google UX Design', 'Adobe Certified Expert']
    },
    {
      person_id: 4,
      name: 'David Kim',
      email: 'david.kim@company.com',
      level: 'L2',
      timezone: 'Asia/Seoul',
      reliability_score: 0.91,
      availability_next_2_weeks: 100,
      location: 'Seoul, South Korea',
      phone: '+82 10 1234 5678',
      department: 'Data Science',
      status: 'Active',
      skills: [
        { skill_id: 10, name: 'Machine Learning', level: 4, confidence: 0.85, category: 'AI/ML', last_used_at: '2025-09-07' },
        { skill_id: 11, name: 'Python', level: 4, confidence: 0.88, category: 'Programming', last_used_at: '2025-09-08' },
        { skill_id: 12, name: 'TensorFlow', level: 3, confidence: 0.75, category: 'AI/ML', last_used_at: '2025-08-30' }
      ],
      base_rate: 95,
      currency: 'USD',
      last_active: '4 hours ago',
      assignments_count: 3,
      total_revenue: 145000,
      performance_score: 85,
      client_satisfaction: 4.5,
      join_date: '2023-08-14',
      languages: ['Korean', 'English', 'Japanese'],
      certifications: ['Google Cloud ML Engineer', 'Databricks Certified']
    },
    {
      person_id: 5,
      name: 'Amelia Thompson',
      email: 'amelia.thompson@company.com',
      level: 'L4',
      timezone: 'Europe/London',
      reliability_score: 0.93,
      availability_next_2_weeks: 70,
      location: 'London, UK',
      phone: '+44 20 1234 5678',
      department: 'Operations',
      status: 'Active',
      skills: [
        { skill_id: 13, name: 'Process Optimization', level: 5, confidence: 0.92, category: 'Operations', last_used_at: '2025-09-06' },
        { skill_id: 14, name: 'Supply Chain', level: 4, confidence: 0.88, category: 'Operations', last_used_at: '2025-09-04' },
        { skill_id: 15, name: 'Lean Six Sigma', level: 4, confidence: 0.90, category: 'Process', last_used_at: '2025-09-02' }
      ],
      base_rate: 165,
      currency: 'GBP',
      last_active: '45 minutes ago',
      assignments_count: 7,
      total_revenue: 395000,
      performance_score: 91,
      client_satisfaction: 4.6,
      join_date: '2021-11-08',
      languages: ['English', 'German'],
      certifications: ['Lean Six Sigma Black Belt', 'APICS CSCP']
    },
    {
      person_id: 6,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@company.com',
      level: 'L3',
      timezone: 'Asia/Dubai',
      reliability_score: 0.87,
      availability_next_2_weeks: 85,
      location: 'Dubai, UAE',
      phone: '+971 50 123 4567',
      department: 'Cybersecurity',
      status: 'Active',
      skills: [
        { skill_id: 16, name: 'Penetration Testing', level: 4, confidence: 0.89, category: 'Security', last_used_at: '2025-09-05' },
        { skill_id: 17, name: 'Network Security', level: 4, confidence: 0.86, category: 'Security', last_used_at: '2025-09-07' },
        { skill_id: 18, name: 'Incident Response', level: 3, confidence: 0.82, category: 'Security', last_used_at: '2025-08-28' }
      ],
      base_rate: 145,
      currency: 'USD',
      last_active: '6 hours ago',
      assignments_count: 5,
      total_revenue: 275000,
      performance_score: 87,
      client_satisfaction: 4.4,
      join_date: '2022-09-12',
      languages: ['Arabic', 'English', 'French'],
      certifications: ['CISSP', 'CEH', 'OSCP']
    },
    {
      person_id: 7,
      name: 'Julia Kowalski',
      email: 'julia.kowalski@company.com',
      level: 'L1',
      timezone: 'Europe/Warsaw',
      reliability_score: 0.83,
      availability_next_2_weeks: 95,
      location: 'Warsaw, Poland',
      phone: '+48 123 456 789',
      department: 'Marketing',
      status: 'Active',
      skills: [
        { skill_id: 19, name: 'Digital Marketing', level: 3, confidence: 0.78, category: 'Marketing', last_used_at: '2025-09-08' },
        { skill_id: 20, name: 'Content Strategy', level: 3, confidence: 0.80, category: 'Marketing', last_used_at: '2025-09-07' },
        { skill_id: 21, name: 'SEO/SEM', level: 2, confidence: 0.70, category: 'Marketing', last_used_at: '2025-09-01' }
      ],
      base_rate: 75,
      currency: 'USD',
      last_active: '1 hour ago',
      assignments_count: 2,
      total_revenue: 85000,
      performance_score: 79,
      client_satisfaction: 4.3,
      join_date: '2024-02-15',
      languages: ['Polish', 'English', 'German'],
      certifications: ['Google Ads', 'HubSpot Content Marketing']
    },
    {
      person_id: 8,
      name: 'Roberto Silva',
      email: 'roberto.silva@company.com',
      level: 'L5',
      timezone: 'America/Sao_Paulo',
      reliability_score: 0.96,
      availability_next_2_weeks: 50,
      location: 'São Paulo, Brazil',
      phone: '+55 11 98765 4321',
      department: 'Architecture',
      status: 'Active',
      skills: [
        { skill_id: 22, name: 'Solution Architecture', level: 5, confidence: 0.94, category: 'Architecture', last_used_at: '2025-09-08' },
        { skill_id: 23, name: 'Microservices', level: 5, confidence: 0.91, category: 'Architecture', last_used_at: '2025-09-06' },
        { skill_id: 24, name: 'Cloud Architecture', level: 4, confidence: 0.88, category: 'Cloud', last_used_at: '2025-09-04' }
      ],
      base_rate: 275,
      currency: 'USD',
      last_active: '3 hours ago',
      assignments_count: 10,
      total_revenue: 675000,
      performance_score: 94,
      client_satisfaction: 4.8,
      join_date: '2019-06-03',
      languages: ['Portuguese', 'English', 'Spanish'],
      certifications: ['AWS Solutions Architect Professional', 'TOGAF']
    }
  ];

  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PeopleTableFilters>({
    search: '',
    level: '',
    status: '',
    department: '',
    skills: '',
    availability: '',
    rate: { min: '', max: '' }
  });
  
  const [columnVisibility, setColumnVisibility] = useState<PeopleColumnVisibility>({
    name: true,
    level: true,
    skills: true,
    availability: true,
    rate: true,
    performance: true,
    reliability: true,
    status: true,
    location: true,
    actions: true
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Person | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [selectedPeople, setSelectedPeople] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);
  const [showRankingDemo, setShowRankingDemo] = useState(false);

  // Unique values for filters
  const uniqueLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const uniqueStatuses = ['Active', 'Inactive', 'On Leave'];
  const uniqueDepartments = [...new Set(people.map(p => p.department))];
  const uniqueSkills = [...new Set(people.flatMap(p => p.skills.map(s => s.name)))];

  // Calculate dashboard stats
  const activePeople = people.filter(p => p.status === 'Active').length;
  const avgPerformance = Math.round(people.reduce((sum, p) => sum + p.performance_score, 0) / people.length);
  const totalRevenue = people.reduce((sum, p) => sum + p.total_revenue, 0);
  const avgAvailability = Math.round(people.reduce((sum, p) => sum + p.availability_next_2_weeks, 0) / people.length);

  // Filter and sort people
  const filteredAndSortedPeople = useMemo(() => {
    let filtered = people.filter(person => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          person.name.toLowerCase().includes(searchLower) ||
          person.email.toLowerCase().includes(searchLower) ||
          person.skills.some(s => s.name.toLowerCase().includes(searchLower)) ||
          person.location.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Level filter
      if (filters.level && person.level !== filters.level) return false;

      // Status filter
      if (filters.status && person.status !== filters.status) return false;

      // Department filter
      if (filters.department && person.department !== filters.department) return false;

      // Skills filter
      if (filters.skills) {
        const hasSkill = person.skills.some(s => s.name.toLowerCase().includes(filters.skills.toLowerCase()));
        if (!hasSkill) return false;
      }

      // Availability filter
      if (filters.availability) {
        if (filters.availability === 'High' && person.availability_next_2_weeks < 80) return false;
        if (filters.availability === 'Medium' && (person.availability_next_2_weeks < 50 || person.availability_next_2_weeks >= 80)) return false;
        if (filters.availability === 'Low' && person.availability_next_2_weeks >= 50) return false;
      }

      // Rate filter
      if (filters.rate.min && person.base_rate < parseInt(filters.rate.min)) return false;
      if (filters.rate.max && person.base_rate > parseInt(filters.rate.max)) return false;

      return true;
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        
        let comparison = 0;
        if (aVal != null && bVal != null) {
          if (aVal < bVal) comparison = -1;
          if (aVal > bVal) comparison = 1;
        } else if (aVal == null && bVal != null) {
          comparison = 1;
        } else if (aVal != null && bVal == null) {
          comparison = -1;
        }
        
        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    }

    return filtered;
  }, [people, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPeople.length / pageSize);
  const paginatedPeople = filteredAndSortedPeople.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (key: keyof Person) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectPerson = (personId: number) => {
    setSelectedPeople(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPeople.size === paginatedPeople.length && paginatedPeople.length > 0) {
      setSelectedPeople(new Set());
    } else {
      setSelectedPeople(new Set(paginatedPeople.map(p => p.person_id)));
    }
  };

  const toggleRowExpansion = (personId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  const copyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast.success('Email copied to clipboard');
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      level: '',
      status: '',
      department: '',
      skills: '',
      availability: '',
      rate: { min: '', max: '' }
    });
  };

  const hasActiveFilters = filters.search || filters.level || filters.status || filters.department || filters.skills || filters.availability || filters.rate.min || filters.rate.max;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'from-emerald-500 to-green-500';
    if (availability >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 0.9) return 'from-emerald-500 to-green-500';
    if (reliability >= 0.8) return 'from-[#4997D0] to-blue-500';
    if (reliability >= 0.7) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-emerald-400';
    if (level >= 3) return 'text-[#4997D0]';
    if (level >= 2) return 'text-amber-400';
    return 'text-zinc-500';
  };

  const getSkillRecencyColor = (lastUsed?: string) => {
    if (!lastUsed) return 'opacity-50';
    const daysSince = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 7) return 'opacity-100';
    if (daysSince <= 30) return 'opacity-75';
    return 'opacity-50';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800/50 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-zinc-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active People"
          value={activePeople}
          icon={<Users className="w-5 h-5" />}
          tint="#22c55e"
        />
        <KpiCard
          title="Avg Performance"
          value={`${avgPerformance}%`}
          icon={<Target className="w-5 h-5" />}
          tint="#4997D0"
        />
        <KpiCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="w-5 h-5" />}
          tint="#f59e0b"
        />
        <KpiCard
          title="Avg Availability"
          value={`${avgAvailability}%`}
          icon={<Clock className="w-5 h-5" />}
          tint="#8b5cf6"
        />
      </div>

      {/* Real-time Updates Indicator */}
      <div className="flex items-center justify-between">
        <WebSocketIndicator className="flex-1" />
        <div className="text-xs text-zinc-500 bg-zinc-800/30 px-3 py-1 rounded-full">
          Performance: &lt;300ms candidate ranking • &lt;50ms rate resolution
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
          <span className="text-sm text-zinc-500">
            {filteredAndSortedPeople.length} results
          </span>
          {selectedPeople.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#4997D0]">{selectedPeople.size} selected</span>
              <button className="px-2 py-1 bg-[#4997D0]/10 border border-[#4997D0]/20 rounded text-[#4997D0] hover:bg-[#4997D0]/20 transition-all">
                <Download size={14} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowRankingDemo(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Brain size={18} />
            <span>Rank Candidates</span>
          </button>
          <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Filter size={18} />
            <span>Advanced</span>
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-[#4997D0] to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#4997D0]/30 transition-all transform hover:scale-105">
            <span className="flex items-center gap-2">
              <Plus size={18} />
              Add Person
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="text-left px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPeople.size === paginatedPeople.length && paginatedPeople.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                  />
                </th>
                
                {columnVisibility.name && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('name')}
                      >
                        <User size={14} className="text-[#4997D0]" />
                        Person
                        {sortConfig.key === 'name' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input
                          type="text"
                          placeholder="Search people..."
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                          className="w-full pl-7 pr-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                        />
                      </div>
                    </div>
                  </th>
                )}

                {columnVisibility.level && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('level')}
                      >
                        <Award size={14} className="text-purple-400" />
                        Level
                        {sortConfig.key === 'level' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <select
                        value={filters.level}
                        onChange={(e) => setFilters({...filters, level: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Levels</option>
                        {uniqueLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.skills && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <Brain size={14} className="text-emerald-400" />
                        Skills
                      </div>
                      <input
                        type="text"
                        placeholder="Filter by skill..."
                        value={filters.skills}
                        onChange={(e) => setFilters({...filters, skills: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      />
                    </div>
                  </th>
                )}

                {columnVisibility.availability && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('availability_next_2_weeks')}
                      >
                        <Clock size={14} className="text-amber-400" />
                        Availability
                        {sortConfig.key === 'availability_next_2_weeks' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <select
                        value={filters.availability}
                        onChange={(e) => setFilters({...filters, availability: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Availability</option>
                        <option value="High">High (80%+)</option>
                        <option value="Medium">Medium (50-79%)</option>
                        <option value="Low">Low (&lt;50%)</option>
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.rate && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('base_rate')}
                      >
                        <DollarSign size={14} className="text-yellow-400" />
                        Rate
                        {sortConfig.key === 'base_rate' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.rate.min}
                          onChange={(e) => setFilters({...filters, rate: {...filters.rate, min: e.target.value}})}
                          className="w-16 px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.rate.max}
                          onChange={(e) => setFilters({...filters, rate: {...filters.rate, max: e.target.value}})}
                          className="w-16 px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                        />
                      </div>
                    </div>
                  </th>
                )}

                {columnVisibility.performance && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('performance_score')}
                      >
                        <Target size={14} className="text-rose-400" />
                        Performance
                        {sortConfig.key === 'performance_score' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <div className="h-7"></div>
                    </div>
                  </th>
                )}

                {columnVisibility.reliability && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div 
                        className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                        onClick={() => handleSort('reliability_score')}
                      >
                        <Shield size={14} className="text-blue-400" />
                        Reliability
                        {sortConfig.key === 'reliability_score' && (
                          <span className="text-[#4997D0]">
                            {sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                      <div className="h-7"></div>
                    </div>
                  </th>
                )}

                {columnVisibility.status && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-emerald-400" />
                        Status
                      </div>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                      >
                        <option value="">All Status</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}

                {columnVisibility.location && (
                  <th className="text-left px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} className="text-cyan-400" />
                        Location
                      </div>
                      <div className="h-7"></div>
                    </div>
                  </th>
                )}

                {columnVisibility.actions && (
                  <th className="text-center px-4 py-3">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Actions
                      </div>
                      <div className="h-7"></div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-800/50">
              {paginatedPeople.map((person) => (
                <React.Fragment key={person.person_id}>
                  <tr 
                    className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                    onClick={() => toggleRowExpansion(person.person_id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPeople.has(person.person_id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectPerson(person.person_id);
                        }}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                      />
                    </td>
                    
                    {columnVisibility.name && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4997D0] via-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-[#4997D0]/20">
                              <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                                <span className="text-lg font-bold text-white">
                                  {person.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            {person.status === 'Active' && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-zinc-950 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm group-hover:text-[#4997D0] transition-colors">
                              {person.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-zinc-500 text-xs">{person.email}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyEmail(person.email, person.person_id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedEmail === person.person_id ? (
                                  <Check size={14} className="text-emerald-400" />
                                ) : (
                                  <Copy size={14} className="text-zinc-500 hover:text-[#4997D0]" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={12} className="text-zinc-600" />
                              <span className="text-zinc-600 text-xs">{person.last_active}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {columnVisibility.level && (
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Badge variant="muted" className="text-purple-400 bg-purple-500/10 border-purple-500/20">
                            {person.level}
                          </Badge>
                          <div className="text-zinc-600 text-xs">{person.department}</div>
                        </div>
                      </td>
                    )}

                    {columnVisibility.skills && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {person.skills.slice(0, 3).map((skill) => (
                            <span 
                              key={skill.skill_id} 
                              className={`px-2 py-1 bg-zinc-700/50 text-xs rounded ${getSkillLevelColor(skill.level)} ${getSkillRecencyColor(skill.last_used_at)}`}
                            >
                              {skill.name} {skill.level}
                            </span>
                          ))}
                          {person.skills.length > 3 && (
                            <span className="px-2 py-1 bg-zinc-700/50 text-zinc-400 text-xs rounded">
                              +{person.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {columnVisibility.availability && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${getAvailabilityColor(person.availability_next_2_weeks)} rounded-full transition-all duration-1000`}
                                style={{ width: `${person.availability_next_2_weeks}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white min-w-[35px]">
                            {person.availability_next_2_weeks}%
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.rate && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm">
                            {person.currency === 'USD' ? '$' : person.currency === 'EUR' ? '€' : person.currency === 'GBP' ? '£' : ''}{person.base_rate}
                          </span>
                          <span className="text-zinc-600 text-xs">
                            {person.assignments_count} assignments
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.performance && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#4997D0] to-cyan-500 rounded-full transition-all duration-1000"
                                style={{ width: `${person.performance_score}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white min-w-[35px]">
                            {person.performance_score}%
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.reliability && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${getReliabilityColor(person.reliability_score)} rounded-full transition-all duration-1000`}
                                style={{ width: `${person.reliability_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white min-w-[35px]">
                            {Math.round(person.reliability_score * 100)}%
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.status && (
                      <td className="px-4 py-3">
                        <Badge variant={person.status === 'Active' ? 'success' : 'muted'}>
                          {person.status === 'Active' && <CheckCircle2 size={12} className="mr-1" />}
                          {person.status === 'Inactive' && <X size={12} className="mr-1" />}
                          {person.status === 'On Leave' && <AlertCircle size={12} className="mr-1" />}
                          {person.status}
                        </Badge>
                      </td>
                    )}

                    {columnVisibility.location && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-zinc-500" />
                          <div>
                            <div className="text-zinc-300 text-sm">{person.location}</div>
                            <div className="text-zinc-600 text-xs">{person.timezone.split('/')[1]?.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                    )}

                    {columnVisibility.actions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view action
                            }}
                            className="p-2 bg-zinc-800 hover:bg-[#4997D0]/20 rounded-lg transition-all hover:text-[#4997D0]"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle rank action
                            }}
                            className="p-2 bg-zinc-800 hover:bg-emerald-500/20 rounded-lg transition-all hover:text-emerald-400"
                            title="Rank for assignment"
                          >
                            <Brain size={14} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit action
                            }}
                            className="p-2 bg-zinc-800 hover:bg-amber-500/20 rounded-lg transition-all hover:text-amber-400"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expandable Row */}
                  {expandedRows.has(person.person_id) && (
                    <tr className="bg-zinc-900/50 border-b border-zinc-800/30">
                      <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Personal Details */}
                          <div className="space-y-3">
                            <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                              <User size={16} />
                              Personal Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-zinc-500" />
                                <span className="text-white">{person.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin size={14} className="text-zinc-500" />
                                <span className="text-white">{person.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Globe size={14} className="text-zinc-500" />
                                <span className="text-white">{person.timezone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-zinc-500" />
                                <span className="text-white">Joined {formatDate(person.join_date)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Skills & Performance */}
                          <div className="space-y-3">
                            <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                              <Brain size={16} />
                              Skills & Performance
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Performance Score</span>
                                <span className="text-white font-medium">{person.performance_score}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Client Satisfaction</span>
                                <div className="flex items-center gap-1">
                                  <Star size={12} className="text-amber-400 fill-current" />
                                  <span className="text-white font-medium">{person.client_satisfaction}/5.0</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Reliability</span>
                                <span className="text-white font-medium">{Math.round(person.reliability_score * 100)}%</span>
                              </div>
                              <div>
                                <div className="text-zinc-400 text-sm mb-1">Top Skills:</div>
                                <div className="flex flex-wrap gap-1">
                                  {person.skills.map((skill) => (
                                    <span 
                                      key={skill.skill_id} 
                                      className={`px-2 py-1 bg-zinc-700 text-xs rounded ${getSkillLevelColor(skill.level)}`}
                                    >
                                      {skill.name} ({skill.level}/5)
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Financial & Activity */}
                          <div className="space-y-3">
                            <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                              <DollarSign size={16} />
                              Financial & Activity
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Base Rate</span>
                                <span className="text-white font-medium">
                                  {person.currency === 'USD' ? '$' : person.currency === 'EUR' ? '€' : person.currency === 'GBP' ? '£' : ''}{person.base_rate}/hr
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Total Revenue</span>
                                <span className="text-emerald-400 font-medium">${person.total_revenue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Assignments</span>
                                <span className="text-white font-medium">{person.assignments_count}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Availability</span>
                                <span className={`font-medium ${person.availability_next_2_weeks >= 80 ? 'text-emerald-400' : person.availability_next_2_weeks >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {person.availability_next_2_weeks}% next 2 weeks
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Last Active</span>
                                <span className="text-white font-medium">{person.last_active}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      currentPage === page 
                        ? 'bg-[#4997D0] text-white' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="text-sm text-zinc-400">
              {filteredAndSortedPeople.length} total people
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedPeople.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No people found</h3>
          <p className="text-zinc-500 mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'No people available in the directory.'}
          </p>
        </div>
      )}

      {/* Candidate Ranking Demo Modal */}
      <CandidateRankingDemo
        isOpen={showRankingDemo}
        onClose={() => setShowRankingDemo(false)}
      />
    </div>
  );
};

export default PeopleAdvancedTable;
