// Dummy sensor data - generates 50% safe, 50% unsafe readings
export const generateSensorData = () => {
  const isSafe = Math.random() > 0.5;
  
  let h2s, ch4, waterLevel, status;
  
  if (isSafe) {
    // Safe readings (50%)
    h2s = Math.floor(Math.random() * 12) + 2;      // 2-14 ppm
    ch4 = Math.floor(Math.random() * 20) + 5;      // 5-25 %LEL
    waterLevel = Math.floor(Math.random() * 30) + 20; // 20-50 cm
    status = 'Safe';
  } else {
    // Unsafe readings (50%)
    const dangerLevel = Math.random() > 0.5;
    
    if (dangerLevel) {
      // Danger readings
      h2s = Math.floor(Math.random() * 15) + 25;   // 25-40 ppm (DANGER)
      ch4 = Math.floor(Math.random() * 30) + 55;   // 55-85 %LEL (DANGER)
      waterLevel = Math.floor(Math.random() * 15) + 85; // 85-100 cm (DANGER)
      status = 'Danger';
    } else {
      // Warning readings
      h2s = Math.floor(Math.random() * 5) + 16;    // 16-21 ppm (WARNING)
      ch4 = Math.floor(Math.random() * 10) + 42;   // 42-52 %LEL (WARNING)
      waterLevel = Math.floor(Math.random() * 10) + 72; // 72-82 cm (WARNING)
      status = 'Warning';
    }
  }
  
  return {
    h2s,
    ch4,
    waterLevel,
    status,
    battery: Math.floor(Math.random() * 40) + 60, // 60-100%
    location: {
      id: 'MH-1023',
      lat: 12.9692,
      lng: 79.1559,
    },
    lastUpdated: new Date().toISOString(),
  };
};

export const sensorData = generateSensorData();

// Generate time series data for charts (50% safe, 50% unsafe)
export const generateTimeSeriesData = () => {
  const now = new Date();
  const data = [];

  for (let i = 19; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60000);
    const isSafe = Math.random() > 0.5;
    
    let h2s, ch4, waterLevel;
    
    if (isSafe) {
      // Safe values
      h2s = Math.floor(Math.random() * 12) + 2;
      ch4 = Math.floor(Math.random() * 20) + 5;
      waterLevel = Math.floor(Math.random() * 30) + 20;
    } else {
      // Unsafe values (mix of warning and danger)
      const isDanger = Math.random() > 0.5;
      if (isDanger) {
        h2s = Math.floor(Math.random() * 15) + 25;
        ch4 = Math.floor(Math.random() * 30) + 55;
        waterLevel = Math.floor(Math.random() * 15) + 85;
      } else {
        h2s = Math.floor(Math.random() * 5) + 16;
        ch4 = Math.floor(Math.random() * 10) + 42;
        waterLevel = Math.floor(Math.random() * 10) + 72;
      }
    }
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      h2s,
      ch4,
      waterLevel,
    });
  }

  return data;
};

// Threshold values
export const thresholds = {
  h2sWarning: 15,
  h2sDanger: 20,
  ch4Warning: 40,
  ch4Danger: 50,
  waterLevelWarning: 70,
  waterLevelDanger: 80,
};
