import React from 'react';
import { Badge } from '../ui/badge.tsx';
import { Button } from '../ui/button.tsx';
import { 
  User, 
  Calendar, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Building2,
  Mail
} from 'lucide-react';
import { EnrichmentStatusBadge } from './EnrichmentStatusBadge.tsx';
import type { EnrichmentJob } from '../services/api.ts';

interface EnrichmentJobCardProps {
  job: EnrichmentJob;
  onView?: (job: EnrichmentJob) => void;
  onDownload?: (job: EnrichmentJob) => void;
  onDelete?: (job: EnrichmentJob) => void;
}

export function EnrichmentJobCard({ job, onView, onDownload, onDelete }: EnrichmentJobCardProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <User className="text-cyan-400" size={20} />
          </div>
          <div>
            <h4 className="font-medium text-white">{job.contact_name}</h4>
            {job.contact_email && (
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <Mail size={12} />
                {job.contact_email}
              </div>
            )}
          </div>
        </div>
        <EnrichmentStatusBadge status={job.status} />
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Provider</span>
          <span className="text-white font-medium">{job.provider}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Created</span>
          <div className="flex items-center gap-1 text-zinc-300">
            <Calendar size={12} />
            {new Date(job.created_date).toLocaleDateString()}
          </div>
        </div>

        {job.company && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Company</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <Building2 size={12} />
              {job.company}
            </div>
          </div>
        )}

        {job.error_message && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="text-red-400 mt-0.5" size={14} />
            <div>
              <div className="text-xs font-medium text-red-400">Error</div>
              <div className="text-xs text-red-300">{job.error_message}</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-zinc-800">
        {job.status === 'COMPLETED' && job.enriched_data && onView && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(job)}
            className="flex-1 gap-2"
          >
            <Eye size={14} />
            View Data
          </Button>
        )}
        
        {job.status === 'COMPLETED' && onDownload && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDownload(job)}
            className="gap-2"
          >
            <Download size={14} />
            Export
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(job)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Progress Indicator for In Progress */}
      {job.status === 'IN_PROGRESS' && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Enriching contact data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
