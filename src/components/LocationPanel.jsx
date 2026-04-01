import React from 'react';
import { FiMapPin, FiClock } from 'react-icons/fi';
import { formatTime } from '../utils/helpers';

const LocationPanel = ({ location, lastUpdated }) => {
  return (
    <div className="card-transition animate-slide-up rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <FiMapPin size={20} className="text-blue-600" />
        Location & Info
      </h3>

      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-600">
            Manhole ID
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {location.id}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Latitude
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-gray-800">
              {location.lat.toFixed(4)}°
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Longitude
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-gray-800">
              {location.lng.toFixed(4)}°
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <FiClock size={16} className="text-gray-400" />
            <p className="text-xs uppercase tracking-wide text-gray-600">
              Last Updated
            </p>
          </div>
          <p className="mt-2 font-mono text-sm font-semibold text-gray-800">
            {formatTime(lastUpdated)}
          </p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mt-6 w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <FiMapPin size={32} className="text-blue-400" />
          <p className="text-sm text-blue-600 font-medium">
            Map placeholder
          </p>
          <p className="text-xs text-blue-500">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPanel;
