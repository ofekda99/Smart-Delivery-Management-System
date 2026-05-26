import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// import customized components
//import NavBar from './Components/NavBar';
import NavBar from './Components/navbar';
import ProtectedRoute from './Components/ProtectedRoute';

// import pages
import Login from './Pages/Login';
import DeliveryDashboard from './Pages/DeliveryDashboard';
import MapDashboard from './Pages/MapDashboard';
import CourierDashboard from './Pages/CourierDashboard';
import AIChatBox from './Components/AIChatBox';

function App() {
  // פונקציית רענון גלובלית ששולחת "אות" לכל הדפים
  const notifyDataChange = () => {
    console.log("Global signal: Data updated by AI");
    // שולח אירוע שכל קומפוננטה באתר יכולה להקשיב לו
    window.dispatchEvent(new Event('refreshData'));
  };

  return (
    <div style={styles.appContainer}>
      <Toaster position="bottom-center" toastOptions={{ /* ... הסטייל שלך ... */ }} />
      
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* הסרנו את /ai כדף נפרד כי הוא הופך לווידג'ט צף */}

          <Route path="/deliveries" element={
            <ProtectedRoute allowedRole="Admin">
              <NavBar />
              <div style={styles.contentArea}><DeliveryDashboard /></div>
            </ProtectedRoute>
          } />

          <Route path="/map" element={
            <ProtectedRoute allowedRole="Admin">
              <NavBar />
              <div style={styles.contentArea}><MapDashboard /></div>
            </ProtectedRoute>
          } />

          <Route path="/courier" element={
            <ProtectedRoute allowedRole="Courier">
              <NavBar />
              <div style={styles.contentArea}><CourierDashboard /></div>
            </ProtectedRoute>
          } />
        </Routes>

        {/* ה-AIChatBox נמצא כאן - הוא יופיע בכל דף חוץ מבלוגין (אפשר להוסיף תנאי אם רוצים) */}
        <AIChatBox onDataChange={notifyDataChange} />
      </Router>
    </div>
  );
};

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
