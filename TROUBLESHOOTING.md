# Troubleshooting & FAQ Guide

## ❓ Frequently Asked Questions

### Installation & Setup

#### Q1: I'm getting "npm: command not found"
**A:** Node.js is not installed.
1. Download from https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Restart your terminal
4. Verify: `node --version` and `npm --version`

#### Q2: "npm install" is very slow
**A:** Use npm cache clean or try a different package registry:
```bash
npm cache clean --force
npm install --save-registry https://registry.npmjs.org/
```

#### Q3: I get module not found errors after npm install
**A:** Try these steps:
```bash
rm -rf node_modules          # Delete folder
rm package-lock.json          # Delete lock file
npm install                   # Fresh install
npm run dev                   # Try again
```

#### Q4: Port 3000 is already in use
**A:** Either close other apps using port 3000 or use a different port:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port in vite.config.js:
server: {
  port: 3001,  // Changed from 3000
  open: true
}
```

---

### Running the Dashboard

#### Q5: Dashboard shows blank page
**A:** Check browser console (F12):
1. Click Console tab
2. Look for red error messages
3. Common fixes:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Check if vite dev server is running
   - Verify no JavaScript errors

#### Q6: Charts not appearing
**A:** 
1. Verify chartData has length > 0: Open DevTools → console
2. Check data format matches expected structure
3. Recharts requires valid data array:
   ```javascript
   [
     { time: "14:30", h2s: 18, ch4: 45, waterLevel: 72 },
     { time: "14:35", h2s: 19, ch4: 46, waterLevel: 73 }
   ]
   ```
4. Try clicking refresh button to regenerate data

#### Q7: Styling looks broken/wrong
**A:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh page: Ctrl+Shift+R
3. Rebuild Tailwind CSS:
   ```bash
   npm run dev  # Restarts build system
   ```
4. Check browser console for CSS errors
5. Verify tailwind.config.js has correct content paths

#### Q8: Refresh button doesn't work
**A:**
1. Check browser console for JavaScript errors (F12)
2. Verify generateTimeSeriesData() is being called
3. Try browser refresh (F5)
4. Check for any error messages in terminal

---

### Customization Issues

#### Q9: I modified the data but changes don't show
**A:**
1. Save your file (Ctrl+S)
2. Browser should auto-hot-reload
3. If not, manually refresh browser (F5)
4. Check that file was actually saved
5. Verify no syntax errors in JavaScript

#### Q10: Cards are not showing correct colors
**A:** Check your status values:
1. Open DevTools → Console
2. Log the status value: `console.log(status)`
3. Verify it's exactly "safe", "warning", or "danger" (lowercase)
4. Check getStatusColor() function in helpers.js
5. Verify CSS classes match Tailwind colors

#### Q11: Cards look weird on mobile
**A:** Test with DevTools mobile simulation:
1. Press F12 to open DevTools
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Test on different device sizes
4. Check responsive classes: sm:, md:, lg:
5. May need to adjust grid columns in Grid section

#### Q12: Colors look different than expected
**A:** Tailwind might not be compiling:
```bash
# Stop dev server (Ctrl+C)
npm cache clean --force
npm run dev  # Restart
```
Or manually rebuild CSS by touching tailwind.config.js.

---

### Data & Thresholds

#### Q13: How do I change the alert thresholds?
**A:** Edit `src/utils/data.js`:
```javascript
export const thresholds = {
  h2sWarning: 10,      // Change from 15
  h2sDanger: 15,       // Change from 20
  ch4Warning: 30,      // Change from 40
  ch4Danger: 40,       // Change from 50
  waterLevelWarning: 60,   // Change from 70
  waterLevelDanger: 75     // Change from 80
}
```
Then refresh browser or restart dev server.

#### Q14: How do I add a new metric (e.g., CO2)?
**A:** 4-step process:
1. Add to data.js - sensorData object:
   ```javascript
   co2: 150  // Add this
   ```

2. Add to thresholds:
   ```javascript
   co2Warning: 200,
   co2Danger: 400
   ```

3. Add to generateTimeSeriesData():
   ```javascript
   co2: Math.floor(Math.random() * 300) + 50
   ```

4. Create SummaryCard in Dashboard.jsx:
   ```javascript
   const co2Status = getStatus(data.co2, 200, 400);
   <SummaryCard
     title="CO2 Level"
     value={data.co2}
     unit="ppm"
     status={co2Status}
     icon={FaGasPump}
   />
   ```

#### Q15: How do I use real data instead of dummy data?
**A:** Replace dummy data with API call:
```javascript
// In Dashboard.jsx useEffect:
useEffect(() => {
  fetch('/api/manhole/MH-1023')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setChartData(data.history);
    })
    .catch(err => console.error(err));
}, []);
```

---

### Performance Issues

#### Q16: Dashboard is slow or sluggish
**A:** Try these optimization steps:
1. Use production build: `npm run build`
2. Reduce chart animation: Change isAnimationActive={true} to false
3. Use React.memo() on components
4. Check DevTools Performance tab
5. Close other browser tabs
6. Disable browser extensions
7. Use Chrome DevTools Lighthouse

#### Q17: Charts are laggy when hovering
**A:** 
1. Reduce the number of data points (20 → 10)
2. Disable animations:
   ```javascript
   <Line isAnimationActive={false} ... />
   ```
3. Use lighter colors or simpler styling
4. Check if too many rerenders: React DevTools Profiler

#### Q18: High memory usage
**A:**
1. Stop dev server and restart
2. Clear browser cache
3. Close DevTools (can use memory)
4. Close unused browser tabs
5. Rebuild project: `npm run build`

---

### Styling & Design

#### Q19: How do I change the color scheme?
**A:** Edit `tailwind.config.js`:
```javascript
colors: {
  safe: '#00CC00',      // New green
  warning: '#FF9900',   // New orange
  danger: '#FF0000'     // New red
}
```
Restart dev server to apply.

#### Q20: Can I add dark mode?
**A:** Tailwind supports dark mode:
```javascript
// In tailwind.config.js
darkMode: 'class',  // Add this

