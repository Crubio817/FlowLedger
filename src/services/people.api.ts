/**
 * People Module API Client - Production Ready
 * Provides comprehensive staffing and resource management with AI recommendations
 */

import { toast } from '../lib/toast.ts';
import { PEOPLE_API, ORG_CONFIG } from '../config.ts';

// Error handling wrapper
function withErrors<T>(fn: () => Promise<T>, errMsg = 'Request failed'): Promise<T> {
  return fn().catch((e: any) => {
    let msg = errMsg;
    try {
      if (e && typeof e === 'object') {
        if (typeof e.code === 'number' && typeof e.message === 'string') {
          const raw = e.message;
          try {
            const parsed = JSON.parse(raw);
            e.parsed = parsed;
            if (parsed?.error?.message) msg = String(parsed.error.message);
            else if (parsed?.message) msg = String(parsed.message);
            else msg = raw;
          } catch {
            msg = String(e.message || errMsg);
          }
        } else if (e.message) {
          msg = String(e.message);
        }
      }
    } catch {
      // fallback
    }
    toast.error(msg);
    throw e;
  });
}

// Core Types
export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  department: string;
  level: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  location: string;
  timezone: string;
  startDate: string;
  totalExperience: number;
  skills: PersonSkill[];
  certifications: string[];
  hourlyRate: number;
  availability: number; // 0-100 percentage
  utilizationRate: number; // 0-100 percentage
  avatar?: string;
}

export interface PersonSkill {
  name: string;
  category: 'Technical' | 'Domain' | 'Soft Skills';
  proficiency: number; // 1-5 scale
  confidence: number; // 0-100 percentage
  lastUsed: string;
  yearsExperience: number;
}

