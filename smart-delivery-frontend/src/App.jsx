import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// import customized components
import Navbar from './Components/NavBar';
import ProtectedRoute from './Components/ProtectedRoute';

// import pages
import Login from './Pages/Login';
import DeliveryDashboard from './Pages/DeliveryDashboard';
import MapDashboard from './Pages/MapDashboard';
import CourierDashboard from './Pages/CourierDashboard';

function App() {
  return (
    <div style={styles.appContainer}>
      {/* הגדרת ה-Toaster עם העיצוב הכהה שלך */}
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            fontSize: '14px',
            fontFamily: 'Heebo, sans-serif',
            direction: 'rtl'
          },
        }} 
      />
      
      <Router>
        <Routes>
          {/* דף לוגין - נקי בלי Navbar */}
          <Route path="/" element={<Login />} />

          {/* דפי מנהל - עטופים ב-Layout המשותף */}
          <Route path="/deliveries" element={
            <ProtectedRoute allowedRole="Admin">
              <Navbar />
              <div style={styles.contentArea}><DeliveryDashboard /></div>
            </ProtectedRoute>
          } />

          <Route path="/map" element={
            <ProtectedRoute allowedRole="Admin">
              <Navbar />
              <div style={styles.contentArea}><MapDashboard /></div>
            </ProtectedRoute>
          } />

          {/* דף שליח - עטוף ב-Layout המשותף */}
          <Route path="/courier" element={
            <ProtectedRoute allowedRole="Courier">
              <Navbar />
              <div style={styles.contentArea}><CourierDashboard /></div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    fontFamily: "'Heebo', 'Inter', sans-serif",
    direction: 'rtl',
    display: 'flex',
    flexDirection: 'column',
  },
 contentArea: {
    flex: 1, 
    overflowY: 'auto', 
    width: '100%',
    position: 'relative',
  }
};

export default App;