// In HTML or toggle:
<div className="dark">
  {/* Dark mode content */}
</div>
```

#### Q21: How do I add custom fonts?
**A:** Add to `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

body {
  font-family: 'Poppins', sans-serif;
}
```

#### Q22: How do I adjust spacing/padding?
**A:** Use Tailwind utilities in JSX:
```javascript
// More padding
<div className="p-8">  {/* Instead of p-6 */}

// More margin
<h2 className="mb-6">  {/* Instead of mb-4 */}

// Custom spacing
<div className="space-y-8">  {/* Larger gap */}
```

---

### Features & Functionality

#### Q23: How do I add email alerts?
**A:** Integrate Nodemailer or third-party service:
```javascript
// Send alert when danger detected
if (status === 'danger') {
  fetch('/api/send-alert', {
    method: 'POST',
    body: JSON.stringify({ 
      alert: 'High H2S detected',
      level: data.h2s 
    })
  });
}
```

#### Q24: How do I add real maps?
**A:** Replace map placeholder with Google Maps:
```bash
npm install @react-google-maps/api
```
Then use in LocationPanel.jsx.

#### Q25: How do I save/export data?
**A:** Add export button and data download:
```javascript
const downloadCSV = () => {
  const csv = chartData.map(d => `${d.time},${d.h2s},${d.ch4},${d.waterLevel}`);
  const blob = new Blob([csv.join('\n')]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sensor-data.csv';
  a.click();
};
```

#### Q26: How do I add WebSocket for live updates?
**A:** In useEffect:
```javascript
useEffect(() => {
  const ws = new WebSocket('wss://your-server/sensor-stream');
  
  ws.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    setData(newData);
    // Update charts
    setChartData(prev => [...prev.slice(1), newData]);
  };
  
  return () => ws.close();
}, []);
```

---

### Deployment

#### Q27: How do I deploy to production?
**A:** Build and deploy:
```bash
npm run build           # Creates dist/ folder
# Then upload dist/ to your hosting:
# - Vercel: Connect GitHub repo
# - Netlify: Drag dist/ folder
# - GitHub Pages: Push dist/ folder
```

#### Q28: How do I deploy to Vercel?
**A:**
1. Push code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Select your GitHub repo
5. Vercel auto-detects Vite and builds
6. Your app is live!

#### Q29: How do I set environment variables?
**A:** Create `.env.production.local`:
```
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com
```
Or set in hosting platform's dashboard.

#### Q30: Why is build size large?
**A:** Optimize:
```bash
npm run build -- --analyze  # See bundle size
```
Then:
- Remove unused dependencies
- Code split components
- Tree-shake unused code

---

## 🆘 Error Messages Explained

### "Cannot find module 'react'"
**Cause:** Dependencies not installed  
**Fix:** `npm install`

### "Port 3000 is already in use"
**Cause:** Another app using same port  
**Fix:** Kill process or use different port

### "Vite config not found"
**Cause:** vite.config.js missing  
**Fix:** Recreate from project files

### "Tailwind CSS not compiling"
**Cause:** Build issue  
**Fix:** Restart dev server (Ctrl+C, then npm run dev)

### "API endpoint 404"
**Cause:** Wrong URL or API down  
**Fix:** Check URL and API availability

### "Chart data undefined"
**Cause:** generateTimeSeriesData() failing  
**Fix:** Check data format and error console

### "Browser console shows warnings"
**Cause:** Usually from third-party libraries  
**Fix:** Usually safe to ignore, check if functionality works

---

## ✅ Quick Troubleshooting Checklist

- [ ] Node.js and npm installed? (`node -v`, `npm -v`)
- [ ] Dependencies installed? (`npm install`)
- [ ] Dev server running? (`npm run dev`)
- [ ] Browser cache cleared? (Ctrl+Shift+Delete)
- [ ] Page hard refreshed? (Ctrl+Shift+R)
- [ ] Browser console checked? (F12)
- [ ] Files properly saved? (Ctrl+S)
- [ ] No syntax errors? (Check terminal output)
- [ ] Correct breakpoints for responsive? (F12 device toolbar)
- [ ] Tailwind classes valid? (Check tailwind.config.js)

---

## 🤝 Getting Help

### Resources
1. **Project Docs**: Read DOCUMENTATION.md
2. **Quick Start**: Check QUICKSTART.md  
3. **Feature Guide**: See FEATURE_SHOWCASE.md
4. **Code Comments**: Check component JSDoc
5. **External Help**:
   - React: https://react.dev
   - Vite: https://vitejs.dev
   - Tailwind: https://tailwindcss.com/docs
   - Recharts: https://recharts.org/guide

### Still Stuck?
1. Take a screenshot of the error
2. Check browser console (F12)
3. Try the Quick Troubleshooting Checklist above
4. Review relevant component code
5. Check similar project issues online
6. Ask in relevant community forums

---

## 🎯 Before Giving Up

1. ✅ Restart dev server (Ctrl+C, then `npm run dev`)
2. ✅ Clear all caches (browser, npm, node_modules)
3. ✅ Check error messages carefully (copy them!)
4. ✅ Try in different browser (Chrome, Firefox, etc.)
5. ✅ Restart your computer (sometimes helps)
6. ✅ Review the DOCUMENTATION.md file again
7. ✅ Compare your code with original files

---

## 💡 Pro Debugging Tips

### Use Browser DevTools
```
F12 = Open DevTools
Ctrl+Shift+J = Open Console
Ctrl+Shift+I = Open Inspector
```

### Check React Component State
```javascript
// Add console.log to debug
console.log('Current data:', data);
console.log('Alert status:', alerts);
console.log('Chart data length:', chartData.length);
```

### Use Chrome React DevTools Extension
1. Install from Chrome Web Store
2. Open DevTools
3. Go to "React" tab
4. Inspect component props and state

### Network Tab (API Issues)
1. Open DevTools
2. Go to "Network" tab
3. Perform action
4. Check API responses

---

## 🎉 You're All Set!

If you've read through this guide and still have issues, you're well-prepared to:
1. Find the problem
2. Understand the error
3. Implement the fix
4. Move forward

Good luck with your dashboard! 🚀
