import React from 'react';
import { Badge } from '../ui/badge.tsx';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface EnrichmentStatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export function EnrichmentStatusBadge({ status }: EnrichmentStatusBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="muted" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
          <Clock size={10} className="mr-1" />
          Pending
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="muted" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Loader2 size={10} className="mr-1 animate-spin" />
          In Progress
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className="text-xs">
          <CheckCircle2 size={10} className="mr-1" />
          Completed
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="muted" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
          <AlertCircle size={10} className="mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="muted" className="text-xs">
          <Clock size={10} className="mr-1" />
          Unknown
        </Badge>
      );
  }
}
