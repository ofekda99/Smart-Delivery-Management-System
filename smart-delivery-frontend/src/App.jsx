import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import DeliveryDashboard from './Pages/DeliveryDashboard';
import MapDashboard from './Pages/MapDashboard';
import { LayoutGrid, Map as MapIcon, Box } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      {/* חייב להוסיף את הרכיב הזה כאן כדי שההודעות יופיעו! */}
      {/* <Toaster 
        position = "bottom-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            fontFamily: 'system-ui, sans-serif',
            direction: 'rtl'
          },
        }} 
      /> */}
      <Toaster 
  position="bottom-center" // הזזה לתחתית האמצע
  reverseOrder={false} 
  toastOptions={{
    style: {
      background: '#1e293b',
      color: '#fff',
      border: '1px solid #334155',
      fontSize: '14px',
      fontFamily: 'system-ui, sans-serif',
      direction: 'rtl'
    },
    success: {
      duration: 4000,
      iconTheme: { primary: '#10b981', secondary: '#fff' },
    },
  }} 
/>
      
      <Router>
        <div style={styles.appContainer}>
          <nav style={styles.navbar}>
            {/* ... שאר ה-Navbar שלך ... */}
            <div style={styles.navContent}>
              <div style={styles.brandArea}>
                <div style={styles.logoIcon}><Box size={20} color="#fff" /></div>
                <span style={styles.brandName}>LogiTrack <span style={{color: '#3b82f6'}}>Pro</span></span>
              </div>

              <div style={styles.navLinks}>
                <NavLink to="/" style={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
                  <LayoutGrid size={18} /> ניהול משלוחים
                </NavLink>
                <NavLink to="/map" style={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
                  <MapIcon size={18} /> מפת שליחים
                </NavLink>
              </div>

              <div style={styles.userSection}>
                <div style={styles.userBadge}>Admin Panel</div>
              </div>
            </div>
          </nav>

          <div style={styles.contentArea}>
            <Routes>
              <Route path="/" element={<DeliveryDashboard />} />
              <Route path="/map" element={<MapDashboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#0f172a', // תואם ל-Dark Mode של הדפים שלך
    fontFamily: "'Inter', sans-serif",
    direction: 'rtl',
  },
  navbar: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // שקיפות עדינה (Glassmorphism)
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #334155',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0 40px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    backgroundColor: '#3b82f6',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#0f172a',
    padding: '5px',
    borderRadius: '12px',
    border: '1px solid #334155',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s',
  },
  activeLink: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userBadge: {
    backgroundColor: '#334155',
    color: '#60a5fa',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #1e40af',
  },
  contentArea: {
    // אם ה-Navbar דביק, כדאי לוודא שהתוכן לא נכנס תחתיו
    padding: '0px', 
  }
};

export default App;