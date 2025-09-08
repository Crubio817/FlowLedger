/**
 * Billing & Contracts API Client for FlowLedger
 * Production-ready implementation with comprehensive financial management capabilities
 */

import { BILLING_API } from '../config.ts';
import { toast } from '../lib/toast.ts';

// =====================================================
// CORE TYPES & INTERFACES
// =====================================================

export interface Contract {
  contract_id: number;
  org_id: number;
  client_id: number;
  contract_type: 'time_materials' | 'fixed_price' | 'milestone' | 'retainer' | 'prepaid';
  title: string;
  description?: string;
  currency: string;
  total_value: number;
  billed_value: number;
  remaining_value: number;
  start_date: string;
  end_date?: string;
  actual_end_date?: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'one_time';
  payment_terms: string;
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  time_entry_id: number;
  org_id: number;
  contract_id: number;
  assignment_id: number;
  user_id: number;
  date: string;
  hours: number;
  description: string;
  billable_rate: number;
  total_amount: number;
  is_billable: boolean;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'billed';
  approved_by?: number;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  invoice_id: number;
  org_id: number;
  contract_id: number;
  client_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  payment_id: number;
  org_id: number;
  invoice_id: number;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'wire_transfer' | 'other';
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingStatistics {
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  avgPaymentTime: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  contractsHealthCounts: {
    green: number;
    yellow: number;
    red: number;
  };
}

export interface InvoiceLineItem {
  line_item_id: number;
  invoice_id: number;
  time_entry_id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

// Request/Response Types
export interface CreateContractRequest {
  org_id: number;
  client_id: number;
  contract_type: Contract['contract_type'];
  title: string;
  description?: string;
  currency: string;
  total_value: number;
  start_date: string;
  end_date?: string;
  billing_cycle: Contract['billing_cycle'];
  payment_terms: string;
}

export interface CreateTimeEntryRequest {
  org_id: number;
  contract_id: number;
  assignment_id: number;
  date: string;
  hours: number;
  description: string;
  billable_rate: number;
  is_billable: boolean;
}

export interface GenerateInvoiceRequest {
  org_id: number;
  contract_id: number;
  time_entry_ids: number[];
  invoice_date: string;
  due_date: string;
  notes?: string;
}

export interface CreatePaymentRequest {
  org_id: number;
  invoice_id: number;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: Payment['payment_method'];
  reference_number?: string;
  notes?: string;
}

export interface ContractFilters {
  org_id?: number;
  client_id?: number;
  status?: Contract['status'];
  contract_type?: Contract['contract_type'];
  search?: string;
}

export interface TimeEntryFilters {
  org_id?: number;
  contract_id?: number;
  user_id?: number;
  status?: TimeEntry['status'];
  date_from?: string;
  date_to?: string;
  is_billable?: boolean;
}

export interface InvoiceFilters {
  org_id?: number;
  contract_id?: number;
  client_id?: number;
  status?: Invoice['status'];
  date_from?: string;
  date_to?: string;
}

export interface PaymentFilters {
  org_id?: number;
  invoice_id?: number;
  date_from?: string;
  date_to?: string;
  payment_method?: Payment['payment_method'];
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContractsResponse extends ApiResponse<Contract[]> {}
export interface TimeEntriesResponse extends ApiResponse<TimeEntry[]> {}
export interface InvoicesResponse extends ApiResponse<Invoice[]> {}
export interface PaymentsResponse extends ApiResponse<Payment[]> {}

// =====================================================
// LOCAL ERROR HANDLING
// =====================================================

function withErrors<T>(fn: () => Promise<T>, errMsg = 'Billing operation failed'): Promise<T> {
  return fn().catch((e: any) => {
    const message = e.response?.data?.error?.message || e.message || errMsg;
    toast.error(`Billing Error: ${message}`);
    throw e;
  });
}

// =====================================================
// BILLING API CLIENT
// =====================================================

export class BillingApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BILLING_API.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // =====================================================
  // CONTRACT MANAGEMENT
  // =====================================================

