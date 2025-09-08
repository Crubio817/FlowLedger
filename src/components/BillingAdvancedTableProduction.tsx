/**
 * Billing & Contracts Module - Production Implementation
 * Comprehensive financial management dashboard for FlowLedger
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Plus,
  Download,
  Send,
  CreditCard,
  BarChart3,
  Activity,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

import {
  billingApiClient,
  Contract,
  TimeEntry,
  Invoice,
  Payment,
  BillingStatistics,
  ContractFilters,
  TimeEntryFilters,
  InvoiceFilters,
  PaymentFilters,
  formatCurrency,
  getContractHealth,
  getInvoiceStatus
} from '../services/billing.api.ts';

import { Badge } from '../ui/badge.js';
import KpiCard from './KpiCard.tsx';
import { Loading } from './Loading.tsx';
import { EmptyState } from './EmptyState.tsx';
import RealTimeIndicators from './RealTimeIndicators.tsx';

// =====================================================
// TYPES & INTERFACES
// =====================================================

interface BillingManagerProps {
  orgId: number;
  userRole?: 'admin' | 'manager' | 'user';
  currency?: string;
  onContractSelect?: (contract: Contract) => void;
  onInvoiceGenerated?: (invoice: Invoice) => void;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
}

type TabType = 'contracts' | 'time-entries' | 'invoices' | 'payments' | 'reports';

// =====================================================
// MAIN BILLING MANAGER COMPONENT
// =====================================================

const BillingAdvancedTableProduction: React.FC<BillingManagerProps> = ({
  orgId,
  userRole = 'user',
  currency = 'USD',
  onContractSelect,
  onInvoiceGenerated
}) => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const [activeTab, setActiveTab] = useState<TabType>('contracts');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<BillingStatistics | null>(null);
  
  // Data states
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Filter states
  const [contractFilters, setContractFilters] = useState<ContractFilters>({ org_id: orgId });
  const [timeEntryFilters, setTimeEntryFilters] = useState<TimeEntryFilters>({ org_id: orgId });
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceFilters>({ org_id: orgId });
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>({ org_id: orgId });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Real-time state
  const [isConnected, setIsConnected] = useState(false);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const loadStatistics = async () => {
    try {
      const response = await billingApiClient.getBillingStatistics(orgId);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await billingApiClient.getContracts({
        ...contractFilters,
        page: currentPage,
        limit: pageSize
      });
      setContracts(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const response = await billingApiClient.getTimeEntries({
        ...timeEntryFilters,
        page: currentPage,
        limit: pageSize
      });
      setTimeEntries(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await billingApiClient.getInvoices({
        ...invoiceFilters,
        page: currentPage,
        limit: pageSize
      });
      setInvoices(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await billingApiClient.getPayments({
        ...paymentFilters,
        page: currentPage,
        limit: pageSize
      });
      setPayments(response.data);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TABLE CONFIGURATIONS
  // =====================================================

  const contractColumns: TableColumn[] = [
    {
      key: 'title',
      label: 'Contract',
      sortable: true,
      render: (value, contract) => (
        <div>
          <div className="font-medium text-slate-200">{contract.title}</div>
          <div className="text-sm text-slate-400">{contract.contract_type.replace('_', ' ')}</div>
        </div>
      )
    },
    {
      key: 'client_id',
      label: 'Client',
      render: (value) => (
        <div className="text-slate-300">Client #{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, contract) => {
        const health = getContractHealth(contract);
        const healthConfig = {
          green: { color: 'bg-green-500', variant: 'success' as const },
          yellow: { color: 'bg-yellow-500', variant: 'muted' as const },
          red: { color: 'bg-red-500', variant: 'muted' as const }
        };
        const config = healthConfig[health];
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
            <Badge variant={config.variant} className="capitalize">
              {value.replace('_', ' ')}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'total_value',
      label: 'Value',
      sortable: true,
      render: (value, contract) => (
        <div>
          <div className="font-medium text-slate-200">{formatCurrency(value, contract.currency)}</div>
          <div className="text-sm text-slate-400">
            {formatCurrency(contract.billed_value, contract.currency)} billed
          </div>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (value, contract) => {
        const progress = Math.round((contract.billed_value / contract.total_value) * 100);
        return (
          <div className="w-full">
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, contract) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewContract(contract)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditContract(contract)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Edit contract"
          >
            <Edit className="h-4 w-4" />
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => handleDeleteContract(contract)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete contract"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const timeEntryColumns: TableColumn[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'contract_id',
      label: 'Contract',
      render: (value) => `Contract #${value}`
    },
    {
      key: 'hours',
      label: 'Hours',
      sortable: true,
      render: (value) => `${value}h`
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate text-slate-300" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig: Record<string, { variant: 'muted' | 'success'; color: string }> = {
          draft: { variant: 'muted' as const, color: 'text-gray-400' },
          pending_approval: { variant: 'muted' as const, color: 'text-yellow-400' },
          approved: { variant: 'success' as const, color: 'text-green-400' },
          rejected: { variant: 'muted' as const, color: 'text-red-400' },
          billed: { variant: 'success' as const, color: 'text-blue-400' }
        };
        const config = statusConfig[value] || statusConfig.draft;
        
        return (
          <Badge variant={config.variant} className={`capitalize ${config.color}`}>
            {value.replace('_', ' ')}
          </Badge>
        );
      }
    }
  ];

  const invoiceColumns: TableColumn[] = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      sortable: true,
      render: (value) => (
        <div className="font-mono text-slate-200">{value}</div>
      )
    },
    {
      key: 'client_id',
      label: 'Client',
      render: (value) => `Client #${value}`
    },
    {
      key: 'invoice_date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'due_date',
      label: 'Due Date',
      sortable: true,
      render: (value, invoice) => {
        const dueDate = new Date(value);
        const isOverdue = dueDate < new Date() && invoice.balance_due > 0;
        return (
          <div className={isOverdue ? 'text-red-400' : 'text-slate-300'}>
            {dueDate.toLocaleDateString()}
          </div>
        );
      }
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (value, invoice) => formatCurrency(value, invoice.currency)
    },
    {
      key: 'balance_due',
      label: 'Balance',
      sortable: true,
      render: (value, invoice) => (
        <div className={value > 0 ? 'text-red-400' : 'text-green-400'}>
          {formatCurrency(value, invoice.currency)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, invoice) => {
        const { status, color } = getInvoiceStatus(invoice);
        return (
          <Badge variant={status === 'Paid' ? 'success' : 'muted'} className={color}>
            {status}
          </Badge>
        );
      }
    }
  ];

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedItem(null);
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedItem(contract);
    onContractSelect?.(contract);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedItem(contract);
    setShowEditModal(true);
  };

  const handleDeleteContract = async (contract: Contract) => {
    if (confirm(`Are you sure you want to delete "${contract.title}"?`)) {
      try {
        await billingApiClient.deleteContract(contract.contract_id, orgId);
        loadContracts();
      } catch (error) {
        console.error('Failed to delete contract:', error);
      }
    }
  };

  const handleCreateContract = () => {
    setSelectedItem(null);
    setShowCreateModal(true);
  };

  const handleGenerateInvoice = async (contractId: number) => {
    try {
      const timeEntriesResponse = await billingApiClient.getTimeEntries({
        org_id: orgId,
        contract_id: contractId,
        status: 'approved'
      });

      if (timeEntriesResponse.data.length === 0) {
        alert('No approved time entries found for this contract');
        return;
      }

      const invoice = await billingApiClient.generateInvoice({
        org_id: orgId,
        contract_id: contractId,
        time_entry_ids: timeEntriesResponse.data.map(te => te.time_entry_id),
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      onInvoiceGenerated?.(invoice.data);
      loadInvoices();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    loadStatistics();
    
    // Set up WebSocket connection for real-time updates
    let ws: WebSocket | null = null;
    try {
      ws = billingApiClient.createWebSocketConnection(orgId, (data) => {
        console.log('Billing update:', data);
        // Reload data when updates come in
        if (data.type === 'billing.contract.updated') {
          loadContracts();
        } else if (data.type === 'billing.invoice.created') {
          loadInvoices();
        } else if (data.type === 'billing.payment.received') {
          loadPayments();
        }
        loadStatistics();
      });

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [orgId]);

  useEffect(() => {
    switch (activeTab) {
      case 'contracts':
        loadContracts();
        break;
      case 'time-entries':
        loadTimeEntries();
        break;
      case 'invoices':
        loadInvoices();
        break;
      case 'payments':
        loadPayments();
        break;
    }
  }, [activeTab, currentPage, pageSize, contractFilters, timeEntryFilters, invoiceFilters, paymentFilters]);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'contracts':
        return contracts;
      case 'time-entries':
        return timeEntries;
      case 'invoices':
        return invoices;
      case 'payments':
        return payments;
      default:
        return [];
    }
  }, [activeTab, contracts, timeEntries, invoices, payments]);

  const currentColumns = useMemo(() => {
    switch (activeTab) {
      case 'contracts':
        return contractColumns;
      case 'time-entries':
        return timeEntryColumns;
      case 'invoices':
        return invoiceColumns;
      case 'payments':
        return []; // Will implement payment columns
      default:
        return [];
    }
  }, [activeTab]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (!statistics && loading) {
    return <Loading label="Loading billing dashboard..." />;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Billing & Contracts</h1>
          <p className="text-slate-400 mt-1">Manage contracts, time tracking, invoicing, and payments</p>
        </div>

        <div className="flex items-center gap-4">
          <RealTimeIndicators className="ml-4" />
          
          <button
            onClick={handleCreateContract}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </button>
        </div>
      </div>

      {/* Statistics KPI Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(statistics.totalRevenue, currency)}
            icon={<DollarSign className="h-5 w-5" />}
            deltaPct={((statistics.revenueThisMonth - statistics.revenueLastMonth) / statistics.revenueLastMonth) * 100}
          />
          <KpiCard
            title="Active Contracts"
            value={statistics.activeContracts}
            icon={<FileText className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Pending Invoices"
            value={statistics.pendingInvoices}
            icon={<Clock className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Overdue"
            value={statistics.overdueInvoices}
            icon={<AlertCircle className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="This Month"
            value={formatCurrency(statistics.revenueThisMonth, currency)}
            icon={<TrendingUp className="h-5 w-5" />}
            deltaPct={0}
          />
          <KpiCard
            title="Avg Payment Time"
            value={`${statistics.avgPaymentTime} days`}
            icon={<Activity className="h-5 w-5" />}
            deltaPct={0}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-8">
          {[
            { id: 'contracts', label: 'Contracts', icon: FileText },
            { id: 'time-entries', label: 'Time Entries', icon: Clock },
            { id: 'invoices', label: 'Invoices', icon: DollarSign },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {currentData.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.replace('-', ' ')} found`}
          message={`Get started by creating your first ${activeTab.replace('-', ' ')}`}
          action={
            <button 
              onClick={handleCreateContract}
              className="btn btn-primary"
            >
              Create {activeTab === 'contracts' ? 'Contract' : 'Entry'}
            </button>
          }
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-medium text-slate-200 capitalize">
              {activeTab.replace('-', ' ')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  {currentColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentData.map((item: any) => (
                  <tr key={item[Object.keys(item)[0]]} className="hover:bg-slate-900/50">
                    {currentColumns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm text-slate-300">
                        {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Create New Contract</h2>
            <p className="text-slate-400">Contract creation form would go here</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button className="btn btn-primary flex-1">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingAdvancedTableProduction;
