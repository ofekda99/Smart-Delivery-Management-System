import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  User, Navigation, ChevronLeft, MapPin, RefreshCw, Maximize, 
  ExternalLink, House, Info, CheckCircle, Sparkles, PackageSearch, 
  ChevronDown, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const houseIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #198754; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

const createNumberIcon = (number) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${number}</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10]
});

const API_BASE = 'https://localhost:44333/api';

function MapController({ focusPoint, resetTrigger }) {
  const map = useMap();
  useEffect(() => {
    if (focusPoint && focusPoint[0] && focusPoint[1]) {
      map.flyTo(focusPoint, 16, { duration: 1.5 }); 
    }
  }, [focusPoint, resetTrigger, map]);
  return null;
}

function MapDashboard() {
  const [couriers, setCouriers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusPoint, setFocusPoint] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
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
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCourierClick = async (courier) => {
    setSelectedCourier(courier);
    
    if (courier.latitude && courier.longitude) {
        setFocusPoint([courier.latitude, courier.longitude]);
    } else {
        setFocusPoint(null);
    }

    try {
      const res = await axios.get(`${API_BASE}/Routes/courier/${courier.id}`, authHeader);
      const stopsData = res.data.stops || res.data.Stops || [];
      setStops(stopsData);
      
      if ((!courier.latitude || !courier.longitude) && stopsData.length > 0) {
          const firstStop = stopsData[0];
          setFocusPoint([firstStop.latitude || firstStop.Latitude, firstStop.longitude || firstStop.Longitude]);
      }
      
    } catch (err) { setStops([]); }
  };

  const handleZoomOut = () => {
    setFocusPoint(null);
    setResetTrigger(prev => prev + 1);
  };

  const handleDeleteDelivery = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("האם אתה בטוח שברצונך למחוק משלוח זה?")) return;
    try {
      await axios.delete(`${API_BASE}/Delivery/${id}`, authHeader);
      toast.success("המשלוח נמחק בהצלחה");
      fetchData();
    } catch (err) { toast.error("שגיאה במחיקת המשלוח"); }
  };

  const runOptimization = async () => {
    const toastId = toast.loading('מחשב מסלולים אופטימליים...');
    try {
      await axios.get(`${API_BASE}/RoutePlanning/plan`, authHeader);
      await fetchData(); 
      if (selectedCourier) handleCourierClick(selectedCourier);
      toast.success('מיטוב הצי הושלם!', { id: toastId });
    } catch (err) { toast.error('שגיאה במיטוב', { id: toastId }); }
  };

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending');

  if (loading) return <div style={styles.loader}><RefreshCw className="animate-spin" /> מעבד נתונים...</div>;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h1 style={styles.sidebarTitle}>Smart Logistics</h1>
            <RefreshCw size={16} onClick={fetchData} style={{cursor:'pointer', opacity: 0.6}} />
          </div>
          <p style={styles.sidebarSubtitle}>ניהול צי שליחים בזמן אמת</p>
          <button onClick={runOptimization} style={styles.optimizeBtn}><Sparkles size={14} /> שגר מיטוב מסלול</button>
        </div>

        {/* באנר Pending */}
        {pendingDeliveries.length > 0 && (
          <div style={styles.pendingContainer}>
            <div style={styles.pendingHeader} onClick={() => setShowPendingList(!showPendingList)}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <PackageSearch size={18} color="#92400e" />
                <span style={{fontWeight:'700', fontSize:'13px', color:'#92400e'}}>{pendingDeliveries.length} משלוחים לשיבוץ</span>
              </div>
              <ChevronDown size={16} style={{transform: showPendingList ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', color:'#92400e'}} />
            </div>
            {showPendingList && (
              <div style={styles.pendingList}>
                {pendingDeliveries.map(d => (
                  <div key={d.id} style={styles.pendingItem} onClick={() => {
                    const lat = d.dropoffLatitude || d.Latitude || d.latitude;
                    const lng = d.dropoffLongitude || d.Longitude || d.longitude;
                    if(lat && lng) setFocusPoint([lat, lng]);
                  }}>
                    <MapPin size={12} color="#94a3b8" />
                    <span style={styles.pendingAddr}>{d.dropoffAddress || d.Address || "כתובת חסרה"}</span>
                    <button onClick={(e) => handleDeleteDelivery(e, d.id)} style={styles.deleteBtn}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={styles.courierList}>
          <p style={styles.listLabel}>צוות השליחים</p>
          {couriers.map(c => (
            <div key={c.id} onClick={() => handleCourierClick(c)} style={selectedCourier?.id === c.id ? styles.courierItemActive : styles.courierItem}>
              <div style={selectedCourier?.id === c.id ? styles.avatarActive : styles.avatar}><User size={16} /></div>
              <span style={styles.courierName}>{c.name}</span>
              {selectedCourier?.id === c.id && <ChevronLeft size={16} />}
            </div>
          ))}
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.mainHeader}>
          <div style={styles.headerTitleGroup}>
            <h2 style={styles.mainTitle}>{selectedCourier ? selectedCourier.name : 'מרכז בקרה ניהולי'}</h2>
            {selectedCourier && <span style={styles.badge}>מחובר</span>}
          </div>
          {selectedCourier && (
            <div style={styles.statsRow}>
              <div style={styles.statItem}><Navigation size={14} color="#3b82f6" /><span>{stops.length} עצירות</span></div>
              <div style={styles.statItem}><CheckCircle size={14} color="#10b981" /><span>מסלול מיטבי</span></div>
            </div>
          )}
        </header>

        <div style={styles.mapWrapper}>
          <MapContainer center={[32.0853, 34.7818]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            {/* שכבת מפה עדינה ('Voyager') - נשמר מהתיקון הקודם */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
            
            <ZoomControl position="topright" />
            
            {/* MapController מטפל כעת רק ב-FlyTo צפוף */}
            <MapController focusPoint={focusPoint} resetTrigger={resetTrigger} />

            {/* נקודות Pending כתומות */}
            {pendingDeliveries.map(d => {
                const lat = d.dropoffLatitude || d.Latitude || d.latitude;
                const lng = d.dropoffLongitude || d.Longitude || d.longitude;
                return (lat && lng) ? (
                  <CircleMarker key={`p-${d.id}`} center={[lat, lng]} radius={8} pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.8, weight: 2 }} />
                ) : null;
            })}
            
            {stops.map((stop, index) => (
              <Marker key={`${selectedCourier?.id}-${index}`} position={[stop.latitude || stop.Latitude, stop.longitude || stop.Longitude]} icon={index === 0 ? houseIcon : createNumberIcon(index + 1)}>
                <Popup minWidth={160}>
                  <div style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'Segoe UI' }}>
                    <strong>{index === 0 ? '🏠 נקודת מוצא' : `📍 תחנה ${index + 1}`}</strong><br/>
                    {stop.address || stop.dropoffAddress}
                  </div>
                </Popup>
              </Marker>
            ))}

            {stops.length > 1 && (
              <Polyline positions={stops.map(s => [s.latitude || s.Latitude, s.longitude || s.Longitude])} color="#3b82f6" weight={3} dashArray="8, 12" opacity={0.7} />
            )}
          </MapContainer>

          {/* כפתור ה-ZOOM OUT נשמר מהתיקון הקודם */}
          <button onClick={handleZoomOut} title="הצג מסלול מלא" style={styles.zoomOutBtn}>
            <Maximize size={16} color="#1f2937" />
          </button>
        </div>

        <section style={styles.bottomPanel}>
          <div style={styles.panelHeader}>
              <h4 style={{margin:0, fontSize:'14px', display:'flex', alignItems:'center', gap:'6px'}}><MapPin size={16} color="#ef4444" /> סדר העצירות המתוכנן</h4>
          </div>
          <div style={styles.stationsGrid}>
            {stops.length > 0 ? stops.map((stop, index) => (
              <div key={index} onClick={() => setFocusPoint([stop.latitude || stop.Latitude, stop.longitude || stop.Longitude])} style={index === 0 ? styles.originCard : styles.stationCard}>
                <div style={styles.stationTop}>
                   <div style={{...styles.stationNumber, backgroundColor: index === 0 ? '#198754' : '#3b82f6'}}>{index === 0 ? <House size={12}/> : index + 1}</div>
                   <span style={styles.stepTitle}>{index === 0 ? 'נקודת מוצא' : `תחנה ${index + 1}`}</span>
                </div>
                <p style={styles.stationAddr}>{stop.address || stop.dropoffAddress}</p>
                <div style={{display:'flex', justifyContent:'flex-end', marginTop:'5px'}}>
                   <span style={{fontSize:'10px', color:'#3b82f6', fontWeight:'bold'}}>Waze <ExternalLink size={10} /></span>
                </div>
              </div>
            )) : <div style={styles.emptyState}><Info size={32} opacity={0.2} /><p>בחר שליח לצפייה במסלול</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', direction: 'rtl', backgroundColor: '#f1f5f9', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' },
  sidebar: { width: '300px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.02)' },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid #f1f5f9' },
  sidebarTitle: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' },
  sidebarSubtitle: { margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' },
  optimizeBtn: { width: '100%', marginTop: '15px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' },
  
  pendingContainer: { margin: '15px 10px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa', overflow: 'hidden' },
  pendingHeader: { padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  pendingList: { padding: '0 12px 12px 12px', maxHeight: '150px', overflowY: 'auto', backgroundColor: '#fffcf9' },
  pendingItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 4px', borderBottom: '1px solid #ffedd5', cursor: 'pointer' },
  pendingAddr: { fontSize: '11px', color: '#92400e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' },

  listLabel: { padding: '0 20px', fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '10px', marginTop: '10px' },
  courierList: { flex: 1, overflowY: 'auto', padding: '10px' },
  courierItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', color: '#64748b' },
  courierItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', fontWeight: '600' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarActive: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  courierName: { flex: 1, fontSize: '14px' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  mainHeader: { padding: '15px 30px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  headerTitleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  mainTitle: { fontSize: '18px', margin: 0, fontWeight: '700' },
  badge: { backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  statsRow: { display: 'flex', gap: '20px' },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' },
  
  mapWrapper: { flex: 1, margin: '15px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', position: 'relative' },
  zoomOutBtn: { position: 'absolute', top: '80px', right: '10px', zIndex: 1000, width: '30px', height: '30px', backgroundColor: '#fff', border: '2px solid rgba(0,0,0,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,0.4)', padding: 0 },
  
  bottomPanel: { height: '250px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '20px 30px', display: 'flex', flexDirection: 'column' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  stationsGrid: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', flex: 1 },
  stationCard: { minWidth: '220px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '14px', border: '1px solid #f1f5f9' },
  originCard: { minWidth: '220px', backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '14px', border: '1px solid #dcfce7' },
  stationTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  stationNumber: { width: '24px', height: '24px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
  stepTitle: { fontSize: '12px', fontWeight: 'bold' },
  stationAddr: { fontSize: '13px', color: '#475569', margin: '0 0 10px 0', height: '36px', overflow: 'hidden' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '10px' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }
};

export default MapDashboard;