import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  User, Navigation, ChevronLeft, MapPin, RefreshCw, Maximize, 
  House, Info, Sparkles, PackageSearch, 
  ChevronDown, Box, Truck, Edit2, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Icons setup
const houseIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #1e293b; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 0 15px rgba(16,185,129,0.4);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
});

const createNumberIcon = (number) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #1e293b; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 0 10px rgba(59,130,246,0.3);">${number}</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

//const API_BASE = 'https://localhost:44333/api';
const API_BASE = 'https://smart-delivery-management-system-t6lh.onrender.com/api';

function MapController({ focusPoint }) {
  const map = useMap();
  useEffect(() => {
    if (focusPoint && focusPoint[0] && focusPoint[1]) {
      map.flyTo(focusPoint, 16, { duration: 1.5 });
    }
  }, [focusPoint, map]); 
  return null;
}

function MapDashboard() {
  const [couriers, setCouriers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusPoint, setFocusPoint] = useState(null);
  const [showPendingList, setShowPendingList] = useState(false);

  const authHeader = useMemo(() => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
  }), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, dRes] = await Promise.all([
        axios.get(`${API_BASE}/Courier`, authHeader),
        axios.get(`${API_BASE}/Delivery`, authHeader)
      ]);
      setCouriers(cRes.data);
      setDeliveries(dRes.data);
    } catch (err) {
      toast.error("שגיאה בטעינת נתונים");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCourierClick = async (courier) => {
    setSelectedCourier(courier);
    if (courier.latitude && courier.longitude) {
      setFocusPoint([courier.latitude, courier.longitude]);
    }
    try {
      const res = await axios.get(`${API_BASE}/Routes/courier/${courier.id}`, authHeader);
      setStops(res.data.stops || res.data.Stops || []);
    } catch { 
      setStops([]); 
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm("למחוק את המשלוח?")) return;
    try {
      await axios.delete(`${API_BASE}/Delivery/${id}`, authHeader);
      toast.success("נמחק בהצלחה");
      fetchData();
    } catch { toast.error("שגיאה במחיקה"); }
  };

  const handleEditDelivery = (delivery) => {
    // כאן אפשר לפתוח מודאל או לנווט לדף עריכה
    const newAddress = window.prompt("עדכן כתובת יעד:", delivery.dropoffAddress || delivery.address);
    if (newAddress && newAddress !== (delivery.dropoffAddress || delivery.address)) {
        axios.put(`${API_BASE}/Delivery/${delivery.id}`, { ...delivery, dropoffAddress: newAddress }, authHeader)
            .then(() => {
                toast.success("עודכן!");
                fetchData();
            })
            .catch(() => toast.error("שגיאה בעדכון"));
    }
  };

  const runOptimization = async () => {
    const tId = toast.loading('מבצע מיטוב מסלולים...');
    try {
      await axios.get(`${API_BASE}/RoutePlanning/plan`, authHeader);
      toast.success('המיטוב הושלם!', { id: tId });
      fetchData();
    } catch { toast.error('שגיאה במיטוב', { id: tId }); }
  };

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending');

  if (loading) return <div style={styles.loader}><RefreshCw className="animate-spin" /> מעבד נתונים...</div>;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <h3 style={styles.sidebarTitle}>ניהול צי שליחים</h3>
            <RefreshCw size={16} onClick={fetchData} style={styles.refreshIcon} />
          </div>
          <button onClick={runOptimization} style={styles.optimizeBtn}><Sparkles size={14} /> מיטוב מסלול חכם</button>
        </div>

        {/* באנר Pending משופר */}
        {pendingDeliveries.length > 0 && (
          <div style={styles.pendingContainer}>
            <div style={styles.pendingHeader} onClick={() => setShowPendingList(!showPendingList)}>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <PackageSearch size={18} color="#fbbf24" />
                <span style={styles.pendingCount}>{pendingDeliveries.length} ממתינים לשיבוץ</span>
              </div>
              <ChevronDown size={16} style={{transform: showPendingList ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', color:'#fbbf24'}} />
            </div>
            {showPendingList && (
              <div style={styles.pendingList}>
                {pendingDeliveries.map(d => (
                  <div key={d.id} style={styles.pendingItem}>
                    <div 
                      style={styles.pendingItemMain} 
                      onClick={() => {
                        const lat = d.dropoffLatitude || d.latitude;
                        const lng = d.dropoffLongitude || d.longitude;
                        if (lat && lng) setFocusPoint([lat, lng]);
                      }}
                    >
                      <MapPin size={12} color="#94a3b8" />
                      <span style={styles.pendingAddr} title={d.dropoffAddress || d.address}>
                        {d.dropoffAddress || d.address}
                      </span>
                    </div>
                    
                    <div style={styles.pendingActions}>
                      <Edit2 size={13} style={styles.actionIcon} onClick={() => handleEditDelivery(d)} />
                      <Trash2 size={13} style={{...styles.actionIcon, color: '#ef4444'}} onClick={() => handleDeleteDelivery(d.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={styles.courierList}>
          <p style={styles.listLabel}>שליחים פעילים</p>
          {couriers.map(c => (
            <div key={c.id} onClick={() => handleCourierClick(c)} style={selectedCourier?.id === c.id ? styles.courierItemActive : styles.courierItem}>
              <div style={selectedCourier?.id === c.id ? styles.avatarActive : styles.avatar}><User size={16} /></div>
              <div style={{flex:1}}>
                <div style={styles.courierName}>{c.name}</div>
                <div style={styles.courierStatus}>{selectedCourier?.id === c.id ? 'מעקב פעיל' : 'מחובר'}</div>
              </div>
              {selectedCourier?.id === c.id && <ChevronLeft size={16} />}
            </div>
          ))}
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.mainHeader}>
          <div>
            <h2 style={styles.mainTitle}>{selectedCourier ? selectedCourier.name : 'מרכז בקרה - מבט על'}</h2>
            <div style={styles.headerStats}>
              <div style={styles.statItem}><Navigation size={14} color="#3b82f6" /> {stops.length} עצירות</div>
              <div style={styles.statItem}><Truck size={14} color="#10b981" /> {couriers.length} שליחים</div>
            </div>
          </div>
        </header>

        <div style={styles.mapWrapper}>
          <MapContainer center={[32.0853, 34.7818]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <ZoomControl position="topright" />
            <MapController focusPoint={focusPoint} />

            {pendingDeliveries.map(d => {
              const lat = d.dropoffLatitude || d.latitude;
              const lng = d.dropoffLongitude || d.longitude;
              if (!lat || !lng) return null;
              return <CircleMarker key={`p-${d.id}`} center={[lat, lng]} radius={6} pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.6, weight: 1 }} />;
            })}
            
            {stops.map((stop, index) => {
              const lat = stop.latitude || stop.Latitude;
              const lng = stop.longitude || stop.Longitude;
              if (!lat || !lng) return null;
              return (
                <Marker key={`${selectedCourier?.id}-${index}`} position={[lat, lng]} icon={index === 0 ? houseIcon : createNumberIcon(index + 1)}>
                  <Popup>
                    <div style={{ direction: 'rtl', textAlign: 'right' }}>
                      <b style={{color: '#3b82f6'}}>{index === 0 ? '🏠 מחסן ראשי' : `תחנה ${index + 1}`}</b><br/>
                      {stop.address || stop.dropoffAddress}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {stops.length > 1 && (
              <Polyline positions={stops.filter(s => s.latitude || s.Latitude).map(s => [s.latitude || s.Latitude, s.longitude || s.Longitude])} color="#3b82f6" weight={4} opacity={0.6} dashArray="10, 10" />
            )}
          </MapContainer>
          
          <button onClick={() => setFocusPoint(null)} style={styles.resetBtn} title="אפס תצוגה">
            <Maximize size={18} color="#1e293b" />
          </button>
        </div>

        <section style={styles.bottomPanel}>
          <div style={styles.panelHeader}>
             <h4 style={styles.panelTitle}><MapPin size={16} color="#ef4444" /> מסלול מתוכנן</h4>
          </div>
          <div style={styles.stationsGrid}>
            {stops.length > 0 ? stops.map((stop, index) => (
              <div key={index} onClick={() => {
                const lat = stop.latitude || stop.Latitude;
                const lng = stop.longitude || stop.Longitude;
                if (lat && lng) setFocusPoint([lat, lng]);
              }} style={index === 0 ? styles.originCard : styles.stationCard}>
                <div style={styles.stationTop}>
                   <div style={{...styles.stationNumber, backgroundColor: index === 0 ? '#10b981' : '#3b82f6'}}>{index === 0 ? <House size={12}/> : index + 1}</div>
                   <span style={styles.stepTitle}>{index === 0 ? 'מוצא' : `תחנה ${index + 1}`}</span>
                </div>
                <p style={styles.stationAddr}>{stop.address || stop.dropoffAddress}</p>
              </div>
            )) : <div style={styles.emptyState}><Info size={32} opacity={0.3} /><p>בחר שליח לצפייה במסלולו</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', direction: 'rtl', overflow: 'hidden' },
  sidebar: { width: '340px', backgroundColor: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid #334155' },
  sidebarTitle: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' },
  refreshIcon: { cursor: 'pointer', color: '#94a3b8' },
  optimizeBtn: { width: '100%', marginTop: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  
  pendingContainer: { margin: '12px', backgroundColor: 'rgba(251, 191, 36, 0.08)', borderRadius: '14px', border: '1px solid rgba(251, 191, 36, 0.2)', overflow: 'hidden' },
  pendingHeader: { padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  pendingCount: { fontWeight: '700', fontSize: '13px', color: '#fbbf24' },
  pendingList: { padding: '0 12px 12px', maxHeight: '180px', overflowY: 'auto' },
  
  pendingItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 8px', 
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    gap: '10px'
  },
  pendingItemMain: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden', cursor: 'pointer' },
  pendingAddr: { 
    fontSize: '11px', 
    color: '#cbd5e1', 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    maxWidth: '170px' 
  },
  pendingActions: { display: 'flex', gap: '10px', flexShrink: 0 },
  actionIcon: { cursor: 'pointer', color: '#94a3b8', transition: '0.2s', '&:hover': { color: '#fff' } },

  listLabel: { padding: '0 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', margin: '15px 0 10px' },
  courierList: { flex: 1, overflowY: 'auto', padding: '0 10px' },
  courierItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '12px', color: '#94a3b8' },
  courierItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  avatar: { width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarActive: { width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  courierName: { fontSize: '14px', color: '#fff' },
  courierStatus: { fontSize: '11px', color: '#475569' },

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
  mainHeader: { padding: '15px 25px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' },
  mainTitle: { fontSize: '18px', margin: 0, color: '#fff', fontWeight: '800' },
  headerStats: { display: 'flex', gap: '15px', marginTop: '4px' },
  statItem: { fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' },

  mapWrapper: { flex: 1, margin: '20px', borderRadius: '24px', overflow: 'hidden', border: '2px solid #3b82f6', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  resetBtn: { position: 'absolute', top: '75px', right: '10px', zIndex: 1000, backgroundColor: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px' },

  bottomPanel: { height: '220px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '20px 25px' },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' },
  panelTitle: { margin: 0, fontSize: '14px', color: '#fff', fontWeight: '700' },
  stationsGrid: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' },
  stationCard: { minWidth: '220px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '16px', border: '1px solid #334155', cursor: 'pointer' },
  originCard: { minWidth: '220px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer' },
  stationTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  stationNumber: { width: '22px', height: '22px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' },
  stepTitle: { fontSize: '12px', fontWeight: '700', color: '#fff' },
  stationAddr: { fontSize: '11px', color: '#94a3b8', height: '34px', overflow: 'hidden', lineHeight: '1.4' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569', gap: '10px' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff' }
};

export default MapDashboard;