export interface StaffingRequest {
  id: number;
  title: string;
  description: string;
  requiredSkills: RequiredSkill[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: {
    start: string;
    end: string;
    hoursPerWeek: number;
  };
  location: string;
  remote: boolean;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Active' | 'Filled' | 'Cancelled';
  createdAt: string;
  createdBy: number;
}

export interface RequiredSkill {
  name: string;
  category: string;
  minimumProficiency: number;
  weight: number; // Importance weight for ranking
  required: boolean;
}

export interface PersonFit {
  personId: number;
  person: Person;
  fitScore: number; // 0-100 overall match score
  confidence: number; // 0-100 confidence in the fit
  reasoning: FitReason[];
  ratePreview?: RateBreakdown;
  availability: {
    canStart: string;
    conflictingAssignments: Assignment[];
    availableHours: number;
  };
}

export interface FitReason {
  type: 'skill_match' | 'experience' | 'availability' | 'location' | 'rate' | 'certification';
  score: number; // Contribution to overall fit score
  explanation: string;
  details?: Record<string, any>;
}

export interface RateBreakdown {
  personId: number;
  baseRate: number;
  premiums: RatePremium[];
  adjustments: RateAdjustment[];
  finalRate: number;
  currency: string;
  effectiveDate: string;
  validUntil: string;
  confidence: number; // 0-100 confidence in rate accuracy
}

export interface RatePremium {
  type: 'skill_premium' | 'urgency_premium' | 'location_premium' | 'experience_premium';
  amount: number;
  percentage?: number;
  reason: string;
  details?: Record<string, any>;
}

export interface RateAdjustment {
  type: 'discount' | 'surcharge' | 'negotiated';
  amount: number;
  percentage?: number;
  reason: string;
  approvedBy?: number;
}

export interface Assignment {
  id: number;
  personId: number;
  projectName: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  status: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
}

export interface AvailabilityDay {
  date: string;
  availableHours: number;
  scheduledHours: number;
  conflicts: Assignment[];
  utilizationPercentage: number;
}

// Filters and Search
export interface PeopleFilters {
  orgId?: string;
  skills?: string[];
  departments?: string[];
  levels?: string[];
  locations?: string[];
  availability?: {
    minPercentage: number;
    startDate?: string;
    endDate?: string;
  };
  experience?: {
    min: number;
    max: number;
  };
  rate?: {
    min: number;
    max: number;
  };
  status?: ('Active' | 'Inactive' | 'On Leave')[];
  search?: string;
}

export interface CandidateFilters extends PeopleFilters {
  includeRatePreview?: boolean;
  maxResults?: number;
  sortBy?: 'fitScore' | 'rate' | 'availability' | 'experience';
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface PeopleApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
  errors?: string[];
}

// API Client Class
export class PeopleApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  // People Directory
  async getPeople(filters?: PeopleFilters): Promise<Person[]> {
    return withErrors(async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/people?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch people: ${response.statusText}`);
      }

      const result: PeopleApiResponse<Person[]> = await response.json();
      return result.data;
    }, 'Failed to load people directory');
  }

  async getPerson(personId: number): Promise<Person> {
    return withErrors(async () => {
      const response = await fetch(`${this.baseUrl}/people/${personId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch person: ${response.statusText}`);
      }

      const result: PeopleApiResponse<Person> = await response.json();
      return result.data;
    }, 'Failed to load person details');
  }

  // Candidate Ranking
  async rankCandidates(requestId: number, filters?: CandidateFilters): Promise<PersonFit[]> {
    return withErrors(async () => {
      const response = await fetch(`${this.baseUrl}/staffing-requests/${requestId}/rank`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(filters || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to rank candidates: ${response.statusText}`);
      }

      const result: PeopleApiResponse<PersonFit[]> = await response.json();
      return result.data;
    }, 'Failed to rank candidates');
  }

  // Rate Management
  async getRateBreakdown(personId: number, requestId?: number): Promise<RateBreakdown> {
    return withErrors(async () => {
      const url = requestId 
        ? `${this.baseUrl}/people/${personId}/rate-breakdown?requestId=${requestId}`
        : `${this.baseUrl}/people/${personId}/rate-breakdown`;

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get rate breakdown: ${response.statusText}`);
      }

      const result: PeopleApiResponse<RateBreakdown> = await response.json();
      return result.data;
    }, 'Failed to load rate breakdown');
  }

  // Availability
  async getAvailability(personId: number, startDate: string, endDate: string): Promise<AvailabilityDay[]> {
    return withErrors(async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(`${this.baseUrl}/people/${personId}/availability?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get availability: ${response.statusText}`);
      }

      const result: PeopleApiResponse<AvailabilityDay[]> = await response.json();
      return result.data;
    }, 'Failed to load availability');
  }

  // Skills Management
  async updatePersonSkills(personId: number, skills: PersonSkill[]): Promise<void> {
    return withErrors(async () => {
      const response = await fetch(`${this.baseUrl}/people/${personId}/skills`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ skills }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update skills: ${response.statusText}`);
      }
    }, 'Failed to update person skills');
  }

  // Assignments
  async getPersonAssignments(personId: number): Promise<Assignment[]> {
    return withErrors(async () => {
      const response = await fetch(`${this.baseUrl}/people/${personId}/assignments`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get assignments: ${response.statusText}`);
      }

      const result: PeopleApiResponse<Assignment[]> = await response.json();
      return result.data;
    }, 'Failed to load assignments');
  }

  // Staffing Requests
  async createStaffingRequest(request: Omit<StaffingRequest, 'id' | 'createdAt' | 'createdBy'>): Promise<StaffingRequest> {
    return withErrors(async () => {
      const response = await fetch(`${this.baseUrl}/staffing-requests`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to create staffing request: ${response.statusText}`);
      }

      const result: PeopleApiResponse<StaffingRequest> = await response.json();
      return result.data;
    }, 'Failed to create staffing request');
  }

  // Utility methods
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}

// Default instance for convenience - Production Ready
export const peopleApi = new PeopleApiClient({
  baseUrl: PEOPLE_API.PEOPLE.replace('/people', ''), // Get base URL without endpoint
  apiKey: localStorage.getItem('auth_token') || undefined,
});

// Convenience functions with org_id support
export const getPeople = (filters?: PeopleFilters) => 
  peopleApi.getPeople({ ...filters, orgId: ORG_CONFIG.orgId });

export const getPerson = (personId: number) => 
  peopleApi.getPerson(personId);

export const rankCandidates = (requestId: number, filters?: CandidateFilters) => 
  peopleApi.rankCandidates(requestId, { ...filters, orgId: ORG_CONFIG.orgId });

export const getRateBreakdown = (personId: number, requestId?: number) => 
  peopleApi.getRateBreakdown(personId, requestId);

export const getAvailability = (personId: number, startDate: string, endDate: string) => 
  peopleApi.getAvailability(personId, startDate, endDate);
