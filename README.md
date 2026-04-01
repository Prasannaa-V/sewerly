# Smart Manhole Gas & Overflow Monitoring System Dashboard

A professional, responsive React dashboard for real-time monitoring of smart manhole gas levels and water overflow. Built with modern web technologies for optimal performance and user experience.

## Features

✨ **Real-Time Monitoring**
- Live H2S (Hydrogen Sulfide) level tracking
- CH4 (Methane) concentration monitoring
- Water level detection
- System status overview

📊 **Visual Analytics**
- Interactive line charts showing 20-point historical trends
- Color-coded status indicators (Green/Yellow/Red)
- Responsive design for desktop, tablet, and mobile
- Smooth animations and transitions

🚨 **Intelligent Alerts**
- Threshold-based warning system
- Critical danger level notifications
- Real-time alert display with detailed messages
- Automatic categorization by severity

📍 **Location & Device Info**
- Manhole GPS coordinates
- Device ID tracking
- Last update timestamp
- Map placeholder integration

⚙️ **Device Health Monitoring**
- Battery level indicator with visual progress bar
- Sensor status (Working/Faulty)
- Network signal strength
- Device uptime statistics

## Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: React Icons
- **Language**: JavaScript with JSX

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── SummaryCard.jsx        # Summary metric cards
│   │   ├── ChartSection.jsx       # Chart components
│   │   ├── AlertsSection.jsx      # Alerts display
│   │   ├── LocationPanel.jsx      # Location info panel
│   │   └── DeviceHealthSection.jsx # Device health metrics
│   ├── utils/
│   │   ├── data.js                # Dummy data and generators
│   │   └── helpers.js             # Utility functions
│   ├── App.jsx                    # Main App component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn

### Steps

1. **Clone or download the project**
   ```bash
   cd sewerly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The dashboard will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## Features Breakdown

### 1. Summary Cards
- 4 main metric cards displaying:
  - H2S Level (ppm)
  - CH4 Level (%LEL)
  - Water Level (cm)
  - Overall System Status
- Color coding: Green (Safe), Yellow (Warning), Red (Danger)
- Icons and status badges for quick visual assessment

### 2. Historical Trends
- 3 separate line charts showing:
  - H2S concentration over time
  - CH4 levels over time
  - Water level over time
- Dummy data generated for 20 readings at 5-minute intervals
- Interactive tooltips and legends
- Responsive height adjustment

### 3. Alert System
- Intelligent threshold-based warnings:
  - H2S > 20 ppm → Critical
  - H2S > 15 ppm → Warning
  - CH4 > 50 %LEL → Critical
  - CH4 > 40 %LEL → Warning
  - Water > 80 cm → Critical
  - Water > 70 cm → Warning
- Clean alert cards with severity indicators
- "All Clear" message when no alerts

### 4. Location & Metadata
- Displays manhole ID (MH-1023)
- Latitude and longitude coordinates
- Timestamp of last data update
- Map visualization placeholder

### 5. Device Health
- Battery percentage with color-coded progress bar
- Sensor operational status
- Network signal strength
- Device uptime percentage
- Response time monitoring

## Customization

### Changing Thresholds
Edit `src/utils/data.js`:
```javascript
export const thresholds = {
  h2sWarning: 15,
  h2sDanger: 20,
  ch4Warning: 40,
  ch4Danger: 50,
  waterLevelWarning: 70,
  waterLevelDanger: 80,
};
```

### Modifying Dummy Data
Edit the `sensorData` object in `src/utils/data.js` to adjust initial values.

### Color Scheme
Custom Tailwind colors defined in `tailwind.config.js`:
- `safe`: #10b981 (Green)
- `warning`: #f59e0b (Yellow)
- `danger`: #ef4444 (Red)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Features

- Smooth animations and transitions
- Optimized re-renders with React hooks
- Responsive images and SVG icons
- Lazy-loaded charts
- Minimal CSS footprint with Tailwind

## Future Enhancements

- Live data integration via WebSocket/API
- Real map integration (Google Maps, Mapbox)
- Data export functionality (PDF, CSV)
- Historical data analysis
- Multi-location dashboard view
- User authentication
- Notification push system
- Mobile app adaptation

## License

MIT License - Feel free to use this dashboard in your projects!

## Support

For issues or questions, please refer to the code comments and documentation within each component.

---

Built with ❤️ for smart city monitoring systems.