  async getContracts(filters: ContractFilters & { page?: number; limit?: number } = {}): Promise<ContractsResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<ContractsResponse>(`/contracts?${params.toString()}`);
    }, 'Failed to load contracts');
  }

  async getContract(contractId: number, orgId?: number): Promise<ApiResponse<Contract>> {
    return withErrors(async () => {
      const params = orgId ? `?org_id=${orgId}` : '';
      return this.fetch<ApiResponse<Contract>>(`/contracts/${contractId}${params}`);
    }, 'Failed to load contract');
  }

  async createContract(data: CreateContractRequest): Promise<ApiResponse<Contract>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Contract>>('/contracts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to create contract');
  }

  async updateContract(contractId: number, data: Partial<Contract>): Promise<ApiResponse<Contract>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Contract>>(`/contracts/${contractId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }, 'Failed to update contract');
  }

  async deleteContract(contractId: number, orgId?: number): Promise<{ success: boolean }> {
    return withErrors(async () => {
      const params = orgId ? `?org_id=${orgId}` : '';
      await this.fetch(`/contracts/${contractId}${params}`, {
        method: 'DELETE',
      });
      return { success: true };
    }, 'Failed to delete contract');
  }

  // =====================================================
  // TIME ENTRY MANAGEMENT
  // =====================================================

  async getTimeEntries(filters: TimeEntryFilters & { page?: number; limit?: number } = {}): Promise<TimeEntriesResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<TimeEntriesResponse>(`/time-entries?${params.toString()}`);
    }, 'Failed to load time entries');
  }

  async createTimeEntry(data: CreateTimeEntryRequest): Promise<ApiResponse<TimeEntry>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<TimeEntry>>('/time-entries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to create time entry');
  }

  async updateTimeEntry(timeEntryId: number, data: Partial<TimeEntry>): Promise<ApiResponse<TimeEntry>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<TimeEntry>>(`/time-entries/${timeEntryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }, 'Failed to update time entry');
  }

  async approveTimeEntries(data: { org_id: number; time_entry_ids: number[]; approved_by: number }): Promise<{ success: boolean; approved_count: number }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; approved_count: number }>('/time-entries/approve', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to approve time entries');
  }

  async rejectTimeEntry(timeEntryId: number, data: { rejected_reason: string; rejected_by: number }): Promise<ApiResponse<TimeEntry>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<TimeEntry>>(`/time-entries/${timeEntryId}/reject`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to reject time entry');
  }

  // =====================================================
  // INVOICE MANAGEMENT
  // =====================================================

  async getInvoices(filters: InvoiceFilters & { page?: number; limit?: number } = {}): Promise<InvoicesResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<InvoicesResponse>(`/invoices?${params.toString()}`);
    }, 'Failed to load invoices');
  }

  async getInvoice(invoiceId: number, orgId?: number): Promise<ApiResponse<Invoice & { line_items: InvoiceLineItem[] }>> {
    return withErrors(async () => {
      const params = orgId ? `?org_id=${orgId}` : '';
      return this.fetch<ApiResponse<Invoice & { line_items: InvoiceLineItem[] }>>(`/invoices/${invoiceId}${params}`);
    }, 'Failed to load invoice');
  }

  async generateInvoice(data: GenerateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Invoice>>('/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to generate invoice');
  }

  async sendInvoice(invoiceId: number, data: { email_recipients: string[]; email_subject: string; email_body: string }): Promise<{ success: boolean }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean }>(`/invoices/${invoiceId}/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to send invoice');
  }

  async markInvoiceAsPaid(invoiceId: number, data: { payment_date: string; payment_method: string; reference_number?: string }): Promise<ApiResponse<Invoice>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to mark invoice as paid');
  }

  // =====================================================
  // PAYMENT MANAGEMENT
  // =====================================================

  async getPayments(filters: PaymentFilters & { page?: number; limit?: number } = {}): Promise<PaymentsResponse> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      return this.fetch<PaymentsResponse>(`/payments?${params.toString()}`);
    }, 'Failed to load payments');
  }

  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Payment>>('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to create payment');
  }

  async refundPayment(paymentId: number, data: { amount: number; reason: string }): Promise<ApiResponse<Payment>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 'Failed to process refund');
  }

  // =====================================================
  // REPORTING & ANALYTICS
  // =====================================================

  async getBillingStatistics(orgId: number, dateRange?: { from: string; to: string }): Promise<ApiResponse<BillingStatistics>> {
    return withErrors(async () => {
      const params = new URLSearchParams({ org_id: String(orgId) });
      if (dateRange) {
        params.append('from', dateRange.from);
        params.append('to', dateRange.to);
      }

      return this.fetch<ApiResponse<BillingStatistics>>(`/billing/stats?${params.toString()}`);
    }, 'Failed to load billing statistics');
  }

  async getRevenueReport(orgId: number, period: 'monthly' | 'quarterly' | 'yearly', year: number): Promise<ApiResponse<any[]>> {
    return withErrors(async () => {
      const params = new URLSearchParams({
        org_id: String(orgId),
        period,
        year: String(year),
      });

      return this.fetch<ApiResponse<any[]>>(`/billing/revenue-report?${params.toString()}`);
    }, 'Failed to load revenue report');
  }

  async getCollectionsReport(orgId: number): Promise<ApiResponse<any[]>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<any[]>>(`/billing/collections?org_id=${orgId}`);
    }, 'Failed to load collections report');
  }

  // =====================================================
  // CURRENCY & EXCHANGE RATES
  // =====================================================

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ApiResponse<ExchangeRate[]>> {
    return withErrors(async () => {
      return this.fetch<ApiResponse<ExchangeRate[]>>(`/billing/exchange-rates?base=${baseCurrency}`);
    }, 'Failed to load exchange rates');
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<ApiResponse<{ amount: number; rate: number }>> {
    return withErrors(async () => {
      const params = new URLSearchParams({
        amount: String(amount),
        from: fromCurrency,
        to: toCurrency,
      });

      return this.fetch<ApiResponse<{ amount: number; rate: number }>>(`/billing/convert?${params.toString()}`);
    }, 'Failed to convert currency');
  }

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  async bulkApproveTimeEntries(orgId: number, timeEntryIds: number[], approvedBy: number): Promise<{ success: boolean; approved_count: number }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; approved_count: number }>('/time-entries/bulk-approve', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          time_entry_ids: timeEntryIds,
          approved_by: approvedBy,
        }),
      });
    }, 'Failed to bulk approve time entries');
  }

  async bulkGenerateInvoices(orgId: number, contractIds: number[], invoiceDate: string): Promise<{ success: boolean; invoice_ids: number[] }> {
    return withErrors(async () => {
      return this.fetch<{ success: boolean; invoice_ids: number[] }>('/invoices/bulk-generate', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          contract_ids: contractIds,
          invoice_date: invoiceDate,
        }),
      });
    }, 'Failed to bulk generate invoices');
  }

  // =====================================================
  // REAL-TIME UPDATES
  // =====================================================

  createWebSocketConnection(orgId: number, onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(`${BILLING_API.WEBSOCKET}?org_id=${orgId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type.startsWith('billing.')) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Real-time connection error');
    };

    return ws;
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const billingApiClient = new BillingApiClient();
export default billingApiClient;

