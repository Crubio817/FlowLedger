import React from 'react';
import { Wifi, WifiOff, Users, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/badge.js';
import { useWebSocketConnection } from '../hooks/useCommunicationHub.js';

interface RealTimeIndicatorsProps {
  principalId?: number;
  orgId?: number;
  className?: string;
}

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  isConnected: boolean;
}

function ConnectionStatus({ status, isConnected }: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          text: 'Connected'
        };
      case 'connecting':
        return {
          icon: <Wifi className="h-4 w-4 animate-pulse" />,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          text: 'Connecting...'
        };
      case 'reconnecting':
        return {
          icon: <Wifi className="h-4 w-4 animate-pulse" />,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          text: 'Reconnecting...'
        };
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          text: 'Disconnected'
        };
    }
  };

  const { icon, color, bgColor, borderColor, text } = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${bgColor} ${borderColor}`}>
      <div className={color}>{icon}</div>
      <span className={`text-sm font-medium ${color}`}>{text}</span>
      {isConnected && (
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: 'message' | 'thread_created' | 'status_change' | 'file_upload';
    title: string;
    description?: string;
    timestamp: string;
    user?: string;
  }>;
}

function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'thread_created':
        return <Users className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'file_upload':
        return <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex-shrink-0 mt-0.5">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {activity.title}
            </p>
            {activity.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(activity.timestamp)}
              </span>
              {activity.user && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.user}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      {activities.length > 5 && (
        <div className="text-center">
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}

export function RealTimeIndicators({
  principalId,
  orgId,
  className = ''
}: RealTimeIndicatorsProps) {
  const { connectionStatus } = useWebSocketConnection(principalId, orgId);

  // Mock activity data - in real implementation, this would come from WebSocket events
  const mockActivities = [
    {
      id: '1',
      type: 'message' as const,
      title: 'New message received',
      description: 'Client inquiry about project timeline',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      user: 'John Smith'
    },
    {
      id: '2',
      type: 'thread_created' as const,
      title: 'New communication thread',
      description: 'Follow-up discussion for Project Alpha',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'Sarah Johnson'
    },
    {
      id: '3',
      type: 'status_change' as const,
      title: 'Thread status updated',
      description: 'Changed from "Open" to "In Progress"',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'Mike Wilson'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Real-time Connection
        </h4>
        <ConnectionStatus {...connectionStatus} />
      </div>

      {/* Statistics */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Communication Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Active Threads
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">12</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Resolved Today
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">8</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Recent Activity
          </h4>
          <Badge variant="muted">{mockActivities.length}</Badge>
        </div>
        <ActivityFeed activities={mockActivities} />
      </div>

      {/* Online Users Indicator */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Team Status
        </h4>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
              >
                <span className="text-xs text-white font-medium">{i}</span>
              </div>
            ))}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              3 team members online
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ready to collaborate
            </p>
          </div>
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeIndicators;
