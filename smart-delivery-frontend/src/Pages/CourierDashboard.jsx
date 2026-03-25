import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, CheckCircle2, LogOut, RefreshCw, House, Maximize, Home, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

// Icons setup
const houseIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 3px 8px rgba(0,0,0,0.15);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  iconSize: [30, 30], iconAnchor: [15, 15]
});

const stopIcon = (num) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #2563eb; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; box-shadow: 0 3px 8px rgba(0,0,0,0.15);">${num}</div>`,
  iconSize: [26, 26], iconAnchor: [13, 13]
});

//const API_BASE = 'https://localhost:44333/api';
const API_BASE = 'https://smart-delivery-management-system-t6lh.onrender.com/api';

function MapController({ points, focusPoint, resetTrigger }) {
  const map = useMap();
  useEffect(() => {
    if (focusPoint) {
      map.flyTo(focusPoint, 17, { duration: 1.5 });
    } else if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, focusPoint, resetTrigger, map]);
  return null;
}

function CourierDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusPoint, setFocusPoint] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const navigate = useNavigate();

  const getAddress = (t) => t.address || t.Address || t.dropoffAddress || t.delivery?.dropoffAddress || "כתובת לא זמינה";

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) { navigate('/'); return; }
      const res = await axios.get(`${API_BASE}/Routes/courier/my-route`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.stops || res.data.Stops || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
      toast.error("שגיאה בטעינת המשימות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleComplete = async (e, deliveryId) => {
    e.stopPropagation();
    if (!window.confirm("לסמן משלוח זה כנמסר?")) return;
    const token = localStorage.getItem('userToken');
    try {
      await axios.put(`${API_BASE}/Delivery/complete/${deliveryId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("סטטוס עודכן");
      fetchTasks();
    } catch (err) { toast.error("שגיאה בעדכון"); }
  };

  if (loading) return <div style={styles.loader}>טוען...</div>;

  const mapPoints = tasks.map(t => [t.latitude || t.Latitude, t.longitude || t.Longitude]).filter(p => p[0]);

  return (
    <div style={styles.container}>
      <div style={styles.contentBody}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          {/* כותרת דף חדשה וממותגת */}
          <div style={styles.brandHeader}>
            <div style={styles.logoBox}>
              <Truck size={18} color="#fff" />
            </div>
            <h2 style={styles.brandTitle}>LogiTrack <span style={{color: '#3b82f6'}}>Courier</span></h2>
          </div>

          <div style={styles.listSubHeader}>
            <span style={styles.listLabel}>רשימת עצירות ({tasks.length})</span>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <RefreshCw size={16} onClick={fetchTasks} style={{cursor:'pointer', color: '#94a3b8'}} />
                <LogOut size={16} onClick={() => { localStorage.clear(); navigate('/'); }} style={{cursor:'pointer', color: '#ef4444'}} />
            </div>
          </div>

          <div style={styles.listContainer}>
            {tasks.map((task, index) => (
              <div 
                key={index} 
                style={index === 0 ? styles.taskItemActive : styles.taskItem}
                onClick={() => setFocusPoint([task.latitude || task.Latitude, task.longitude || task.Longitude])}
              >
                <div style={styles.taskMainInfo}>
                  <div style={{...styles.stopBadge, backgroundColor: index === 0 ? '#10b981' : '#3b82f6'}}>
                    {index === 0 ? <House size={12}/> : index + 1}
                  </div>
                  <div style={{flex:1}}>
                    <p style={index === 0 ? styles.addressTextActive : styles.addressText}>{getAddress(task)}</p>
                    <span style={index === 0 ? styles.statusTextActive : styles.statusText}>
                        {index === 0 ? 'המשימה הנוכחית' : 'בהמתנה'}
                    </span>
                  </div>
                </div>

                {index === 0 && (
                  <div style={styles.activeActions}>
                    <button onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(getAddress(task))}&navigate=yes`)} style={styles.wazeBtn}>
                      <Navigation size={14} /> Waze
                    </button>
                    <button onClick={(e) => handleComplete(e, task.delivery?.id || task.id)} style={styles.doneBtn}>
                      <CheckCircle2 size={14} /> נמסר
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* MAP AREA */}
        <main style={styles.main}>
          <div style={styles.mapWrapper}>
            <MapContainer center={[32.0853, 34.7818]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '20px' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <ZoomControl position="topright" />
              <MapController points={mapPoints} focusPoint={focusPoint} resetTrigger={resetTrigger} />
              
              {tasks.map((stop, index) => (
                <Marker key={index} position={[stop.latitude || stop.Latitude, stop.longitude || stop.Longitude]} icon={index === 0 ? houseIcon : stopIcon(index + 1)}>
                  <Popup>
                      <div style={styles.popupContent}>
                          {index === 0 ? <Home size={14} color="#10b981" /> : <MapPin size={14} color="#3b82f6" />}
                          <span style={{fontWeight: 'bold', color: '#1e293b'}}>{getAddress(stop)}</span>
                      </div>
                  </Popup>
                </Marker>
              ))}
              {mapPoints.length > 1 && <Polyline positions={mapPoints} color="#3b82f6" weight={3} dashArray="5, 10" opacity={0.4} />}
            </MapContainer>

            {/* כפתור ה-Zoom Out ממוקם מתחת ל-ZoomControl המובנה */}
            <button onClick={() => { setFocusPoint(null); setResetTrigger(v => v+1); }} style={styles.zoomOutBtn} title="הצג הכל">
              <Maximize size={18} color="#1e293b" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#0f172a', 
    overflow: 'hidden',
    direction: 'rtl',
    fontFamily: 'Heebo, sans-serif'
  },
  contentBody: { display: 'flex', flex: 1, overflow: 'hidden' },
  
  // Sidebar Styles
  sidebar: { 
    width: '360px', 
    backgroundColor: '#1e293b', 
    display: 'flex', 
    flexDirection: 'column', 
    borderLeft: '1px solid #334155',
    boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
    zIndex: 10
  },
  brandHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1e293b'
  },
  logoBox: {
    width: '32px',
    height: '32px',
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#fff',
    margin: 0,
    letterSpacing: '0.5px'
  },
  listSubHeader: { padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  listLabel: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' },
  listContainer: { flex: 1, overflowY: 'auto', padding: '15px' },

  taskItem: { padding: '14px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '10px', cursor: 'pointer', transition: '0.2s' },
  addressText: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1', margin: '0 0 4px 0' },
  statusText: { fontSize: '11px', color: '#64748b' },

  taskItemActive: { padding: '14px', borderRadius: '12px', border: '2px solid #3b82f6', backgroundColor: '#1e3a8a44', marginBottom: '10px', cursor: 'pointer' },
  addressTextActive: { fontSize: '14px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' },
  statusTextActive: { fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' },

  taskMainInfo: { display: 'flex', gap: '12px' },
  stopBadge: { width: '24px', height: '24px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },

  activeActions: { display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #334155' },
  wazeBtn: { flex: 1, backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  doneBtn: { flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },

  // Main Content & Map Wrapper
  main: { flex: 1, backgroundColor: '#0f172a', padding: '20px' },
  mapWrapper: {
    height: '100%',
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    border: '1px solid #334155',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
  },
  zoomOutBtn: { 
    position: 'absolute', 
    top: '75px', // בדיוק מתחת לכפתורי הפלוס והמינוס
    right: '10px', 
    zIndex: 1000, 
    backgroundColor: '#fff', 
    border: '2px solid rgba(0,0,0,0.2)',
    width: '34px',
    height: '34px',
    borderRadius: '4px', 
    cursor: 'pointer',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center'
  },

  popupContent: { display: 'flex', alignItems: 'center', gap: '8px', padding: '5px', direction: 'rtl' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', backgroundColor: '#0f172a' }
};

export default CourierDashboard;