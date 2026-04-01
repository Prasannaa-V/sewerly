/**
 * Smart Manhole Gas & Overflow Monitoring System Dashboard
 * 
 * A professional React dashboard displaying real-time sensor data for
 * smart manhole monitoring with gas level detection and overflow warnings.
 * 
 * ============================================================================
 * PROJECT OVERVIEW
 * ============================================================================
 * 
 * This dashboard provides:
 * - Real-time H2S and CH4 gas monitoring
 * - Water level tracking with overflow detection
 * - Historical trend analysis via interactive charts
 * - Intelligent alert system with threshold-based warnings
 * - Device health monitoring (battery, sensors, connectivity)
 * - Location tracking and metadata display
 * - Fully responsive design for all devices
 * 
 * ============================================================================
 * INSTALLATION & SETUP
 * ============================================================================
 * 
 * 1. Install Node.js 16+ from https://nodejs.org/
 * 
 * 2. Install dependencies:
 *    npm install
 * 
 * 3. Start development server:
 *    npm run dev
 * 
 * 4. Open browser to http://localhost:3000
 * 
 * 5. Build for production:
 *    npm run build
 * 
 * ============================================================================
 * PROJECT STRUCTURE
 * ============================================================================
 * 
 * sewerly/
 * ├── src/
 * │   ├── components/
 * │   │   ├── Dashboard.jsx              Main dashboard orchestrator
 * │   │   ├── SummaryCard.jsx            Metric display cards
 * │   │   ├── ChartSection.jsx           Time-series chart wrapper
 * │   │   ├── AlertsSection.jsx          Alert display system
 * │   │   ├── LocationPanel.jsx          Location & metadata panel
 * │   │   └── DeviceHealthSection.jsx    Device health metrics
 * │   ├── utils/
 * │   │   ├── data.js                    Dummy data & thresholds
 * │   │   └── helpers.js                 Utility functions
 * │   ├── App.jsx                        Root component
 * │   ├── main.jsx                       React entry point
 * │   └── index.css                      Global styles & animations
 * ├── public/                            Static assets
 * ├── index.html                         HTML template
 * ├── package.json                       Dependencies
 * ├── vite.config.js                     Vite configuration
 * ├── tailwind.config.js                 Tailwind CSS config
 * ├── postcss.config.js                  PostCSS config
 * ├── .gitignore                         Git ignore rules
 * └── README.md                          Full documentation
 * 
 * ============================================================================
 * KEY COMPONENTS EXPLAINED
 * ============================================================================
 * 
 * 1. DASHBOARD.JSX (Main Component)
 * ─────────────────────────────────────
 * The orchestrator component that:
 * - Manages overall dashboard state
 * - Generates dummy data and alerts
 * - Handles data refresh functionality
 * - Renders all child components
 * - Provides responsive layout
 * 
 * Key State:
 * - data: Current sensor readings
 * - chartData: Time-series data for charts
 * - alerts: Active system alerts
 * - isRefreshing: UI feedback during refresh
 * 
 * Available Actions:
 * - handleRefresh(): Regenerates chart data
 * - generateAlerts(): Calculates active alerts
 * 
 * Example Usage:
 * <Dashboard />
 * 
 * ─────────────────────────────────────
 * 
 * 2. SUMMARYCARD.JSX
 * ─────────────────────────────────────
 * Displays a single metric with:
 * - Color-coded background (Green/Yellow/Red)
 * - Icon representation
 * - Value and unit display
 * - Status badge
 * 
 * Props:
 * {
 *   title: string        // e.g., "H2S Level"
 *   value: number        // e.g., 18
 *   unit: string         // e.g., "ppm"
 *   status: string       // "safe" | "warning" | "danger"
 *   icon: ReactComponent // e.g., FaGasPump
 * }
 * 
 * Example Usage:
 * <SummaryCard
 *   title="H2S Level"
 *   value={18}
 *   unit="ppm"
 *   status="warning"
 *   icon={FaGasPump}
 * />
 * 
 * ─────────────────────────────────────
 * 
 * 3. CHARTSECTION.JSX
 * ─────────────────────────────────────
 * Interactive line chart component using Recharts:
 * - Displays time-series data
 * - Responsive to container size
 * - Customizable colors and units
 * - Interactive tooltips and legends
 * - Smooth animations
 * 
 * Props:
 * {
 *   title: string        // Chart title
 *   data: array          // Time-series data points
 *   dataKey: string      // Data property to plot
 *   color: string        // Hex color code
 *   unit: string         // Y-axis unit label
 *   icon: ReactComponent // Chart title icon
 * }
 * 
 * Expected Data Format:
 * [
 *   { time: "14:30", h2s: 18, ch4: 45, waterLevel: 72 },
 *   { time: "14:35", h2s: 19, ch4: 46, waterLevel: 73 },
 *   ...
 * ]
 * 
 * Example Usage:
 * <ChartSection
 *   title="H2S Concentration"
 *   data={chartData}
 *   dataKey="h2s"
 *   color="#3b82f6"
 *   unit="ppm"
 *   icon={FaGasPump}
 * />
 * 
 * ─────────────────────────────────────
 * 
 * 4. ALERTSSECTION.JSX
 * ─────────────────────────────────────
 * Displays system alerts with:
 * - Severity indicators (Warning/Danger)
 * - Alert messages and descriptions
 * - "All Clear" message when no alerts
 * - Color-coded alert boxes
 * 
 * Props:
 * {
 *   alerts: array // Array of alert objects
 * }
 * 
 * Alert Object Format:
 * {
 *   status: "warning" | "danger",
 *   title: string,
 *   message: string
 * }
 * 
 * Example Usage:
 * <AlertsSection alerts={alerts} />
 * 
 * ─────────────────────────────────────
 * 
 * 5. LOCATIONPANEL.JSX
 * ─────────────────────────────────────
 * Displays location information:
 * - Manhole ID
 * - Latitude & Longitude
 * - Last update timestamp
 * - Map placeholder area
 * 
 * Props:
 * {
 *   location: {
 *     id: string,
 *     lat: number,
 *     lng: number
 *   },
 *   lastUpdated: string // ISO timestamp
 * }
 * 
 * Example Usage:
 * <LocationPanel
 *   location={{ id: "MH-1023", lat: 12.9692, lng: 79.1559 }}
 *   lastUpdated={new Date().toISOString()}
 * />
 * 
 * ─────────────────────────────────────
 * 
 * 6. DEVICEHEALTHSECTION.JSX
 * ─────────────────────────────────────
 * Monitors device health:
 * - Battery percentage (with visual progress)
 * - Sensor operational status
 * - Network signal strength
 * - Device uptime percentage
 * - Response time
 * 
 * Color Coding:
 * - Green (75-100%): Good
 * - Yellow (40-74%): Warning
 * - Red (0-39%): Critical
 * 
 * Props:
 * {
 *   battery: number // 0-100
 *   sensorStatus: string // "Working" | "Faulty"
 * }
 * 
 * Example Usage:
 * <DeviceHealthSection battery={78} sensorStatus="Working" />
 * 
 * ============================================================================
 * DATA STRUCTURE
 * ============================================================================
 * 
 * SENSOR DATA OBJECT (src/utils/data.js)
 * ─────────────────────────────────────
 * 
 * const sensorData = {
 *   h2s: 18,                           // Hydrogen sulfide in ppm
 *   ch4: 45,                           // Methane in %LEL
 *   waterLevel: 72,                    // Water level in cm
 *   status: 'Danger',                  // "Safe" | "Warning" | "Danger"
 *   battery: 78,                       // Battery % (0-100)
 *   location: {
 *     id: 'MH-1023',                   // Manhole identifier
 *     lat: 12.9692,                    // Latitude
 *     lng: 79.1559                     // Longitude
 *   },
 *   lastUpdated: '2024-04-02T10:30:00Z' // ISO timestamp
 * }
 * 
 * TIME-SERIES DATA ARRAY
 * ─────────────────────────────────────
 * Generated by generateTimeSeriesData() function:
 * 
 * [
 *   {
 *     time: "14:30",       // Formatted time string
 *     h2s: 18,             // Gas level at this time
 *     ch4: 45,             // Methane level at this time
 *     waterLevel: 72       // Water level at this time
 *   },
 *   ...
 * ]
 * 
 * THRESHOLD CONFIGURATION
 * ─────────────────────────────────────
 * 
 * export const thresholds = {
 *   h2sWarning: 15,         // ppm - Yellow alert
 *   h2sDanger: 20,          // ppm - Red alert
 *   ch4Warning: 40,         // %LEL - Yellow alert
 *   ch4Danger: 50,          // %LEL - Red alert
 *   waterLevelWarning: 70,  // cm - Yellow alert
 *   waterLevelDanger: 80    // cm - Red alert
 * }
 * 
 * ============================================================================
 * THRESHOLD LOGIC
 * ============================================================================
 * 
 * The getStatus() function determines alert level:
 * 
 * if (value >= dangerThreshold) {
 *   return 'danger'    // Red - Immediate action required
 * } else if (value >= warningThreshold) {
 *   return 'warning'   // Yellow - Monitor closely
 * } else {
 *   return 'safe'      // Green - Normal operation
 * }
 * 
 * Examples:
 * - H2S at 18 ppm: Safe (below 15 warning threshold)
 * - H2S at 25 ppm: Danger (above 20 danger threshold)
 * - CH4 at 45 %LEL: Warning (above 40 warning, below 50 danger)
 * - Water Level at 72 cm: Warning (above 70 warning, below 80 danger)
 * 
 * ============================================================================
 * STYLING SYSTEM
 * ============================================================================
 * 
 * TAILWIND CSS
 * ─────────────────────────────────────
 * The project uses Tailwind CSS utility classes for styling.
 * All responsive design uses Tailwind breakpoints:
 * 
 * - Mobile: sm (640px), md (768px)
 * - Tablet: lg (1024px)
 * - Desktop: xl (1280px), 2xl (1536px)
 * 
 * Custom Colors in tailwind.config.js:
 * - safe: #10b981 (Green for safe status)
 * - warning: #f59e0b (Yellow for warnings)
 * - danger: #ef4444 (Red for critical alerts)
 * 
 * ANIMATIONS
 * ─────────────────────────────────────
 * Custom animations defined in index.css:
 * - fadeIn: Opacity transition (0.5s)
 * - slideUp: Upward slide with fade (0.5s)
 * - card-transition: Hover effect with transform
 * 
 * CSS Classes:
 * - card-transition: Hover lift effect
 * - animate-fade-in: Fade in animation
 * - animate-slide-up: Slide up animation
 * 
 * ============================================================================
 * RESPONSIVE DESIGN
 * ============================================================================
 * 
 * MOBILE (< 768px)
 * ┌─────────────────┐
 * │   Summary Card  │ (Full width)
 * │   Summary Card  │
 * │   Summary Card  │
 * │   Summary Card  │
 * ├─────────────────┤
 * │  Chart 1 (Full) │
 * │  Chart 2 (Full) │
 * │  Chart 3 (Full) │
 * ├─────────────────┤
 * │   Alerts        │
 * │   Device Health │
 * ├─────────────────┤
 * │   Location      │
 * └─────────────────┘
 * 
 * TABLET (768px - 1024px)
 * ┌──────────┬──────────┐
 * │  Card 1  │  Card 2  │ (2 columns)
 * │  Card 3  │  Card 4  │
 * ├──────────┴──────────┤
 * │  Chart 1 | Chart 2  │ (Full width)
 * ├────────┬─────────┬──┤
 * │Chart3  │         │  │
 * ├────────┼─────────┼──┤
 * │ Alerts │         │  │
 * │ Device │  ...    │  │
 * └────────┴─────────┴──┘
 * 
 * DESKTOP (> 1024px)
 * ┌──────────┬──────────┬──────────┬──────────┐
 * │  Card 1  │  Card 2  │  Card 3  │  Card 4  │ (4 columns)
 * └──────────┴──────────┴──────────┴──────────┘
 * ┌────────────────────┬────────────────────┬────────────┐
 * │ Chart 1            │ Chart 2            │ Chart 3    │ (3 columns)
 * └────────────────────┴────────────────────┴────────────┘
 * ┌──────────────────────────────┬──────────────────┐
 * │ Alerts (2/3 width)           │ Device Health    │ (grid)
 * ├──────────────────────────────┴──────────────────┤
 * │ Location Panel (Full width)                    │
 * └──────────────────────────────────────────────────┘
 * 
 * ============================================================================
 * CUSTOMIZATION GUIDE
 * ============================================================================
 * 
 * 1. CHANGING SENSOR THRESHOLDS
 * ─────────────────────────────────────
 * Edit src/utils/data.js:
 * 
 * export const thresholds = {
 *   h2sWarning: 10,        // Lower warning threshold
 *   h2sDanger: 15,         // Lower danger threshold
 *   ch4Warning: 35,        // More strict
 *   ch4Danger: 40,
 *   waterLevelWarning: 60,
 *   waterLevelDanger: 75
 * }
 * 
 * 2. MODIFYING DUMMY DATA
 * ─────────────────────────────────────
 * Edit src/utils/data.js:
 * 
 * export const sensorData = {
 *   h2s: 25,                     // New initial value
 *   ch4: 60,
 *   waterLevel: 90,
 *   status: 'Critical',
 *   battery: 45,
 *   location: {
 *     id: 'MH-2000',             // New location
 *     lat: 13.0827,
 *     lng: 80.2707
 *   },
 *   lastUpdated: new Date().toISOString()
 * }
 * 
 * 3. CHANGING COLORS
 * ─────────────────────────────────────
 * Edit tailwind.config.js:
 * 
 * colors: {
 *   safe: '#00AA00',      // Different green
 *   warning: '#FF8800',   // Different orange
 *   danger: '#CC0000'     // Different red
 * }
 * 
 * 4. ADDING NEW METRICS
 * ─────────────────────────────────────
 * a) Add to sensorData in src/utils/data.js:
 *    co2: 200
 * 
 * b) Add to thresholds:
 *    co2Warning: 250,
 *    co2Danger: 500
 * 
 * c) Add to generateTimeSeriesData():
 *    co2: Math.floor(Math.random() * 400) + 100
 * 
 * d) Create new SummaryCard in Dashboard.jsx:
 *    const co2Status = getStatus(data.co2, 250, 500);
 *    <SummaryCard
 *      title="CO2 Level"
 *      value={data.co2}
 *      unit="ppm"
 *      status={co2Status}
 *      icon={FaGasPump}
 *    />
 * 
 * 5. INTEGRATING REAL DATA
 * ─────────────────────────────────────
 * Replace dummy data with API calls in Dashboard.jsx:
 * 
 * useEffect(() => {
 *   fetch('/api/manhole/MH-1023')
 *     .then(res => res.json())
 *     .then(data => setData(data))
 *     .catch(err => console.error(err));
 * }, []);
 * 
 * 6. CONNECTING TO WEBSOCKET
 * ─────────────────────────────────────
 * For live real-time updates:
 * 
 * useEffect(() => {
 *   const ws = new WebSocket('wss://your-server/sensor-stream');
 *   ws.onmessage = (event) => {
 *     const newData = JSON.parse(event.data);
 *     setData(newData);
 *     setChartData(prev => [...prev.slice(1), newData]);
 *   };
 *   return () => ws.close();
 * }, []);
 * 
 * ============================================================================
 * DEPENDENCIES
 * ============================================================================
 * 
 * - react@18.2.0               - UI framework
 * - react-dom@18.2.0           - DOM renderer
 * - recharts@2.10.0            - Chart library
 * - react-icons@5.0.1          - Icon library
 * - vite@5.0.0                 - Build tool
 * - @vitejs/plugin-react       - React plugin for Vite
 * - tailwindcss@3.4.0          - CSS framework
 * - postcss@8.4.31             - CSS processor
 * - autoprefixer@10.4.16       - CSS vendor prefixer
 * 
 * ============================================================================
 * BROWSER COMPATIBILITY
 * ============================================================================
 * 
 * Tested and supported in:
 * - Chrome 90+
 * - Firefox 88+
 * - Safari 14+
 * - Edge 90+
 * 
 * Requires ES2020+ JavaScript support
 * 
 * ============================================================================
 * PERFORMANCE TIPS
 * ============================================================================
 * 
 * 1. Use React.memo() for frequently rerendered components:
 *    export default React.memo(SummaryCard);
 * 
 * 2. Memoize expensive calculations:
 *    const alerts = useMemo(() => generateAlerts(), [data]);
 * 
 * 3. Lazy load charts for faster initial load:
 *    const ChartSection = React.lazy(() => import('./ChartSection'));
 * 
 * 4. Debounce window resize handlers:
 *    const debouncedResize = debounce(() => {...}, 300);
 * 
 * 5. Use production builds:
 *    npm run build        // Creates optimized bundle
 * 
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 * 
 * Q: Charts not showing?
 * A: Ensure chartData has length > 0. Check console for errors.
 *    Verify data format matches expected structure.
 * 
 * Q: Styling looks wrong?
 * A: Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
 *    Rebuild Tailwind CSS: npm run dev
 * 
 * Q: Colors not matching?
 * A: Check getStatusColor() in src/utils/helpers.js
 *    Verify tailwind.config.js color definitions
 * 
 * Q: Refresh button not working?
 * A: Check browser console for JavaScript errors
 *    Verify generateTimeSeriesData() returns valid array
 * 
 * Q: Mobile view broken?
 * A: Test with browser DevTools device toolbar
 *    Check Tailwind responsive classes (sm:, md:, lg:)
 * 
 * ============================================================================
 * DEPLOYMENT
 * ============================================================================
 * 
 * BUILD FOR PRODUCTION:
 * npm run build
 * 
 * OUTPUT: dist/ folder (optimized, minimized bundle)
 * 
 * DEPLOY TO:
 * - Vercel (git connect)
 * - Netlify (drag & drop dist/)
 * - GitHub Pages (run build, push dist/)
 * - Any static host (upload dist/ contents)
 * 
 * ENVIRONMENT VARIABLES:
 * Create .env.production file:
 * VITE_API_URL=https://api.example.com
 * VITE_WS_URL=wss://websocket.example.com
 * 
 * ============================================================================
 * FURTHER ENHANCEMENTS
 * ============================================================================
 * 
 * Consider adding:
 * ✓ Real-time data via WebSocket/API
 * ✓ User authentication (JWT)
 * ✓ Multiple location dashboard
 * ✓ PDF/CSV export functionality
 * ✓ Historical data analysis
 * ✓ Email/SMS alert notifications
 * ✓ Customizable dashboard layout
 * ✓ Dark mode toggle
 * ✓ Real map integration (Google Maps, Mapbox)
 * ✓ Mobile app version (React Native)
 * ✓ Advanced data filtering
 * ✓ Prediction/forecasting (ML)
 * ✓ Multi-language support
 * ✓ Role-based access control
 * 
 * ============================================================================
 * LICENSE & ATTRIBUTION
 * ============================================================================
 * 
 * MIT License - Free for personal and commercial use
 * 
 * Built with:
 * - React (facebook.com/react)
 * - Vite (vitejs.dev)
 * - Tailwind CSS (tailwindcss.com)
 * - Recharts (recharts.org)
 * - React Icons (react-icons.github.io/react-icons)
 * 
 * ============================================================================
 * SUPPORT & DOCUMENTATION
 * ============================================================================
 * 
 * For more information:
 * - React Docs: https://react.dev
 * - Vite Docs: https://vitejs.dev
 * - Tailwind Docs: https://tailwindcss.com/docs
 * - Recharts Docs: https://recharts.org
 * - React Icons: https://react-icons.github.io/react-icons
 * 
 * ============================================================================
 * 
 * Last Updated: April 2024
 * Version: 1.0.0
 * 
 * ============================================================================
 */
