/**
 * WebSocket Client for Real-time Communication Hub Updates
 * Handles connection management, subscriptions, and message routing
 */

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface WebSocketSubscription {
  subscription_type: string;
  resource_id?: number;
}

export interface WebSocketEventHandlers {
  new_message: (message: any) => void;
  thread_updated: (thread: any) => void;
  presence_update: (presence: any) => void;
  connection_status: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private subscriptions = new Set<string>();
  private eventHandlers = new Map<string, Set<Function>>();
  private principalId: number | null = null;
  private orgId: number | null = null;
  private isManualDisconnect = false;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupHeartbeat();
  }

  /**
   * Connect to WebSocket server
   */
  connect(principalId: number, orgId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.principalId = principalId;
      this.orgId = orgId;
      this.isManualDisconnect = false;

      // Use environment-specific WebSocket URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.DEV ? 'localhost:4001' : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws`;

      console.log(`Connecting to WebSocket: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connection_status', 'connected');

        // Register connection with server
        this.send({
          type: 'register',
          principal_id: principalId,
          org_id: orgId
        });

        // Resubscribe to previous subscriptions
        this.resubscribe();

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.emit('connection_status', 'disconnected');
        
        if (!this.isManualDisconnect) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      // Timeout for connection
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.subscriptions.clear();
    this.emit('connection_status', 'disconnected');
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(subscriptionType: string, resourceId?: number): void {
    const subscriptionKey = `${subscriptionType}:${resourceId || 'all'}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      return; // Already subscribed
    }

    this.subscriptions.add(subscriptionKey);

    if (this.isConnected()) {
      this.send({
        type: 'subscribe',
        subscription_type: subscriptionType,
        resource_id: resourceId
      });
    }
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionType: string, resourceId?: number): void {
    const subscriptionKey = `${subscriptionType}:${resourceId || 'all'}`;
    this.subscriptions.delete(subscriptionKey);

    if (this.isConnected()) {
      this.send({
        type: 'unsubscribe',
        subscription_type: subscriptionType,
        resource_id: resourceId
      });
    }
  }

  /**
   * Add event listener
   */
  on<K extends keyof WebSocketEventHandlers>(
    event: K,
    handler: WebSocketEventHandlers[K]
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof WebSocketEventHandlers>(
    event: K,
    handler: WebSocketEventHandlers[K]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' | 'reconnecting' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
      default:
        return 'disconnected';
    }
  }

  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'welcome':
        console.log('Connected to Communication Hub:', data.message);
        break;

      case 'new_message':
        console.log('New message received:', data.message);
        this.emit('new_message', data.message);
        break;

      case 'thread_updated':
        console.log('Thread updated:', data.thread);
        this.emit('thread_updated', data.thread);
        break;

      case 'presence_update':
        this.emit('presence_update', data.presence);
        break;

      case 'pong':
        // Handle ping response - connection is alive
        break;

      case 'error':
        console.error('WebSocket server error:', data.error);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type, data);
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  private send(data: WebSocketMessage): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(data));
    } else {
      console.warn('Attempted to send message while WebSocket is not connected:', data);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connection_status', 'disconnected');
      return;
    }

    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms... Attempt ${this.reconnectAttempts}`);
    this.emit('connection_status', 'reconnecting');

    setTimeout(() => {
      if (this.principalId && this.orgId && !this.isManualDisconnect) {
        this.connect(this.principalId, this.orgId).catch(error => {
          console.error('Reconnection failed:', error);
          this.handleReconnect();
        });
      }
    }, delay);
  }

  private resubscribe(): void {
    // Resubscribe to all previous subscriptions
    this.subscriptions.forEach(subscription => {
      const [type, resourceId] = subscription.split(':');
      this.send({
        type: 'subscribe',
        subscription_type: type,
        resource_id: resourceId === 'all' ? undefined : parseInt(resourceId)
      });
    });
  }

  private setupHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient();

// Hook for React components
export const useWebSocket = () => {
  return wsClient;
};

export default WebSocketClient;
