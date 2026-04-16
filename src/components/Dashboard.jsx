import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiDownload, FiCalendar, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import { FaGasPump, FaWater, FaHeartbeat } from 'react-icons/fa';
import SummaryCard from './SummaryCard';
import ChartSection from './ChartSection';
import AlertsSection from './AlertsSection';
import LocationPanel from './LocationPanel';
import DeviceHealthSection from './DeviceHealthSection';
import AlertManagement from './AlertManagement';
import {
  generateSensorData,
  generateTimeSeriesData,
  thresholds,
} from '../utils/data';
import { getStatus } from '../utils/helpers';
import {
  bridgeApiBase,
  fetchBridgeHealth,
  fetchLatestSensorSnapshot,
  fetchSensorHistory,
  downloadSensorData,
  fetchLocations,
  fetchLocationLatest,
  fetchLocationHistory,
  fetchLocationsOverview,
} from '../utils/liveData';

const HISTORY_LIMIT = 20;
const POLL_INTERVAL_MS = 3000;

const buildAlerts = (sensorData) => {
  const newAlerts = [];

  const h2sStatus = getStatus(
    sensorData.h2s,
    thresholds.h2sWarning,
    thresholds.h2sDanger
  );
  if (h2sStatus === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Critical H2S Level',
      message: `H2S concentration is ${sensorData.h2s} ppm, exceeding the ${thresholds.h2sDanger} ppm danger threshold.`,
    });
  } else if (h2sStatus === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Elevated H2S Detected',
      message: `H2S concentration is ${sensorData.h2s} ppm and trending toward the critical limit.`,
    });
  }

  const ch4Status = getStatus(
    sensorData.ch4,
    thresholds.ch4Warning,
    thresholds.ch4Danger
  );
  if (ch4Status === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Methane Danger',
      message: `CH4 concentration is ${sensorData.ch4} ppm, above the ${thresholds.ch4Danger} ppm alarm threshold.`,
    });
  } else if (ch4Status === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Methane Warning',
      message: `CH4 concentration is ${sensorData.ch4} ppm and nearing the alarm threshold.`,
    });
  }

  const waterStatus = getStatus(
    sensorData.waterLevel,
    thresholds.waterLevelWarning,
    thresholds.waterLevelDanger
  );
  if (waterStatus === 'danger') {
    newAlerts.push({
      status: 'danger',
      title: 'Overflow Risk Critical',
      message: `Water level is ${sensorData.waterLevel} cm, exceeding the ${thresholds.waterLevelDanger} cm overflow limit.`,
    });
  } else if (waterStatus === 'warning') {
    newAlerts.push({
      status: 'warning',
      title: 'Overflow Risk',
      message: `Water level is ${sensorData.waterLevel} cm and rising toward the overflow limit.`,
    });
  }

  return newAlerts;
};

const formatChartTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const sortReadings = (readings = []) =>
  [...readings].sort(
    (firstReading, secondReading) =>
      new Date(firstReading.lastUpdated) - new Date(secondReading.lastUpdated)
  );

const buildChartData = (readings = []) =>
  sortReadings(readings)
    .slice(-HISTORY_LIMIT)
    .map((reading) => ({
      time: formatChartTime(reading.lastUpdated),
      h2s: reading.h2s,
      ch4: reading.ch4,
      waterLevel: reading.waterLevel,
    }));

