import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, 
  FiAlertCircle, 
  FiCheck, 
  FiVolume2, 
  FiVolumeX, 
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiX
} from 'react-icons/fi';
import {
  fetchAlerts,
  fetchActiveAlerts,
  acknowledgeAlert,
  silenceAlert,
  resolveAlert,
  fetchAlertStats,
} from '../utils/liveData';

const AlertManagement = ({ selectedLocationId = null, integration }) => {
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // Action states
  const [actionLoading, setActionLoading] = useState(new Set());

  const loadAlerts = async () => {
    if (integration.mode === 'demo') {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [alertsResult, activeResult, statsResult] = await Promise.allSettled([
        fetchAlerts({
          limit: 100,
          status: statusFilter === 'all' ? null : statusFilter,
          locationId: selectedLocationId === 'all' ? null : selectedLocationId,
        }),
        fetchActiveAlerts(selectedLocationId === 'all' ? null : selectedLocationId),
        fetchAlertStats(selectedLocationId === 'all' ? null : selectedLocationId),
      ]);

      if (alertsResult.status === 'fulfilled') {
        setAlerts(alertsResult.value.alerts || []);
      }

      if (activeResult.status === 'fulfilled') {
        setActiveAlerts(activeResult.value.alerts || []);
      }

      if (statsResult.status === 'fulfilled') {
        setAlertStats(statsResult.value.stats || null);
      }
    } catch (err) {
      setError(`Failed to load alerts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedLocationId, statusFilter, integration.mode]);

  const handleAcknowledge = async (alertId) => {
    setActionLoading(prev => new Set(prev).add(alertId));
    try {
      await acknowledgeAlert(alertId);
      await loadAlerts(); // Refresh data
    } catch (err) {
      setError(`Failed to acknowledge alert: ${err.message}`);
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const handleSilence = async (alertId, duration = 60) => {
    setActionLoading(prev => new Set(prev).add(alertId));
    try {
      await silenceAlert(alertId, duration);
      await loadAlerts(); // Refresh data
    } catch (err) {
      setError(`Failed to silence alert: ${err.message}`);
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const handleResolve = async (alertId) => {
    setActionLoading(prev => new Set(prev).add(alertId));
    try {
      await resolveAlert(alertId, 'Manually resolved from dashboard');
      await loadAlerts(); // Refresh data
    } catch (err) {
      setError(`Failed to resolve alert: ${err.message}`);
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const getAlertIcon = (type, severity) => {
    if (severity === 'danger' || severity === 'critical') {
      return <FiAlertTriangle className="text-red-500" size={20} />;
    }
    return <FiAlertCircle className="text-yellow-500" size={20} />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      silenced: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badges[status] || badges.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900',
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${badges[severity] || badges.warning}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredAlerts = alerts.filter(alert => {
    if (showActiveOnly && alert.status !== 'active') return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  if (integration.mode === 'demo') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Alert management is not available in demo mode</p>
          <p className="text-sm">Connect to a live bridge to manage alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      {alertStats && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Statistics (24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertStats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{alertStats.last24Hours}</div>
              <div className="text-sm text-gray-600">Last 24h</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{alertStats.byStatus.acknowledged || 0}</div>
              <div className="text-sm text-gray-600">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{alertStats.byStatus.resolved || 0}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-red-800">
              Active Alerts ({activeAlerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type, alert.severity)}
                  <div>
                    <div className="font-medium text-gray-900">{alert.message}</div>
                    <div className="text-sm text-gray-600">
                      {alert.locationId} • {formatTimestamp(alert.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={actionLoading.has(alert.id)}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading.has(alert.id) ? '...' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            ))}
            {activeAlerts.length > 3 && (
              <div className="text-center text-sm text-gray-600">
                +{activeAlerts.length - 3} more active alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Management */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Alert History</h3>
            <button
              onClick={loadAlerts}
              disabled={loading}
              className={`rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50 ${
                loading ? 'animate-spin' : ''
              }`}
            >
              <FiRefreshCw size={16} />
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="silenced">Silenced</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Severity</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Active only
            </label>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <FiX size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p>Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCheck size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No alerts found</p>
              <p className="text-sm">All systems are operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{alert.message}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Location: {alert.locationId} • Type: {alert.type} • Created: {formatTimestamp(alert.createdAt)}
                        </div>
                        {alert.acknowledgedAt && (
                          <div className="text-sm text-blue-600">
                            Acknowledged by {alert.acknowledgedBy} at {formatTimestamp(alert.acknowledgedAt)}
                          </div>
                        )}
                        {alert.resolvedAt && (
                          <div className="text-sm text-green-600">
                            Resolved at {formatTimestamp(alert.resolvedAt)}
                          </div>
                        )}
                        {alert.silencedUntil && new Date(alert.silencedUntil) > new Date() && (
                          <div className="text-sm text-gray-600">
                            Silenced until {formatTimestamp(alert.silencedUntil)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(alert.status)}
                      {getSeverityBadge(alert.severity)}
                    </div>
                  </div>

                  {/* Action buttons for active alerts */}
                  {alert.status === 'active' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={actionLoading.has(alert.id)}
                        className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiCheck size={14} />
                        {actionLoading.has(alert.id) ? 'Processing...' : 'Acknowledge'}
                      </button>

                      <button
                        onClick={() => handleSilence(alert.id, 60)}
                        disabled={actionLoading.has(alert.id)}
                        className="flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        <FiVolumeX size={14} />
                        Silence 1h
                      </button>

                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={actionLoading.has(alert.id)}
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <FiCheck size={14} />
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertManagement;