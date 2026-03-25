import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Box, Map as MapIcon, ClipboardList, User, Package2Icon, PackageIcon, BikeIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole'); // 'Admin' or 'Courier'

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.rightSection}>
        <div style={styles.logoBox}><Box size={20} color="#fff" /></div>
        <span style={styles.brandName}>LogiTrack <span style={{color:'#3b82f6'}}>Pro</span></span>
      </div>

      <nav style={styles.navLinks}>
        {role === 'Admin' ? (
          <>
            <Link to="/map" style={isActive('/map') ? styles.activeLink : styles.link}>
              <MapIcon size={18} /> מפת שליחים
            </Link>
            <Link to="/deliveries" style={isActive('/deliveries') ? styles.activeLink : styles.link}>
              <ClipboardList size={18} /> ניהול משלוחים
            </Link>
          </>
        ) : (
          <>
            <Link to="/courier" style={isActive('/courier') ? styles.activeLink : styles.link}>
              <BikeIcon size={18} /> מפת שליחים
            </Link>
          </>

        )}
      </nav>

      <div style={styles.leftSection}>
        <div style={styles.userInfo}>
          <User size={16} />
          <span>{role === 'Admin' ? 'מנהל' : 'שליח'}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> יציאה
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: { height: '70px', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', width: '100%', boxSizing: 'border-box' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoBox: { width: '35px', height: '35px', backgroundColor: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontSize: '22px', fontWeight: '900', fontFamily: 'Heebo' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px' },
  activeLink: { color: '#fff', backgroundColor: '#1e293b', textDecoration: 'none', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155' },
  courierBadge: { color: '#3b82f6', border: '1px solid #3b82f6', padding: '6px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '900' },
  leftSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  userInfo: { color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
  logoutBtn: { background: 'none', border: '1px solid #334155', color: '#f87171', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }
};

export default Navbar;