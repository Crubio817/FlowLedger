/**
 * React hooks for Communication Hub enhanced features
 * Provides WebSocket integration, file uploads, search, and templates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { wsClient } from '../services/websocket.js';
import {
  initializeFileUpload,
  uploadFileChunk,
  getUploadStatus,
  searchCommunications,
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  applyEmailTemplate,
  type FileUploadSession,
  type SearchResult,
  type SearchOptions,
  type EmailTemplate,
  type TemplateVariable
} from '../services/api.js';
import { toast } from '../lib/toast.js';

// ================================
// WEBSOCKET HOOKS
// ================================

export interface WebSocketConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  isConnected: boolean;
}

/**
 * Hook for managing WebSocket connection
 */
export const useWebSocketConnection = (principalId?: number, orgId?: number) => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>({
    status: 'disconnected',
    isConnected: false
  });

  useEffect(() => {
    if (!principalId || !orgId) return;

    // Set up connection status listener
    const handleConnectionStatus = (status: string) => {
      setConnectionStatus({
        status: status as any,
        isConnected: status === 'connected'
      });
    };

    wsClient.on('connection_status', handleConnectionStatus);

    // Connect
    wsClient.connect(principalId, orgId).catch((error: any) => {
      console.error('Failed to connect to WebSocket:', error);
      toast.error('Failed to connect to real-time updates');
    });

    return () => {
      wsClient.off('connection_status', handleConnectionStatus);
      wsClient.disconnect();
    };
  }, [principalId, orgId]);

  const subscribe = useCallback((subscriptionType: string, resourceId?: number) => {
    wsClient.subscribe(subscriptionType, resourceId);
  }, []);

  const unsubscribe = useCallback((subscriptionType: string, resourceId?: number) => {
    wsClient.unsubscribe(subscriptionType, resourceId);
  }, []);

  return {
    connectionStatus,
    subscribe,
    unsubscribe,
    wsClient
  };
};

/**
 * Hook for listening to real-time updates
 */
export const useRealTimeUpdates = () => {
  const [newMessages, setNewMessages] = useState<any[]>([]);
  const [threadUpdates, setThreadUpdates] = useState<any[]>([]);

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      setNewMessages(prev => [...prev, message]);
      toast(`New message in ${message.thread_subject}`, {
        icon: '💬',
        duration: 4000,
      });
    };

    const handleThreadUpdate = (thread: any) => {
      setThreadUpdates(prev => [...prev, thread]);
      toast.success(`Thread "${thread.subject}" updated`);
    };

    wsClient.on('new_message', handleNewMessage);
    wsClient.on('thread_updated', handleThreadUpdate);

    return () => {
      wsClient.off('new_message', handleNewMessage);
      wsClient.off('thread_updated', handleThreadUpdate);
    };
  }, []);

  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  const clearThreadUpdates = useCallback(() => {
    setThreadUpdates([]);
  }, []);

  return {
    newMessages,
    threadUpdates,
    clearNewMessages,
    clearThreadUpdates
  };
};

// ================================
// FILE UPLOAD HOOKS
// ================================

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  session: FileUploadSession | null;
  completedUrl: string | null;
}

/**
 * Hook for handling file uploads with resumable support
 */
export const useFileUpload = (threadId?: number, principalId?: number, orgId?: number) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    session: null,
    completedUrl: null
  });

  const uploadFile = useCallback(async (file: File) => {
    if (!principalId || !orgId) {
      setUploadState(prev => ({ ...prev, error: 'Principal ID and Org ID are required' }));
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      session: null,
      completedUrl: null
    });

    try {
      // Initialize upload session
      const session = await initializeFileUpload(
        file.name,
        file.type,
        file.size,
        threadId,
        principalId,
        orgId
      );

      setUploadState(prev => ({ ...prev, session }));

      // Split file into chunks and upload
      const chunkSize = session.chunk_size;
      const totalChunks = Math.ceil(file.size / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Convert chunk to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:mime/type;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(chunk);
        });

        // Upload chunk
        await uploadFileChunk(session.session_id, i, base64Data);

        // Update progress
        const progress = ((i + 1) / totalChunks) * 100;
        setUploadState(prev => ({ ...prev, progress }));
      }

      // Get final status
      const finalSession = await getUploadStatus(session.session_id);
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        session: finalSession,
        completedUrl: finalSession.blob_url || null
      }));

      toast.success(`File "${file.name}" uploaded successfully`);
      return finalSession;

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message || 'Upload failed'
      }));
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }
  }, [threadId, principalId, orgId]);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      session: null,
      completedUrl: null
    });
  }, []);

  return {
    uploadState,
    uploadFile,
    resetUpload
  };
};

// ================================
// SEARCH HOOKS
// ================================

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Hook for advanced communication search
 */
