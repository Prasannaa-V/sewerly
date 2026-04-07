import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// Your Firebase config from console
const firebaseConfig = {
  apiKey: "AIzaSyAqnKC6xyFfGvHL0YamgCaplRqJziF-DrQ",
  authDomain: "manhole-monitoring-e5d2b.firebaseapp.com",
  projectId: "manhole-monitoring-e5d2b",
  storageBucket: "manhole-monitoring-e5d2b.firebasestorage.app",
  messagingSenderId: "245980207661",
  appId: "1:245980207661:web:06fa49c76520163a9576a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

console.log("🔥 Firebase initialized");

// Subscribe to latest sensor reading
export const subscribeToLatestReading = (callback) => {
  console.log("📡 Subscribing to latest readings...");
  
  const q = query(
    collection(db, "sensor_readings"),
    orderBy("timestamp", "desc"),
    limit(1)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log("✅ Latest reading:", data);
        
        callback({
          id: doc.id,
          ...data,
          status: getStatusFromReading(data),
        });
      } else {
        console.warn("⚠️  No readings found in Firestore");
      }
    },
    (error) => {
      console.error("❌ Firestore error:", error);
    }
  );
};

// Subscribe to last N readings for charts
export const subscribeToReadings = (numReadings = 20, callback) => {
  console.log(`📊 Subscribing to last ${numReadings} readings...`);
  
  const q = query(
    collection(db, "sensor_readings"),
    orderBy("timestamp", "desc"),
    limit(numReadings)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      
      console.log(`📈 Received ${data.length} readings for chart`);
      callback(data);
    },
    (error) => {
      console.error("❌ Chart subscription error:", error);
    }
  );
};

// Determine status based on sensor values
export const getStatusFromReading = (data) => {
  const h2sValue = data.h2s || 0;
  const ch4Value = data.ch4 || 0;
  const alertValue = data.alert || false;

  if (alertValue || h2sValue > 15 || ch4Value > 1000) {
    return "Danger";
  } else if (h2sValue > 10 || ch4Value > 500) {
    return "Warning";
  }
  return "Safe";
};

// Convert Firestore timestamp to readable format
export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "N/A";
  }
};

// Convert Firestore timestamp to chart time format
export const formatChartTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
