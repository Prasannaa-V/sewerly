import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiMenu, FiX } from 'react-icons/fi';
import {
  FaGasPump,
  FaWater,
  FaHeartbeat,
  FaExclamationTriangle,
} from 'react-icons/fa';
import SummaryCard from './SummaryCard';
import ChartSection from './ChartSection';
import AlertsSection from './AlertsSection';
import LocationPanel from './LocationPanel';
import DeviceHealthSection from './DeviceHealthSection';
import { thresholds } from '../utils/data';
import { getStatus } from '../utils/helpers';
import { subscribeToLatestReading, subscribeToReadings, formatChartTime, getStatusFromReading } from '../utils/firebase';

const Dashboard = () => {
  const [data, setData] = useState({
    h2s: 0,
    ch4: 0,
    waterLevel: 0,
    alert: false,
    status: 'Safe',
    battery: 95,
    location: {
      id: 'MH-1023',
      lat: 12.9692,
      lng: 79.1559,
    },
    lastUpdated: new Date().toISOString(),
  });
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate alerts based on sensor data
  const generateAlerts = (sensorData) => {
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
        message: `H2S concentration is ${sensorData.h2s} ppm, exceeding danger threshold of ${thresholds.h2sDanger} ppm`,
      });
    } else if (h2sStatus === 'warning') {
      newAlerts.push({
        status: 'warning',
        title: 'High H2S Detected',
        message: `H2S concentration is ${sensorData.h2s} ppm, approaching danger level`,
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
        message: `CH4 level is ${sensorData.ch4} ppm, exceeding danger threshold of ${thresholds.ch4Danger} ppm`,
      });
    } else if (ch4Status === 'warning') {
      newAlerts.push({
        status: 'warning',
        title: 'Methane Warning',
        message: `CH4 level is ${sensorData.ch4} ppm, approaching danger level`,
      });
    }

    if (sensorData.alert) {
      newAlerts.push({
        status: 'danger',
        title: 'System Alert',
        message: `Alert triggered by sensor reading`,
      });
    }

    setAlerts(newAlerts);
  };

  useEffect(() => {
    // Subscribe to latest reading
    const unsubscribeLatest = subscribeToLatestReading((reading) => {
      console.log("📥 Dashboard received latest reading:", reading);
      
      const newData = {
        h2s: reading.h2s || 0,
        ch4: reading.ch4 || 0,
        waterLevel: reading.water || 0,
        alert: reading.alert || false,
        status: reading.status || 'Safe',
        battery: 95,
        location: {
          id: 'MH-1023',
          lat: 12.9692,
          lng: 79.1559,
        },
        lastUpdated: reading.timestamp ? reading.timestamp.toDate().toISOString() : new Date().toISOString(),
      };
      
      setData(newData);
      generateAlerts(reading);
      setIsLoading(false);
    });

    // Subscribe to historical data for charts
    const unsubscribeHistory = subscribeToReadings(20, (readings) => {
      console.log("📊 Dashboard received chart data, count:", readings.length);
      
      const chartReadings = readings.map((reading) => ({
        time: reading.timestamp ? formatChartTime(reading.timestamp) : 'N/A',
        h2s: reading.h2s || 0,
        ch4: reading.ch4 || 0,
        waterLevel: reading.water || 0,
      }));
      setChartData(chartReadings);
    });

    return () => {
      unsubscribeLatest();
      unsubscribeHistory();
    };
  }, []);

  // Log when data changes
  useEffect(() => {
    console.log("🔄 Dashboard DATA changed:", data);
  }, [data]);

  // Log when chart data changes
  useEffect(() => {
    console.log("📈 Dashboard CHART DATA changed, count:", chartData.length);
  }, [chartData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  Real-time Gas & Overflow Monitoring System
                  {isLoading ? (
                    <span className="ml-2 inline-block text-yellow-600">
                      • Connecting to Firebase...
                    </span>
                  ) : (
                    <span className="ml-2 inline-block text-green-600">
                      • 🔴 Live
                    </span>
                  )}
                </p>
              </div>
            </div>

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
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards Section */}
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
              unit="%LEL"
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
              status={data.status.toLowerCase() === 'safe' ? 'safe' : 'danger'}
              icon={FaHeartbeat}
            />
          </div>
        </section>

        {/* Charts Section */}
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
                  unit="%LEL"
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

        {/* Alerts and Info Section */}
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
            <DeviceHealthSection battery={data.battery} sensorStatus="Working" />
          </div>
        </section>

        {/* Location Panel */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Location & Metadata
          </h2>
          <LocationPanel
            location={data.location}
            lastUpdated={data.lastUpdated}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            © 2024 Smart Manhole Monitoring System | Data updates every 5 minutes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
