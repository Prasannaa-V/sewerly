# Quick Start Guide

## 🚀 Get Started in 60 Seconds

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Your dashboard will open at `http://localhost:3000`

---

## 📦 What's Included

✅ **Fully functional React dashboard**
✅ **Responsive design (mobile, tablet, desktop)**
✅ **Interactive charts with Recharts**
✅ **Real-time alert system**
✅ **Color-coded status indicators**
✅ **Device health monitoring**
✅ **Location tracking and metadata**
✅ **Smooth animations and transitions**
✅ **Professional styling with Tailwind CSS**

---

## 🎨 Key Components

| Component | Purpose |
|-----------|---------|
| **Dashboard** | Main container with all sections |
| **SummaryCard** | Displays key metrics with color coding |
| **ChartSection** | Interactive time-series charts |
| **AlertsSection** | Displays system alerts and warnings |
| **LocationPanel** | Shows manhole location and metadata |
| **DeviceHealthSection** | Battery, sensor status, uptime metrics |

---

## 📊 Dummy Data

The dashboard uses static dummy data located in `src/utils/data.js`:

```javascript
const sensorData = {
  h2s: 18,              // ppm
  ch4: 45,              // %LEL
  waterLevel: 72,       // cm
  status: 'Danger',
  battery: 78,          // %
  location: {
    id: 'MH-1023',
    lat: 12.9692,
    lng: 79.1559
  },
  lastUpdated: timestamp
};
```

---

## 🎯 Threshold Configuration

All alert thresholds are configurable in `src/utils/data.js`:

```javascript
export const thresholds = {
  h2sWarning: 15,              // ppm
  h2sDanger: 20,               // ppm
  ch4Warning: 40,              // %LEL
  ch4Danger: 50,               // %LEL
  waterLevelWarning: 70,       // cm
  waterLevelDanger: 80,        // cm
};
```

---

## 🔄 Data Refresh

Click the **refresh button** in the top-right corner to regenerate chart data with new dummy values.

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column, full-width cards)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns, optimal layout)

---

## 🎨 Color Scheme

| Status | Color | Hex |
|--------|-------|-----|
| **Safe** | Green | #10b981 |
| **Warning** | Yellow | #f59e0b |
| **Danger** | Red | #ef4444 |

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally
```

---

## 📝 Key Files & Their Roles

```
src/
├── App.jsx                      # Root component
├── main.jsx                     # React entry point
├── index.css                    # Global styles & animations
├── components/
│   ├── Dashboard.jsx            # Main dashboard orchestrator
│   ├── SummaryCard.jsx          # Metric cards (H2S, CH4, Water, Status)
│   ├── ChartSection.jsx         # Line chart wrapper
│   ├── AlertsSection.jsx        # Alert system
│   ├── LocationPanel.jsx        # Location info & map placeholder
│   └── DeviceHealthSection.jsx  # Battery & sensor status
└── utils/
    ├── data.js                  # Dummy data & thresholds
    └── helpers.js               # Color & status utilities
```

---

## 💡 Tips & Tricks

### Add Real Data
Replace dummy data functions with API calls:
```javascript
useEffect(() => {
  fetch('/api/sensor-data')
    .then(res => res.json())
    .then(data => setData(data));
}, []);
```

### Integrate Real Maps
Replace the map placeholder with Google Maps or Mapbox:
```javascript
import MapComponent from './components/Map';
// Use in LocationPanel
```

### Add Notifications
Integrate with toast libraries for alerts:
```bash
npm install react-toastify
```

### Live Data Updates
Add WebSocket for real-time data:
```javascript
const ws = new WebSocket('wss://your-server/sensor-stream');
```

---

## 🚦 Dashboard Status Meanings

- **Safe (Green)**: All metrics within normal ranges
- **Warning (Yellow)**: One or more metrics approaching danger threshold
- **Danger (Red)**: Critical threshold exceeded, immediate action needed

---

## 📞 Need Help?

Refer to:
- Component JSDoc comments
- `src/utils/data.js` for data structure
- `src/utils/helpers.js` for status logic
- Recharts documentation at https://recharts.org

---

## 🎉 You're All Set!

Your professional manhole monitoring dashboard is ready to use, customize, and deploy!

Enjoy! 🚀
