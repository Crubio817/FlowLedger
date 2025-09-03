import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  DollarSign,
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
  Target,
  BarChart3,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  revenue: number;
  change: number;
  joinDate: string;
  performance: number;
  deals: number;
  satisfaction: number;
  location: string;
  phone: string;
  lastActive: string;
  projects: number;
  department: string;
}

interface Filters {
  name: string;
  role: string;
  status: string;
  department: string;
  revenue: { min: string; max: string };
}

interface ColumnVisibility {
  name: boolean;
  role: boolean;
  status: boolean;
  revenue: boolean;
  performance: boolean;
  change: boolean;
  satisfaction: boolean;
  actions: boolean;
}

const AdvancedTable = () => {
  // Enhanced sample data with more realistic fields for FlowLedger
  const initialData: TeamMember[] = [
    { 
      id: 1, 
      name: 'Alexander Pierce', 
      email: 'alex@techcorp.com', 
      role: 'CEO', 
      status: 'Active' as const, 
      revenue: 285000, 
      change: 12.5, 
      joinDate: '2021-03-15', 
      performance: 94, 
      deals: 42, 
      satisfaction: 4.8,
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      lastActive: '2 hours ago',
      projects: 15,
      department: 'Executive'
    },
    { 
      id: 2, 
      name: 'Sophia Martinez', 
      email: 'sophia@techcorp.com', 
      role: 'CTO', 
      status: 'Active' as const, 
      revenue: 195000, 
      change: -3.2, 
      joinDate: '2021-05-22', 
      performance: 88, 
      deals: 31, 
      satisfaction: 4.6,
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      lastActive: '30 minutes ago',
      projects: 23,
      department: 'Technology'
    },
    { 
      id: 3, 
      name: 'James Wilson', 
      email: 'james@techcorp.com', 
      role: 'Senior Designer', 
      status: 'Active' as const, 
      revenue: 125000, 
      change: 8.7, 
      joinDate: '2022-01-10', 
      performance: 79, 
      deals: 28, 
      satisfaction: 4.9,
      location: 'Austin, TX',
      phone: '+1 (555) 345-6789',
      lastActive: '1 hour ago',
      projects: 18,
      department: 'Design'
    },
    { 
      id: 4, 
      name: 'Emma Thompson', 
      email: 'emma@techcorp.com', 
      role: 'Lead Developer', 
      status: 'Inactive' as const, 
      revenue: 95000, 
      change: -1.5, 
      joinDate: '2022-03-28', 
      performance: 65, 
      deals: 19, 
      satisfaction: 4.2,
      location: 'Seattle, WA',
      phone: '+1 (555) 456-7890',
      lastActive: '2 days ago',
      projects: 12,
      department: 'Technology'
    },
    { 
      id: 5, 
      name: 'Michael Chen', 
      email: 'michael@techcorp.com', 
      role: 'Marketing Director', 
      status: 'Active' as const, 
      revenue: 150000, 
      change: 15.3, 
      joinDate: '2022-06-14', 
      performance: 91, 
      deals: 35, 
      satisfaction: 4.7,
      location: 'Los Angeles, CA',
      phone: '+1 (555) 567-8901',
      lastActive: '15 minutes ago',
      projects: 20,
      department: 'Marketing'
    },
    { 
      id: 6, 
      name: 'Olivia Davis', 
      email: 'olivia@techcorp.com', 
      role: 'Sales Manager', 
      status: 'Pending' as const, 
      revenue: 175000, 
      change: 6.8, 
      joinDate: '2022-09-01', 
      performance: 82, 
      deals: 38, 
      satisfaction: 4.5,
      location: 'Miami, FL',
      phone: '+1 (555) 678-9012',
      lastActive: '4 hours ago',
      projects: 16,
      department: 'Sales'
    },
    { 
      id: 7, 
      name: 'Lucas Anderson', 
      email: 'lucas@techcorp.com', 
      role: 'Full Stack Developer', 
      status: 'Active' as const, 
      revenue: 110000, 
      change: 9.2, 
      joinDate: '2022-11-20', 
      performance: 76, 
      deals: 22, 
      satisfaction: 4.4,
      location: 'Denver, CO',
      phone: '+1 (555) 789-0123',
      lastActive: '45 minutes ago',
      projects: 14,
      department: 'Technology'
    },
    { 
      id: 8, 
      name: 'Ava Johnson', 
      email: 'ava@techcorp.com', 
      role: 'HR Manager', 
      status: 'Active' as const, 
      revenue: 98000, 
      change: -5.1, 
      joinDate: '2023-02-14', 
      performance: 71, 
      deals: 15, 
      satisfaction: 4.8,
      location: 'Chicago, IL',
      phone: '+1 (555) 890-1234',
      lastActive: '20 minutes ago',
      projects: 8,
      department: 'Human Resources'
    },
    { 
      id: 9, 
      name: 'Noah Williams', 
      email: 'noah@techcorp.com', 
      role: 'Backend Developer', 
      status: 'Active' as const, 
      revenue: 105000, 
      change: 11.8, 
      joinDate: '2023-04-05', 
      performance: 85, 
      deals: 26, 
      satisfaction: 4.6,
      location: 'Portland, OR',
      phone: '+1 (555) 901-2345',
      lastActive: '10 minutes ago',
      projects: 11,
      department: 'Technology'
    },
    { 
      id: 10, 
      name: 'Isabella Brown', 
      email: 'isabella@techcorp.com', 
      role: 'UI/UX Designer', 
      status: 'Inactive' as const, 
      revenue: 87000, 
      change: -2.3, 
      joinDate: '2023-07-18', 
      performance: 58, 
      deals: 12, 
      satisfaction: 4.1,
      location: 'Boston, MA',
      phone: '+1 (555) 012-3456',
      lastActive: '1 week ago',
      projects: 9,
      department: 'Design'
    },
  ];

  const [data, setData] = useState<TeamMember[]>(initialData);
  const [sortField, setSortField] = useState<keyof TeamMember | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    name: true,
    role: true,
    status: true,
    revenue: true,
    performance: true,
    change: true,
    satisfaction: true,
    actions: true
  });
  const itemsPerPage = 6;
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    name: '',
    role: '',
    status: '',
    department: '',
    revenue: { min: '', max: '' }
  });

  // Animation states
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [tableVisible, setTableVisible] = useState(false);

  // Unique values
  const uniqueRoles = [...new Set(data.map(item => item.role))];
  const uniqueStatuses = [...new Set(data.map(item => item.status))];
  const uniqueDepartments = [...new Set(data.map(item => item.department))];

  // Animate table on mount
  useEffect(() => {
    const timer = setTimeout(() => setTableVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Process data
  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase()) && 
          !item.email.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.role && item.role !== filters.role) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.department && item.department !== filters.department) return false;
      if (filters.revenue.min && item.revenue < parseInt(filters.revenue.min)) return false;
      if (filters.revenue.max && item.revenue > parseInt(filters.revenue.max)) return false;
      return true;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortField, sortDirection]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add animation when data changes
  useEffect(() => {
    const newAnimating = new Set(paginatedData.map(item => item.id));
    setAnimatingRows(newAnimating);
    const timer = setTimeout(() => setAnimatingRows(new Set()), 600);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      role: '',
      status: '',
      department: '',
      revenue: { min: '', max: '' }
    });
  };

  const hasActiveFilters = filters.name || filters.role || filters.status || filters.department || filters.revenue.min || filters.revenue.max;

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(item => item.id));
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const copyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'from-[#4997D0] to-cyan-500';
      case 'Inactive': return 'from-zinc-500 to-zinc-600';
      case 'Pending': return 'from-amber-500 to-orange-500';
      default: return 'from-zinc-500 to-zinc-600';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'from-emerald-500 to-green-500';
    if (performance >= 70) return 'from-[#4997D0] to-blue-500';
    if (performance >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-rose-500';
  };

  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id));
    setSelectedRows(selectedRows.filter(rowId => rowId !== id));
  };

  const formatLastActive = (lastActive: string) => {
    return lastActive;
  };

  return (
    <div className="min-h-screen bg-[#101010] p-8">
      {/* Animated background with your app's grid pattern */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#4997D0]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-[#4997D0]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
      </div>
      
      <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-white via-[#4997D0] to-cyan-400 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              Team Analytics
              <Sparkles className="text-[#4997D0] animate-pulse" size={32} />
            </h1>
            <p className="text-zinc-400 text-lg">Real-time performance tracking and insights</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Activity className="text-[#4997D0]" size={16} />
                <span className="text-zinc-400 text-sm">Avg Performance</span>
                <span className="text-white font-bold">{Math.round(data.reduce((sum, item) => sum + item.performance, 0) / data.length)}%</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-400" size={16} />
                <span className="text-zinc-400 text-sm">Active Now</span>
                <span className="text-white font-bold">{data.filter(d => d.status === 'Active').length}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Briefcase className="text-emerald-400" size={16} />
                <span className="text-zinc-400 text-sm">Total Revenue</span>
                <span className="text-white font-bold">${(data.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
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
              {processedData.length} results
            </span>
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#4997D0]">{selectedRows.length} selected</span>
                <button className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 size={14} />
                </button>
                <button className="px-2 py-1 bg-[#4997D0]/10 border border-[#4997D0]/20 rounded text-[#4997D0] hover:bg-[#4997D0]/20 transition-all">
                  <Download size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Column visibility toggle */}
            <div className="relative group">
              <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
                <Eye size={18} />
                <span>Columns</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {Object.entries(columnVisibility).map(([col, visible]) => (
                  <label key={col} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => setColumnVisibility({...columnVisibility, [col]: !visible})}
                      className="rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                    />
                    <span className="text-sm text-zinc-300 capitalize">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button className="px-5 py-2.5 bg-gradient-to-r from-[#4997D0] to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#4997D0]/30 transition-all transform hover:scale-105">
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                Add Member
              </span>
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="relative">
          {/* Glow effect using your accent color */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4997D0]/10 via-[#4997D0]/5 to-[#4997D0]/10 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800">
                    <th className="p-4 sticky left-0 bg-zinc-900 z-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                      />
                    </th>
                    
                    {columnVisibility.name && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('name')}
                          >
                            <User size={14} className="text-[#4997D0]" />
                            Member
                            {sortField === 'name' && (
                              <span className="text-[#4997D0]">
                                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={filters.name}
                              onChange={(e) => setFilters({...filters, name: e.target.value})}
                              className="w-full pl-7 pr-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 focus:shadow-lg focus:shadow-[#4997D0]/10 transition-all"
                            />
                          </div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.role && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('role')}
                          >
                            <Award size={14} className="text-purple-400" />
                            Role
                            {sortField === 'role' && (
                              <span className="text-[#4997D0]">
                                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                          <select
                            value={filters.role}
                            onChange={(e) => setFilters({...filters, role: e.target.value})}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">All Roles</option>
                            {uniqueRoles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                    )}

                    {columnVisibility.status && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={14} className="text-emerald-400" />
                            Status
                          </div>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">All Status</option>
                            {uniqueStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                    )}

                    {columnVisibility.revenue && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('revenue')}
                          >
                            <DollarSign size={14} className="text-yellow-400" />
                            Revenue
                            {sortField === 'revenue' && (
                              <span className="text-[#4997D0]">
                                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.revenue.min}
                              onChange={(e) => setFilters({...filters, revenue: {...filters.revenue, min: e.target.value}})}
                              className="w-20 px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.revenue.max}
                              onChange={(e) => setFilters({...filters, revenue: {...filters.revenue, max: e.target.value}})}
                              className="w-20 px-2 py-1.5 text-xs bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#4997D0]/50 focus:bg-zinc-800 transition-all"
                            />
                          </div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.performance && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div 
                            className="text-xs font-bold text-zinc-300 uppercase tracking-wider cursor-pointer hover:text-[#4997D0] transition-colors flex items-center gap-2"
                            onClick={() => handleSort('performance')}
                          >
                            <Target size={14} className="text-rose-400" />
                            Performance
                            {sortField === 'performance' && (
                              <span className="text-[#4997D0]">
                                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.change && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={14} className="text-blue-400" />
                            Trend
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.satisfaction && (
                      <th className="p-4 text-left">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Star size={14} className="text-amber-400" />
                            Rating
                          </div>
                          <div className="h-7"></div>
                        </div>
                      </th>
                    )}

                    {columnVisibility.actions && (
                      <th className="p-4 text-center">
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
                
                <tbody>
                  {paginatedData.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`
                          border-b border-zinc-800/30 transition-all duration-500
                          ${hoveredRow === item.id ? 'bg-gradient-to-r from-[#4997D0]/5 via-[#4997D0]/3 to-[#4997D0]/5' : ''}
                          ${selectedRows.includes(item.id) ? 'bg-[#4997D0]/5' : ''}
                          ${animatingRows.has(item.id) ? 'opacity-0 animate-fadeIn' : ''}
                          hover:shadow-lg hover:shadow-[#4997D0]/10 group cursor-pointer
                        `}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'forwards'
                        }}
                        onMouseEnter={() => setHoveredRow(item.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                      >
                        <td className="p-4 sticky left-0 bg-zinc-950/90 backdrop-blur z-10">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(item.id);
                            }}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#4997D0]"
                          />
                        </td>
                        
                        {columnVisibility.name && (
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4997D0] via-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-[#4997D0]/20">
                                  <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">
                                      {item.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                </div>
                                {item.status === 'Active' && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-zinc-950 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm group-hover:text-[#4997D0] transition-colors">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-zinc-500 text-xs">{item.email}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyEmail(item.email, item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    {copiedEmail === item.id ? (
                                      <Check size={14} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={14} className="text-zinc-500 hover:text-[#4997D0]" />
                                    )}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock size={12} className="text-zinc-600" />
                                  <span className="text-zinc-600 text-xs">{formatLastActive(item.lastActive)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {columnVisibility.role && (
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium">
                                {item.role}
                              </span>
                              <div className="text-zinc-600 text-xs">{item.department}</div>
                            </div>
                          </td>
                        )}

                        {columnVisibility.status && (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatusColor(item.status)} animate-pulse`}></div>
                              <span className={`text-xs font-medium ${
                                item.status === 'Active' ? 'text-[#4997D0]' :
                                item.status === 'Inactive' ? 'text-zinc-500' :
                                'text-amber-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.revenue && (
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm">
                                ${item.revenue.toLocaleString()}
                              </span>
                              <span className="text-zinc-600 text-xs">
                                {item.deals} deals • {item.projects} projects
                              </span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.performance && (
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[100px]">
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${getPerformanceColor(item.performance)} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${item.performance}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white min-w-[35px]">
                                {item.performance}%
                              </span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.change && (
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {item.change > 0 ? (
                                <>
                                  <ArrowUpRight size={16} className="text-emerald-400" />
                                  <span className="text-emerald-400 font-bold text-sm">+{item.change}%</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight size={16} className="text-red-400" />
                                  <span className="text-red-400 font-bold text-sm">{item.change}%</span>
                                </>
                              )}
                            </div>
                          </td>
                        )}

                        {columnVisibility.satisfaction && (
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-amber-400 fill-current" />
                              <span className="text-white font-medium text-sm">{item.satisfaction}</span>
                            </div>
                          </td>
                        )}

                        {columnVisibility.actions && (
                          <td className="p-4">
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
                                  // Handle edit action
                                }}
                                className="p-2 bg-zinc-800 hover:bg-amber-500/20 rounded-lg transition-all hover:text-amber-400"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                className="p-2 bg-zinc-800 hover:bg-red-500/20 rounded-lg transition-all hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Expandable Row */}
                      {expandedRow === item.id && (
                        <tr className="bg-zinc-900/50 border-b border-zinc-800/30">
                          <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="p-6">
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <User size={16} />
                                  Personal Details
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone size={14} className="text-zinc-500" />
                                    <span className="text-white">{item.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin size={14} className="text-zinc-500" />
                                    <span className="text-white">{item.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-zinc-500" />
                                    <span className="text-white">Joined {new Date(item.joinDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <BarChart3 size={16} />
                                  Performance Metrics
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Deals Closed</span>
                                    <span className="text-white font-medium">{item.deals}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Active Projects</span>
                                    <span className="text-white font-medium">{item.projects}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Satisfaction</span>
                                    <div className="flex items-center gap-1">
                                      <Star size={12} className="text-amber-400 fill-current" />
                                      <span className="text-white font-medium">{item.satisfaction}/5.0</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-[#4997D0] font-semibold text-sm flex items-center gap-2">
                                  <Activity size={16} />
                                  Activity Status
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Last Active</span>
                                    <span className="text-white font-medium">{item.lastActive}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Department</span>
                                    <span className="text-white font-medium">{item.department}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Growth Rate</span>
                                    <span className={`font-medium ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {item.change > 0 ? '+' : ''}{item.change}%
                                    </span>
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
            <div className="flex items-center justify-between p-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdvancedTable;
