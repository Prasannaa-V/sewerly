import React from 'react';
import { FiBattery, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const DeviceHealthSection = ({ battery, sensorStatus }) => {
  const isHealthy = sensorStatus === 'Working';
  const batteryStatus =
    battery >= 75 ? 'good' : battery >= 40 ? 'warning' : 'critical';

  return (
    <div className="card-transition animate-slide-up rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-gray-800">Device Health</h3>

      <div className="space-y-6">
        {/* Battery Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBattery size={18} className="text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Battery Level</p>
            </div>
            <p className="text-sm font-bold text-gray-800">{battery}%</p>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                batteryStatus === 'good'
                  ? 'bg-green-500'
                  : batteryStatus === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${battery}%` }}
            ></div>
          </div>

          <p className="mt-2 text-xs text-gray-600">
            {batteryStatus === 'good'
              ? 'Battery in good condition'
              : batteryStatus === 'warning'
                ? 'Battery low, consider charging soon'
                : 'Battery critical, charge immediately'}
          </p>
        </div>

        {/* Sensor Status Section */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isHealthy ? (
                <FiCheckCircle size={24} className="text-green-600" />
              ) : (
                <FiAlertCircle size={24} className="text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Sensor Status
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    isHealthy ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {sensorStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Health Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Signal
            </p>
            <p className="mt-2 text-lg font-bold text-gray-800">Strong</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Uptime
            </p>
            <p className="mt-2 text-lg font-bold text-gray-800">99.8%</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Response
            </p>
            <p className="mt-2 text-lg font-bold text-gray-800">120ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceHealthSection;
