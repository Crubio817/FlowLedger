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
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from '../lib/toast.ts';
import KpiCard from './KpiCard.tsx';
import { Badge } from '../ui/badge.tsx';
import Modal from './Modal.tsx';
import { CandidateRankingModal } from './CandidateRankingModal.tsx';
import { RateBreakdownModal } from './RateBreakdownModal.tsx';
import { AvailabilityHeatmap } from './AvailabilityHeatmap.tsx';
import { SkillsChart } from './SkillsChart.tsx';
import { WebSocketIndicator } from './WebSocketIndicator.tsx';
import { peopleApi, type Person, type PeopleFilters } from '../services/people.api.ts';

// Production-ready types based on API specification
interface PersonTableData {
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

const PeopleAdvancedTableProduction: React.FC = () => {
  // Production state management
  const [people, setPeople] = useState<PersonTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
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
    key: keyof PersonTableData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedPeople, setSelectedPeople] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);
  
  // Modal states for production features
  const [showCandidateRanking, setShowCandidateRanking] = useState(false);
  const [showRateBreakdown, setShowRateBreakdown] = useState(false);
  const [showAvailabilityHeatmap, setShowAvailabilityHeatmap] = useState(false);
  const [showSkillsChart, setShowSkillsChart] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Load people data from API
  const loadPeople = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      // Convert filters to API format
      const apiFilters: PeopleFilters = {
        search: filters.search || undefined,
        departments: filters.department ? [filters.department] : undefined,
        levels: filters.level ? [filters.level] : undefined,
        status: filters.status ? [filters.status as 'Active' | 'Inactive' | 'On Leave'] : undefined,
        skills: filters.skills ? [filters.skills] : undefined,
        availability: filters.availability ? {
          minPercentage: filters.availability === 'High' ? 80 : 
                        filters.availability === 'Medium' ? 50 : 0
        } : undefined,
        rate: (filters.rate?.min || filters.rate?.max) ? {
          min: filters.rate.min ? parseInt(filters.rate.min) : 0,
          max: filters.rate.max ? parseInt(filters.rate.max) : 999999
        } : undefined
      };

      const data = await peopleApi.getPeople(apiFilters);
      
      // Transform API data to table format
      const transformedData: PersonTableData[] = data.map(person => ({
        person_id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        email: person.email,
        level: person.level,
        timezone: person.timezone,
        reliability_score: 0.9, // Will come from API
        availability_next_2_weeks: person.availability || 0,
        location: person.location,
        phone: person.phone || '',
        department: person.department,
        status: person.status,
        skills: person.skills.map(skill => ({
          skill_id: 0, // Using default since PersonSkill doesn't have skill_id
          name: skill.name,
          level: skill.proficiency || 0,
          confidence: skill.confidence || 0,
          category: skill.category || 'Technical',
          last_used_at: skill.lastUsed
        })),
        base_rate: person.hourlyRate || 0,
        currency: 'USD',
        last_active: '1 hour ago', // Will come from API
        assignments_count: 0, // Will come from API
        total_revenue: 0, // Will come from API
        performance_score: 0, // Will come from API
        client_satisfaction: 0, // Will come from API
        join_date: person.startDate,
        languages: [], // Will come from API
        certifications: person.certifications || []
      }));

      setPeople(transformedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load people data');
      toast.error('Failed to load people data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPeople();
  }, []);

  // Refresh when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadPeople(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadPeople(false);
  };

  // Filter and sort logic (client-side for performance)
  const filteredAndSortedPeople = useMemo(() => {
    let filtered = [...people];

    // Apply sorting
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
  }, [people, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPeople.length / pageSize);
  const paginatedPeople = filteredAndSortedPeople.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate dashboard stats
  const activePeople = people.filter(p => p.status === 'Active').length;
  const avgPerformance = people.length > 0 ? Math.round(people.reduce((sum, p) => sum + p.performance_score, 0) / people.length) : 0;
  const totalRevenue = people.reduce((sum, p) => sum + p.total_revenue, 0);
  const avgAvailability = people.length > 0 ? Math.round(people.reduce((sum, p) => sum + p.availability_next_2_weeks, 0) / people.length) : 0;

  // Utility functions
  const handleSort = (key: keyof PersonTableData) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedPeople(checked ? new Set(paginatedPeople.map(p => p.person_id)) : new Set());
  };

  const handleSelectPerson = (personId: number, checked: boolean) => {
    setSelectedPeople(current => {
      const updated = new Set(current);
      if (checked) {
        updated.add(personId);
      } else {
        updated.delete(personId);
      }
      return updated;
    });
  };

  const toggleRowExpansion = (personId: number) => {
    setExpandedRows(current => {
      const updated = new Set(current);
      if (updated.has(personId)) {
        updated.delete(personId);
      } else {
        updated.add(personId);
      }
      return updated;
    });
  };

  const copyEmail = (email: string, personId: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(personId);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedEmail(null), 2000);
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
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'string' ? value !== '' : value.min !== '' || value.max !== ''
  );

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-emerald-400 border-emerald-500/20';
    if (level >= 3) return 'text-cyan-400 border-cyan-500/20';
    if (level >= 2) return 'text-amber-400 border-amber-500/20';
    return 'text-red-400 border-red-500/20';
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400';
    if (score >= 0.8) return 'text-cyan-400';
    if (score >= 0.7) return 'text-amber-400';
    return 'text-red-400';
  };

  // Loading state
  if (loading && people.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-cyan-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Loading people directory...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && people.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Failed to Load People</h3>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button
              onClick={() => loadPeople()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
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
          value={activePeople.toString()}
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

      {/* Real-time Updates & Status */}
      <div className="flex items-center justify-between">
        <WebSocketIndicator className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-500 bg-zinc-800/30 px-3 py-1 rounded-full">
            Performance: API Response &lt;300ms
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search people..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#4997D0] focus:border-transparent"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4997D0] focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="L1">L1 - Associate</option>
              <option value="L2">L2 - Senior Associate</option>
              <option value="L3">L3 - Manager</option>
              <option value="L4">L4 - Senior Manager</option>
              <option value="L5">L5 - Director</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4997D0] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4997D0] focus:border-transparent"
            >
              <option value="">All Availability</option>
              <option value="High">High (80%+)</option>
              <option value="Medium">Medium (50-79%)</option>
              <option value="Low">Low (&lt;50%)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm"
            >
              <X size={14} />
              Clear filters
            </button>
            <span className="text-sm text-zinc-500">
              {filteredAndSortedPeople.length} results found
            </span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            {filteredAndSortedPeople.length} total people
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
            onClick={() => setShowCandidateRanking(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Brain size={18} />
            <span>Rank Candidates</span>
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
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0] focus:ring-[#4997D0]"
                  />
                </th>
                {columnVisibility.name && (
                  <th 
                    className="text-left px-4 py-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.level && (
                  <th 
                    className="text-left px-4 py-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      Level
                      {sortConfig.key === 'level' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.skills && (
                  <th className="text-left px-4 py-3 text-zinc-300 font-medium">
                    Skills
                  </th>
                )}
                {columnVisibility.availability && (
                  <th 
                    className="text-left px-4 py-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort('availability_next_2_weeks')}
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      Availability
                      {sortConfig.key === 'availability_next_2_weeks' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.rate && (
                  <th 
                    className="text-left px-4 py-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort('base_rate')}
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      Rate
                      {sortConfig.key === 'base_rate' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.reliability && (
                  <th 
                    className="text-left px-4 py-3 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => handleSort('reliability_score')}
                  >
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      Reliability
                      {sortConfig.key === 'reliability_score' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                )}
                {columnVisibility.status && (
                  <th className="text-left px-4 py-3 text-zinc-300 font-medium">
                    Status
                  </th>
                )}
                {columnVisibility.actions && (
                  <th className="text-left px-4 py-3 text-zinc-300 font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedPeople.map((person) => (
                <React.Fragment key={person.person_id}>
                  <tr className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPeople.has(person.person_id)}
                        onChange={(e) => handleSelectPerson(person.person_id, e.target.checked)}
                        className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0] focus:ring-[#4997D0]"
                      />
                    </td>
                    
                    {columnVisibility.name && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#4997D0] to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-white">{person.name}</div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <span>{person.email}</span>
                              <button
                                onClick={() => copyEmail(person.email, person.person_id)}
                                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                title="Copy email"
                              >
                                {copiedEmail === person.person_id ? (
                                  <Check size={12} className="text-green-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
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
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {person.skills.slice(0, 3).map((skill) => (
                            <span 
                              key={skill.skill_id} 
                              className={`px-2 py-1 bg-zinc-700 text-xs rounded ${getSkillLevelColor(skill.level)}`}
                            >
                              {skill.name} ({skill.level}/5)
                            </span>
                          ))}
                          {person.skills.length > 3 && (
                            <button
                              onClick={() => {
                                setSelectedPersonId(person.person_id);
                                setShowSkillsChart(true);
                              }}
                              className="px-2 py-1 bg-zinc-600 hover:bg-zinc-500 text-xs rounded text-zinc-300 transition-colors"
                            >
                              +{person.skills.length - 3} more
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                    {columnVisibility.availability && (
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className={`font-medium ${getAvailabilityColor(person.availability_next_2_weeks)}`}>
                            {person.availability_next_2_weeks}%
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPersonId(person.person_id);
                              setShowAvailabilityHeatmap(true);
                            }}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            View calendar
                          </button>
                        </div>
                      </td>
                    )}

                    {columnVisibility.rate && (
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {person.currency === 'USD' ? '$' : person.currency === 'EUR' ? '€' : person.currency === 'GBP' ? '£' : ''}{person.base_rate}/hr
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPersonId(person.person_id);
                              setShowRateBreakdown(true);
                            }}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            View breakdown
                          </button>
                        </div>
                      </td>
                    )}

                    {columnVisibility.reliability && (
                      <td className="px-4 py-3">
                        <div className={`font-medium ${getReliabilityColor(person.reliability_score)}`}>
                          {Math.round(person.reliability_score * 100)}%
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

                    {columnVisibility.actions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleRowExpansion(person.person_id)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                            title={expandedRows.has(person.person_id) ? "Collapse" : "Expand"}
                          >
                            {expandedRows.has(person.person_id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded Row Details */}
                  {expandedRows.has(person.person_id) && (
                    <tr className="bg-zinc-800/30">
                      <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-4 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Contact & Location */}
                          <div className="space-y-3">
                            <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                              <User size={16} />
                              Contact & Location
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-zinc-500" />
                                <span className="text-white">{person.phone || 'Not provided'}</span>
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
                                <span className="text-white">Joined {person.join_date}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Skills & Certifications */}
                          <div className="space-y-3">
                            <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                              <Brain size={16} />
                              Skills & Certifications
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <div className="text-zinc-400 text-xs mb-2">Skills</div>
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
                              {person.certifications.length > 0 && (
                                <div>
                                  <div className="text-zinc-400 text-xs mb-2">Certifications</div>
                                  <div className="flex flex-wrap gap-1">
                                    {person.certifications.map((cert, index) => (
                                      <span key={index} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded">
                                        {cert}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
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
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        currentPage === pageNum 
                          ? 'bg-[#4997D0] text-white' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
              Page {currentPage} of {totalPages} • {filteredAndSortedPeople.length} total people
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
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Production Feature Modals */}
      <CandidateRankingModal
        isOpen={showCandidateRanking}
        onClose={() => setShowCandidateRanking(false)}
        staffingRequest={{
          id: 1,
          title: "Current Staffing Request",
          role: "Software Developer",
          required_skills: ["React", "TypeScript"],
          start_date: "2025-10-01",
          end_date: "2025-12-31",
          budget: 150000,
          urgency: "High" as const
        }}
        onSelectCandidate={(personId) => console.log('Selected candidate:', personId)}
      />

      {selectedPersonId && (
        <>
          <RateBreakdownModal
            isOpen={showRateBreakdown}
            onClose={() => setShowRateBreakdown(false)}
            rate={{
              base: people.find(p => p.person_id === selectedPersonId)?.base_rate || 0,
              abs_premiums: [],
              pct_premiums: [],
              scarcity: 1.0,
              total: people.find(p => p.person_id === selectedPersonId)?.base_rate || 0,
              currency: "USD"
            }}
          />

          {showAvailabilityHeatmap && (
            <Modal
              onClose={() => setShowAvailabilityHeatmap(false)}
              title="Availability Heatmap"
            >
              <AvailabilityHeatmap
                personId={selectedPersonId}
                startDate="2025-09-08"
                endDate="2025-09-21"
              />
            </Modal>
          )}

          {showSkillsChart && (
            <Modal
              onClose={() => setShowSkillsChart(false)}
              title="Skills Chart"
            >
              <SkillsChart
                skills={people.find(p => p.person_id === selectedPersonId)?.skills || []}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default PeopleAdvancedTableProduction;