export const useCommunicationSearch = (principalId?: number, orgId?: number) => {
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    totalResults: 0,
    currentPage: 1,
    hasMore: false
  });

  const search = useCallback(async (
    query: string,
    options: SearchOptions = {},
    append = false
  ) => {
    if (!query || query.length < 3) {
      setSearchState(prev => ({ ...prev, results: [], totalResults: 0 }));
      return;
    }

    if (!principalId || !orgId) {
      setSearchState(prev => ({ ...prev, error: 'Principal ID and Org ID are required' }));
      return;
    }

    setSearchState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      ...(append ? {} : { results: [], currentPage: 1 })
    }));

    try {
      const response = await searchCommunications(query, options, principalId, orgId);
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: append ? [...prev.results, ...response.data] : response.data,
        totalResults: response.meta?.total || response.data.length,
        currentPage: options.page || 1,
        hasMore: response.data.length === (options.limit || 20)
      }));

    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Search failed'
      }));
    }
  }, [principalId, orgId]);

  const loadMore = useCallback((query: string, options: SearchOptions = {}) => {
    search(query, { ...options, page: searchState.currentPage + 1 }, true);
  }, [search, searchState.currentPage]);

  const clearResults = useCallback(() => {
    setSearchState({
      results: [],
      loading: false,
      error: null,
      totalResults: 0,
      currentPage: 1,
      hasMore: false
    });
  }, []);

  return {
    searchState,
    search,
    loadMore,
    clearResults
  };
};

// ================================
// EMAIL TEMPLATE HOOKS
// ================================

export interface TemplateState {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing email templates
 */
export const useEmailTemplates = (orgId?: number) => {
  const [templateState, setTemplateState] = useState<TemplateState>({
    templates: [],
    loading: false,
    error: null
  });

  const loadTemplates = useCallback(async (type?: string, isActive?: boolean) => {
    if (!orgId) return;

    setTemplateState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const templates = await getEmailTemplates(type, isActive, orgId);
      setTemplateState({
        templates,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      setTemplateState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load templates'
      }));
    }
  }, [orgId]);

  const createTemplate = useCallback(async (
    template: Omit<EmailTemplate, 'template_id' | 'org_id' | 'created_utc' | 'updated_utc'>,
    principalId?: number
  ) => {
    if (!orgId || !principalId) return;

    try {
      const newTemplate = await createEmailTemplate(template, principalId, orgId);
      setTemplateState(prev => ({
        ...prev,
        templates: [...prev.templates, newTemplate]
      }));
      toast.success('Template created successfully');
      return newTemplate;
    } catch (error: any) {
      console.error('Failed to create template:', error);
      toast.error(`Failed to create template: ${error.message}`);
      throw error;
    }
  }, [orgId]);

  const updateTemplate = useCallback(async (
    templateId: number,
    updates: Partial<EmailTemplate>
  ) => {
    if (!orgId) return;

    try {
      const updatedTemplate = await updateEmailTemplate(templateId, updates, orgId);
      setTemplateState(prev => ({
        ...prev,
        templates: prev.templates.map(t => 
          t.template_id === templateId ? updatedTemplate : t
        )
      }));
      toast.success('Template updated successfully');
      return updatedTemplate;
    } catch (error: any) {
      console.error('Failed to update template:', error);
      toast.error(`Failed to update template: ${error.message}`);
      throw error;
    }
  }, [orgId]);

  const removeTemplate = useCallback(async (templateId: number) => {
    if (!orgId) return;

    try {
      await deleteEmailTemplate(templateId, orgId);
      setTemplateState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.template_id !== templateId)
      }));
      toast.success('Template deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      toast.error(`Failed to delete template: ${error.message}`);
      throw error;
    }
  }, [orgId]);

  const applyTemplate = useCallback((
    template: EmailTemplate,
    variables: Record<string, any>
  ) => {
    return applyEmailTemplate(template, variables);
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templateState,
    loadTemplates,
    createTemplate,
    updateTemplate,
    removeTemplate,
    applyTemplate
  };
};

/**
 * Hook for template variable validation
 */
export const useTemplateValidation = () => {
  const validateVariables = useCallback((
    template: EmailTemplate,
    variables: Record<string, any>
  ): { isValid: boolean; missingRequired: string[]; errors: Record<string, string> } => {
    const missingRequired: string[] = [];
    const errors: Record<string, string> = {};

    template.variables.forEach((variable: TemplateVariable) => {
      const value = variables[variable.variable_name];

      // Check required variables
      if (variable.is_required && (value === undefined || value === null || value === '')) {
        missingRequired.push(variable.variable_name);
        return;
      }

      // Type validation
      if (value !== undefined && value !== null && value !== '') {
        switch (variable.variable_type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors[variable.variable_name] = 'Must be a valid number';
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors[variable.variable_name] = 'Must be a valid date';
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
              errors[variable.variable_name] = 'Must be true or false';
            }
            break;
        }
      }
    });

    return {
      isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
      missingRequired,
      errors
    };
  }, []);

  const getDefaultVariables = useCallback((template: EmailTemplate): Record<string, any> => {
    const defaults: Record<string, any> = {};
    
    template.variables.forEach((variable: TemplateVariable) => {
      if (variable.default_value) {
        switch (variable.variable_type) {
          case 'number':
            defaults[variable.variable_name] = Number(variable.default_value);
            break;
          case 'boolean':
            defaults[variable.variable_name] = variable.default_value === 'true';
            break;
          case 'date':
            defaults[variable.variable_name] = variable.default_value;
            break;
          default:
            defaults[variable.variable_name] = variable.default_value;
        }
      }
    });

    return defaults;
  }, []);

  return {
    validateVariables,
    getDefaultVariables
  };
};

export default {
  useWebSocketConnection,
  useRealTimeUpdates,
  useFileUpload,
  useCommunicationSearch,
  useEmailTemplates,
  useTemplateValidation
};
