import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge.tsx';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface WebSocketIndicatorProps {
  className?: string;
}

export const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [updateCount, setUpdateCount] = useState(0);

  // Simulate WebSocket connection status and updates
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      // Simulate occasional disconnections
      setIsConnected(prev => Math.random() > 0.95 ? !prev : prev);
    }, 3000);

    const updateInterval = setInterval(() => {
      if (isConnected) {
        const updates = [
          'Assignment created for Sarah Chen',
          'Marcus Johnson availability updated',
          'New skill certified: Elena Rodriguez',
          'Rate adjustment approved',
          'David Kim project completed',
          'Availability conflict resolved'
        ];
        
        setLastUpdate(updates[Math.floor(Math.random() * updates.length)]);
        setUpdateCount(prev => prev + 1);
      }
    }, 8000);

    return () => {
      clearInterval(connectionInterval);
      clearInterval(updateInterval);
    };
  }, [isConnected]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi size={16} className="text-emerald-400" />
            <Badge variant="success" className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              Live Updates
            </Badge>
          </>
        ) : (
          <>
            <WifiOff size={16} className="text-red-400" />
            <Badge variant="muted" className="text-red-400 bg-red-500/10 border-red-500/20">
              Reconnecting...
            </Badge>
          </>
        )}
      </div>
      
      {lastUpdate && isConnected && (
        <div className="flex items-center gap-2 text-sm">
          <Activity size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-zinc-400">{lastUpdate}</span>
          <span className="text-zinc-600">({updateCount} updates)</span>
        </div>
      )}
    </div>
  );
};
