const defaultBridgeUrl = 'http://localhost:3001';

export const bridgeApiBase = (
  import.meta.env.VITE_SENSOR_API_BASE || defaultBridgeUrl
).replace(/\/$/, '');

// WebSocket URL (REQ-005)
export const bridgeWsUrl = bridgeApiBase.replace(/^http/, 'ws') + '/ws';

// API Key Authentication (REQ-003)
const API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.VITE_BRIDGE_API_KEY;
const API_KEY_HEADER = "X-API-Key";

const fetchJson = async (path) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add API key header if configured (REQ-003)
  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  const response = await fetch(`${bridgeApiBase}${path}`, {
    headers,
  });

  if (!response.ok) {
    // Provide specific error messages for authentication failures
    if (response.status === 401) {
      throw new Error('API key required - configure VITE_API_KEY environment variable');
    } else if (response.status === 403) {
      throw new Error('Invalid API key - check VITE_API_KEY environment variable');
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  return response.json();
};

export const fetchBridgeHealth = () => fetchJson('/health');

export const fetchLatestSensorSnapshot = () => fetchJson('/api/sensor/latest');

export const fetchSensorHistory = (limit = 20) =>
  fetchJson(`/api/sensor/history?limit=${limit}`);

// Task 2.3: Multi-Location Support (REQ-025)
export const fetchLocations = () => fetchJson('/api/locations');

export const fetchLocationLatest = (locationId) => 
  fetchJson(`/api/locations/${locationId}/sensor/latest`);

export const fetchLocationHistory = (locationId, limit = 20) =>
  fetchJson(`/api/locations/${locationId}/sensor/history?limit=${limit}`);

export const fetchLocationsOverview = () => fetchJson('/api/locations/overview');

// Task 2.4: Alert Management API (REQ-026)
export const fetchAlerts = (options = {}) => {
  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.status) params.append('status', options.status);
  if (options.locationId) params.append('locationId', options.locationId);
  
  const queryString = params.toString();
  return fetchJson(`/api/alerts${queryString ? `?${queryString}` : ''}`);
};

export const fetchActiveAlerts = (locationId = null) => {
  const params = locationId ? `?locationId=${locationId}` : '';
  return fetchJson(`/api/alerts/active${params}`);
};

export const acknowledgeAlert = async (alertId, acknowledgedBy = 'dashboard_user') => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  const response = await fetch(`${bridgeApiBase}/api/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ acknowledgedBy }),
  });

  if (!response.ok) {
    throw new Error(`Failed to acknowledge alert: ${response.status}`);
  }

  return response.json();
};

export const silenceAlert = async (alertId, durationMinutes = 60, silencedBy = 'dashboard_user') => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  const response = await fetch(`${bridgeApiBase}/api/alerts/${alertId}/silence`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ durationMinutes, silencedBy }),
  });

  if (!response.ok) {
    throw new Error(`Failed to silence alert: ${response.status}`);
  }

  return response.json();
};

export const resolveAlert = async (alertId, reason = 'Manual resolution', resolvedBy = 'dashboard_user') => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  const response = await fetch(`${bridgeApiBase}/api/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason, resolvedBy }),
  });

  if (!response.ok) {
    throw new Error(`Failed to resolve alert: ${response.status}`);
  }

  return response.json();
};

export const fetchAlertStats = (locationId = null) => {
  const params = locationId ? `?locationId=${locationId}` : '';
  return fetchJson(`/api/alerts/stats${params}`);
};

// Task 2.2: Historical Data Export (REQ-024)
export const exportSensorData = async (options = {}) => {
  const {
    format = 'csv',
    limit,
    startDate,
    endDate
  } = options;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('format', format);
  
  if (limit) {
    params.append('limit', limit.toString());
  }
  
  if (startDate) {
    params.append('startDate', startDate);
  }
  
  if (endDate) {
    params.append('endDate', endDate);
  }

  const headers = {};

  // Add API key header if configured (REQ-003)
  if (API_KEY) {
    headers[API_KEY_HEADER] = API_KEY;
  }

  const response = await fetch(`${bridgeApiBase}/api/sensor/export?${params}`, {
    headers,
  });

  if (!response.ok) {
    // Provide specific error messages for authentication failures
    if (response.status === 401) {
      throw new Error('API key required - configure VITE_API_KEY environment variable');
    } else if (response.status === 403) {
      throw new Error('Invalid API key - check VITE_API_KEY environment variable');
    } else if (response.status === 404) {
      throw new Error('No sensor data found for the specified criteria');
    } else {
      throw new Error(`Export failed with status ${response.status}`);
    }
  }

  return response;
};

export const downloadSensorData = async (options = {}) => {
  try {
    const response = await exportSensorData(options);
    
    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `sensor-data-${new Date().toISOString().slice(0, 10)}.${options.format || 'csv'}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Get the data
    const blob = await response.blob();
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * WebSocket connection manager for real-time sensor updates (REQ-005)
 */
export class SensorWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Maximum 30 seconds
    this.jitterPercent = 0.2; // ±20% jitter
    this.backoffMultiplier = 2.0;
    this.isConnecting = false;
    this.shouldReconnect = true;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter (REQ-006)
   */
  calculateRetryDelay() {
    const exponentialDelay = this.reconnectDelay * Math.pow(this.backoffMultiplier, this.reconnectAttempts);
    const cappedDelay = Math.min(exponentialDelay, this.maxReconnectDelay);
    const jitter = cappedDelay * this.jitterPercent * (Math.random() * 2 - 1);
    return Math.max(cappedDelay + jitter, 1000); // Minimum 1 second
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (this.isConnecting) {
      return; // Connection attempt in progress
    }

    this.isConnecting = true;

    try {
      // Build WebSocket URL with API key if configured
      let wsUrl = bridgeWsUrl;
      if (API_KEY) {
        wsUrl += `?apiKey=${encodeURIComponent(API_KEY)}`;
      }

      console.log('🔌 Connecting to WebSocket:', wsUrl.replace(/apiKey=[^&]+/, 'apiKey=***'));
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Send ping to test connection
        this.ping();
        
        // Notify listeners of connection
        this.notifyListeners({ type: 'connection', status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        // Notify listeners of disconnection
        this.notifyListeners({ type: 'connection', status: 'disconnected' });
        
        // Attempt to reconnect if desired
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ WebSocket max reconnection attempts reached');
          this.notifyListeners({ type: 'connection', status: 'failed', reason: 'max_attempts_reached' });
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        
        // Notify listeners of error
        this.notifyListeners({ type: 'connection', status: 'error', error });
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt with exponential backoff (REQ-006)
   */
  scheduleReconnect() {
    if (!this.shouldReconnect) return;
    
    this.reconnectAttempts++;
    const delay = this.calculateRetryDelay();
    
    console.log(`🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(delay)}ms`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Send ping to server
   */
  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Add event listener
   */
  addEventListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
export const sensorWebSocket = new SensorWebSocket();