const readBridgeState = async (selectedLocationId = null) => {
  // If a specific location is selected, use location-specific endpoints
  if (selectedLocationId && selectedLocationId !== 'all') {
    const [healthResult, latestResult, historyResult] = await Promise.allSettled([
      fetchBridgeHealth(),
      fetchLocationLatest(selectedLocationId),
      fetchLocationHistory(selectedLocationId, HISTORY_LIMIT),
    ]);

    const bridgeHealth =
      healthResult.status === 'fulfilled' ? healthResult.value : null;
    const latestSnapshot =
      latestResult.status === 'fulfilled' ? latestResult.value : null;
    const historySnapshot =
      historyResult.status === 'fulfilled' ? historyResult.value : null;
    const historyReadings = Array.isArray(historySnapshot?.readings)
      ? historySnapshot.readings
      : [];
    const latestReading =
      latestSnapshot?.reading ||
      historyReadings[historyReadings.length - 1] ||
      null;

    return {
      bridgeHealth,
      historySnapshot,
      latestReading,
      historyReadings,
      selectedLocation: latestSnapshot?.location || null,
    };
  }

  // Default behavior for 'all' locations or no selection
  const [healthResult, latestResult, historyResult] = await Promise.allSettled([
    fetchBridgeHealth(),
    fetchLatestSensorSnapshot(),
    fetchSensorHistory(HISTORY_LIMIT),
  ]);

  const bridgeHealth =
    healthResult.status === 'fulfilled' ? healthResult.value : null;
  const latestSnapshot =
    latestResult.status === 'fulfilled' ? latestResult.value : null;
  const historySnapshot =
    historyResult.status === 'fulfilled' ? historyResult.value : null;
  const historyReadings = Array.isArray(historySnapshot?.readings)
    ? historySnapshot.readings
    : [];
  const latestReading =
    latestSnapshot?.reading ||
    historyReadings[historyReadings.length - 1] ||
    null;

  return {
    bridgeHealth,
    historySnapshot,
    latestReading,
    historyReadings,
    selectedLocation: null,
  };
};

const buildIntegrationState = ({
  mode,
  bridgeHealth = null,
  totalReadings = 0,
}) => {
  const storageMode = bridgeHealth?.storageMode || 'offline';

  if (mode === 'live') {
    return {
      mode,
      label: 'Wokwi Live',
      storageMode,
      totalReadings,
      message:
        'Dashboard is reading the Wokwi bridge in real time and updating from the live sensor stream.',
    };
  }

  if (mode === 'waiting') {
    return {
      mode,
      label: 'Waiting for Stream',
      storageMode,
      totalReadings,
      message:
        'The bridge is reachable, but it has not received any Wokwi readings yet. Start the simulator and watcher to populate the dashboard.',
    };
  }

  if (mode === 'disconnected') {
    return {
      mode,
      label: 'Bridge Offline',
      storageMode,
      totalReadings,
      message:
        'The last live reading is still shown, but the bridge is not responding right now.',
    };
  }

  return {
    mode: 'demo',
    label: 'Demo Mode',
    storageMode,
    totalReadings,
    message: `No bridge was found at ${bridgeApiBase}, so the dashboard is showing built-in sample data.`,
  };
};