// Helper functions for common operations
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateProgress = (billed: number, total: number): number => {
  return total > 0 ? Math.round((billed / total) * 100) : 0;
};

export const getContractHealth = (contract: Contract): 'green' | 'yellow' | 'red' => {
  const progress = calculateProgress(contract.billed_value, contract.total_value);
  const now = new Date();
  const endDate = contract.end_date ? new Date(contract.end_date) : null;
  
  if (contract.status === 'cancelled' || (endDate && endDate < now && progress < 100)) {
    return 'red';
  }
  
  if (progress > 90 || (endDate && (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30)) {
    return 'yellow';
  }
  
  return 'green';
};

export const getInvoiceStatus = (invoice: Invoice): { status: string; color: string } => {
  const now = new Date();
  const dueDate = new Date(invoice.due_date);
  
  if (invoice.status === 'paid') {
    return { status: 'Paid', color: 'text-green-600' };
  }
  
  if (invoice.status === 'cancelled') {
    return { status: 'Cancelled', color: 'text-gray-600' };
  }
  
  if (dueDate < now && invoice.balance_due > 0) {
    return { status: 'Overdue', color: 'text-red-600' };
  }
  
  if (invoice.status === 'sent') {
    return { status: 'Sent', color: 'text-blue-600' };
  }
  
  return { status: 'Draft', color: 'text-gray-600' };
};