const Dashboard = () => {
  const [data, setData] = useState(() => generateSensorData());
  const [chartData, setChartData] = useState(() => generateTimeSeriesData());
  const [alerts, setAlerts] = useState(() => buildAlerts(generateSensorData()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLiveFeed, setHasLiveFeed] = useState(false);
  const [integration, setIntegration] = useState(
    buildIntegrationState({ mode: 'demo' })
  );
  
  // Task 2.3: Multi-Location Support (REQ-025)
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [locationsOverview, setLocationsOverview] = useState([]);
  const [showLocationOverview, setShowLocationOverview] = useState(false);
  
  // Task 2.4: Alert Management (REQ-026)
  const [showAlertManagement, setShowAlertManagement] = useState(false);
  
  // Export functionality state (Task 2.2)
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLimit, setExportLimit] = useState('');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    setAlerts(buildAlerts(data));
  }, [data]);

  // Task 2.3: Load available locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsData = await fetchLocations();
        setLocations([
          { id: 'all', name: 'All Locations', description: 'View data from all monitoring locations' },
          ...locationsData.locations
        ]);
      } catch (error) {
        console.warn('Could not load locations:', error.message);
        // Fallback to single location mode
        setLocations([
          { id: 'all', name: 'All Locations', description: 'View data from all monitoring locations' }
        ]);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncLiveData = async () => {
      const bridgeState = await readBridgeState(selectedLocationId);
      if (!isMounted) {
        return;
      }

      if (bridgeState.latestReading) {
        const readings =
          bridgeState.historyReadings.length > 0
            ? bridgeState.historyReadings
            : [bridgeState.latestReading];

        setData(bridgeState.latestReading);
        setChartData(buildChartData(readings));
        setIntegration(
          buildIntegrationState({
            mode: 'live',
            bridgeHealth: bridgeState.bridgeHealth,
            totalReadings:
              bridgeState.historySnapshot?.totalReadings || readings.length,
          })
        );
        setHasLiveFeed(true);
        return;
      }

      if (bridgeState.bridgeHealth) {
        setIntegration(
          buildIntegrationState({
            mode: 'waiting',
            bridgeHealth: bridgeState.bridgeHealth,
            totalReadings: bridgeState.historySnapshot?.totalReadings || 0,
          })
        );
        return;
      }

      setIntegration(
        buildIntegrationState({
          mode: hasLiveFeed ? 'disconnected' : 'demo',
        })
      );
    };

    void syncLiveData();
    const intervalId = window.setInterval(() => {
      void syncLiveData();
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [hasLiveFeed, selectedLocationId]); // Add selectedLocationId as dependency

  const handleRefresh = async () => {
    setIsRefreshing(true);

    const bridgeState = await readBridgeState(selectedLocationId);

    if (bridgeState.latestReading) {
      const readings =
        bridgeState.historyReadings.length > 0
          ? bridgeState.historyReadings
          : [bridgeState.latestReading];

      setData(bridgeState.latestReading);
      setChartData(buildChartData(readings));
      setIntegration(
        buildIntegrationState({
          mode: 'live',
          bridgeHealth: bridgeState.bridgeHealth,
          totalReadings:
            bridgeState.historySnapshot?.totalReadings || readings.length,
        })
      );
      setHasLiveFeed(true);
      setIsRefreshing(false);
      return;
    }

    if (bridgeState.bridgeHealth) {
      setIntegration(
        buildIntegrationState({
          mode: 'waiting',
          bridgeHealth: bridgeState.bridgeHealth,
          totalReadings: bridgeState.historySnapshot?.totalReadings || 0,
        })
      );
      setIsRefreshing(false);
      return;
    }

    const fallbackData = generateSensorData();
    setData(fallbackData);
    setChartData(generateTimeSeriesData());
    setIntegration(buildIntegrationState({ mode: 'demo' }));
    setHasLiveFeed(false);
    setIsRefreshing(false);
  };

  // Task 2.3: Location selection handlers
  const handleLocationChange = (locationId) => {
    setSelectedLocationId(locationId);
    setShowLocationOverview(locationId === 'all');
  };

  const loadLocationsOverview = async () => {
    if (integration.mode === 'demo') {
      return;
    }

    try {
      const overview = await fetchLocationsOverview();
      setLocationsOverview(overview.locations || []);
    } catch (error) {
      console.error('Failed to load locations overview:', error);
      setLocationsOverview([]);
    }
  };

  // Load locations overview when showing all locations
  useEffect(() => {
    if (showLocationOverview && integration.mode !== 'demo') {
      loadLocationsOverview();
    }
  }, [showLocationOverview, integration.mode]);

  // Task 2.2: Export functionality
  const handleExport = async () => {
    if (integration.mode === 'demo') {
      setExportError('Export is not available in demo mode. Connect to a live bridge to export data.');
      return;
    }

    setIsExporting(true);
    setExportError('');

    try {
      const options = {
        format: exportFormat,
      };

      // Add optional parameters
      if (exportLimit && exportLimit.trim()) {
        const limit = parseInt(exportLimit.trim(), 10);
        if (isNaN(limit) || limit <= 0) {
          throw new Error('Limit must be a positive number');
        }
        options.limit = limit;
      }

      if (exportStartDate) {
        options.startDate = exportStartDate;
      }

      if (exportEndDate) {
        options.endDate = exportEndDate;
      }

      // Validate date range
      if (exportStartDate && exportEndDate) {
        const start = new Date(exportStartDate);
        const end = new Date(exportEndDate);
        if (start > end) {
          throw new Error('Start date must be before end date');
        }
      }

      const result = await downloadSensorData(options);
      
      // Show success message
      setExportError('');
      setShowExportPanel(false);
      
      // Reset form
      setExportLimit('');
      setExportStartDate('');
      setExportEndDate('');
      
      console.log(`✅ Export completed: ${result.filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const h2sStatus = getStatus(
    data.h2s,
    thresholds.h2sWarning,
    thresholds.h2sDanger
  );
  const ch4Status = getStatus(
    data.ch4,
    thresholds.ch4Warning,
    thresholds.ch4Danger
  );
  const waterStatus = getStatus(
    data.waterLevel,
    thresholds.waterLevelWarning,
    thresholds.waterLevelDanger
  );
  const overallStatus =
    data.status?.toLowerCase() === 'warning'
      ? 'warning'
      : data.status?.toLowerCase() === 'danger'
        ? 'danger'
        : 'safe';
  const integrationToneClasses = {
    live: 'border-green-200 bg-green-50 text-green-800',
    waiting: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    disconnected: 'border-orange-200 bg-orange-50 text-orange-800',
    demo: 'border-gray-200 bg-gray-100 text-gray-700',
  };
  const integrationBadgeClass =
    integrationToneClasses[integration.mode] || integrationToneClasses.demo;
  const sensorStatusLabel =
    integration.mode === 'live'
      ? data.sensorStatus || 'Working'
      : integration.mode === 'waiting'
        ? 'Waiting for stream'
        : integration.mode === 'disconnected'
          ? 'Bridge offline'
          : 'Demo mode';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <FaGasPump size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Smart Manhole Monitoring
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time gas, overflow, and Wokwi simulation monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Task 2.3: Location Selector */}
              {locations.length > 1 && (
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-500" size={16} />
                  <select
                    value={selectedLocationId}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${integrationBadgeClass}`}
              >
                {integration.label}
              </div>

              {/* Task 2.4: Alert Management Toggle */}
              <button
                onClick={() => setShowAlertManagement(!showAlertManagement)}
                className={`rounded-lg p-3 text-white transition-all ${
                  showAlertManagement 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
                title={showAlertManagement ? "Show Dashboard" : "Show Alert Management"}
              >
                <FiAlertTriangle size={20} />
              </button>

              {/* Export button (Task 2.2) */}
              <button
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="rounded-lg bg-green-600 p-3 text-white transition-all hover:bg-green-700"
                title="Export sensor data"
                disabled={integration.mode === 'demo'}
              >
                <FiDownload size={20} />
              </button>

              <button
                onClick={handleRefresh}
                className={`rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                title="Refresh data"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showAlertManagement ? (
          // Task 2.4: Alert Management View (REQ-026)
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Management</h2>
              <p className="text-gray-600">
                Monitor, acknowledge, and manage system alerts
                {selectedLocationId !== 'all' && (
                  <span className="ml-2 text-sm">
                    (Filtered by: {locations.find(loc => loc.id === selectedLocationId)?.name || selectedLocationId})
                  </span>
                )}
              </p>
            </div>
            <AlertManagement 
              selectedLocationId={selectedLocationId}
              integration={integration}
            />
          </section>
        ) : (
          // Normal Dashboard View
          <>
            <section className="mb-8">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Simulation Feed Status
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {integration.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Storage
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {integration.storageMode}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Readings Stored
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {integration.totalReadings}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        API Base
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {bridgeApiBase}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

        {/* Task 2.3: Locations Overview */}
        {showLocationOverview && integration.mode !== 'demo' && (
          <section className="mb-8">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  All Locations Overview
                </h2>
                <button
                  onClick={loadLocationsOverview}
                  className="ml-auto rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
              
              {locationsOverview.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {locationsOverview.map((locationData) => (
                    <div
                      key={locationData.location.id}
                      className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleLocationChange(locationData.location.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {locationData.location.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            locationData.status === 'Danger'
                              ? 'bg-red-100 text-red-800'
                              : locationData.status === 'Warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : locationData.status === 'Safe'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {locationData.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {locationData.location.description}
                      </p>
                      
                      {locationData.latestReading ? (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">CH4</p>
                            <p className="font-medium">{locationData.latestReading.ch4} ppm</p>
                          </div>
                          <div>
                            <p className="text-gray-500">H2S</p>
                            <p className="font-medium">{locationData.latestReading.h2s} ppm</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Water</p>
                            <p className="font-medium">{locationData.latestReading.waterLevel} cm</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No recent data</p>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <span>{locationData.totalReadings} readings</span>
                        <span>
                          {locationData.lastUpdated 
                            ? new Date(locationData.lastUpdated).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiMapPin size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No location data available</p>
                  <p className="text-sm">Check your bridge connection and try refreshing</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Export Panel (Task 2.2) */}
        {showExportPanel && (
          <section className="mb-8">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiDownload className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-blue-800">
                  Export Sensor Data
                </h2>
              </div>
              
              {exportError && (
                <div className="mb-4 rounded-lg bg-red-100 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{exportError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit (optional)
                  </label>
                  <input
                    type="number"
                    value={exportLimit}
                    onChange={(e) => setExportLimit(e.target.value)}
                    placeholder="All records"
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting || integration.mode === 'demo'}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${
                    isExporting || integration.mode === 'demo'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FiDownload size={16} />
                      Export Data
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowExportPanel(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                {integration.mode === 'demo' && (
                  <p className="text-sm text-gray-500 ml-auto">
                    Export requires live bridge connection
                  </p>
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-600">
                <p><strong>CSV:</strong> Spreadsheet-compatible format with headers</p>
                <p><strong>JSON:</strong> Structured data with metadata for programmatic use</p>
                <p><strong>Date Range:</strong> Leave empty to export all available data</p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Real-Time Metrics
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="H2S Level"
              value={data.h2s}
              unit="ppm"
              status={h2sStatus}
              icon={FaGasPump}
            />
            <SummaryCard
              title="CH4 Level"
              value={data.ch4}
              unit="ppm"
              status={ch4Status}
              icon={FaGasPump}
            />
            <SummaryCard
              title="Water Level"
              value={data.waterLevel}
              unit="cm"
              status={waterStatus}
              icon={FaWater}
            />
            <SummaryCard
              title="Overall Status"
              value={data.status}
              unit=""
              status={overallStatus}
              icon={FaHeartbeat}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Historical Trends (Last 20 readings)
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {chartData.length > 0 && (
              <>
                <ChartSection
                  title="H2S Concentration"
                  data={chartData}
                  dataKey="h2s"
                  color="#3b82f6"
                  unit="ppm"
                  icon={FaGasPump}
                />
                <ChartSection
                  title="CH4 Level"
                  data={chartData}
                  dataKey="ch4"
                  color="#8b5cf6"
                  unit="ppm"
                  icon={FaGasPump}
                />
                <ChartSection
                  title="Water Level"
                  data={chartData}
                  dataKey="waterLevel"
                  color="#06b6d4"
                  unit="cm"
                  icon={FaWater}
                />
              </>
            )}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              System Alerts
            </h2>
            <AlertsSection alerts={alerts} />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Device Health
            </h2>
            <DeviceHealthSection
              battery={data.battery}
              sensorStatus={sensorStatusLabel}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Location & Metadata
            {selectedLocationId !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({locations.find(loc => loc.id === selectedLocationId)?.name || selectedLocationId})
              </span>
            )}
          </h2>
          <LocationPanel
            location={data.location}
            lastUpdated={data.lastUpdated}
          />
        </section>
        </>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            © 2024 Smart Manhole Monitoring System | Polling Wokwi bridge every
            3 seconds
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
