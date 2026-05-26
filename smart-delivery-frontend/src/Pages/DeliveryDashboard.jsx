import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, MapPin, Plus, Edit2, Trash2, X, Navigation, Search, 
  LayoutGrid, List, Calendar, CheckCircle, Clock, Package, 
  RefreshCw, SearchX, Loader2, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { API_BASE } from '../apiConfig';

//const DELIVERY_API = 'https://localhost:44333/api/Delivery';
//const DELIVERY_API = 'https://smart-delivery-management-system-t6lh.onrender.com/api/Delivery';

const DELIVERY_API = `${API_BASE}/Delivery`;

const getCleanAddress = (item) => {
  if (!item) return { title: '', subtitle: '' };
  const addr = item.address || {};
  const main = addr.road || addr.pedestrian || addr.suburb || addr.amenity || addr.building || item.display_name.split(',')[0];
  const houseNum = addr.house_number ? ` ${addr.house_number}` : '';
  const city = addr.city || addr.town || addr.village || '';
  const country = addr.country || '';

  return {
    title: `${main}${houseNum}`,
    subtitle: `${city}${city && country ? ', ' : ''}${country}`
  };
};

function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState({ pickupAddress: '', dropoffAddress: '', status: 'Pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewType, setViewType] = useState('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [activeSearchField, setActiveSearchField] = useState(null); 
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeSearchField && currentDelivery[activeSearchField]?.length >= 3) {
        fetchAddressSuggestions(currentDelivery[activeSearchField]);
      } else {
        setAddressSuggestions([]);
      }
    }, 500); 

    return () => clearTimeout(handler);
  }, [currentDelivery.pickupAddress, currentDelivery.dropoffAddress]);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await axios.get(DELIVERY_API);
      setDeliveries(res.data);
      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

//   useEffect(() => { fetchData(); }, []);

useEffect(() => {
    fetchData(); // טעינה ראשונית

    // פונקציה שתופסת את הריענון מהצ'אט
    const handleRefresh = () => {
        console.log("Dashboard received refresh signal!");
        fetchData(); 
    };

    // האזנה לאירוע
    window.addEventListener('refreshData', handleRefresh);

    // ניקוי המאזין כשהדף נסגר
    return () => {
        window.removeEventListener('refreshData', handleRefresh);
    };
}, []);

  const fetchAddressSuggestions = async (query) => {
    setIsSearchingAddress(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&accept-language=he`);
      setAddressSuggestions(res.data);
    } catch (err) {
      console.error("Address search error:", err);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressSelect = (item, field) => {
    const { title, subtitle } = getCleanAddress(item);
    setCurrentDelivery(prev => ({ ...prev, [field]: `${title}, ${subtitle}` }));
    setAddressSuggestions([]);
    setActiveSearchField(null);
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = (d.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.dropoffAddress?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'Pending').length,
    inProgress: deliveries.filter(d => d.status === 'InProgress').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length
  };

  const handleDelete = async (id) => {
    if (window.confirm("למחוק משלוח זה?")) { 
      await axios.delete(`${DELIVERY_API}/${id}`); 
      fetchData(); 
    }
  };

  const openModal = (delivery = null) => {
    setCurrentDelivery(delivery || { pickupAddress: '', dropoffAddress: '', status: 'Pending' });
    setAddressSuggestions([]);
    setActiveSearchField(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataToSave = currentDelivery.id ? currentDelivery : { ...currentDelivery, status: 'Pending' };
    
    try {
        if (currentDelivery.id) await axios.put(`${DELIVERY_API}/${currentDelivery.id}`, dataToSave);
        else await axios.post(DELIVERY_API, dataToSave);
        setShowModal(false);
        fetchData();
    } catch (err) {
        alert("שגיאה בשמירת הנתונים");
    }
  };

  if (loading) return <div style={styles.loader}>טוען מערכת ניהול...</div>;

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
          <button onClick={fetchData} style={styles.refreshBtn}>
            <RefreshCw size={18} color={isRefreshing ? '#3b82f6' : '#94a3b8'} className={isRefreshing ? 'spin' : ''} />
          </button>
          <div style={styles.viewToggle}>
            <button onClick={() => setViewType('grid')} style={viewType === 'grid' ? styles.viewBtnActive : styles.viewBtn}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewType('table')} style={viewType === 'table' ? styles.viewBtnActive : styles.viewBtn}><List size={18} /></button>
          </div>
          <button onClick={() => openModal()} style={styles.addBtn}><Plus size={20} /> משלוח חדש</button>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}><Package color="#94a3b8" size={20}/> <div><span style={styles.statLabel}>סה"כ</span> <h3 style={styles.statValue}>{stats.total}</h3></div></div>
        <div style={styles.statCard}><Clock color="#f59e0b" size={20}/> <div><span style={styles.statLabel}>בהמתנה</span> <h3 style={styles.statValue}>{stats.pending}</h3></div></div>
        <div style={styles.statCard}><Truck color="#3b82f6" size={20}/> <div><span style={styles.statLabel}>בביצוע</span> <h3 style={styles.statValue}>{stats.inProgress}</h3></div></div>
        <div style={styles.statCard}><CheckCircle color="#10b981" size={20}/> <div><span style={styles.statLabel}>הושלמו</span> <h3 style={styles.statValue}>{stats.delivered}</h3></div></div>
      </div>

      {/* Search & Filter */}
      <div style={styles.filterSection}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="חפש כתובת..." style={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={styles.filterTabs}>
          {['All', 'Pending', 'InProgress', 'Delivered'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} style={statusFilter === status ? styles.tabActive : styles.tab}>
              {status === 'All' ? 'הכל' : (status === 'Pending' ? 'בהמתנה' : (status === 'InProgress' ? 'בביצוע' : 'הושלם'))}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.scrollableArea}>
        {filteredDeliveries.length === 0 ? (
          <div style={styles.emptyState}>
            <SearchX size={48} color="#334155" />
            <h3>לא נמצאו משלוחים</h3>
            <p>נסה לשנות את מסנני החיפוש או להוסיף משלוח חדש</p>
          </div>
        ) : (
          viewType === 'grid' ? (
            <div style={styles.grid}>
              {filteredDeliveries.map((d) => (
                <div key={d.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.idLabel}>#{d.id}</span>
                    <div style={styles.badge(d.status)}>{d.status}</div>
                  </div>
                  <div style={styles.addr}>
                    <ArrowUpCircle size={16} color="#60a5fa" />
                    <span>{d.pickupAddress}</span>
                  </div>
                  <div style={styles.miniLine}></div>
                  <div style={styles.addr}>
                    <ArrowDownCircle size={16} color="#f87171" />
                    <span>{d.dropoffAddress}</span>
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.dateText}><Calendar size={12} style={{marginLeft:'5px'}} /> {new Date(d.createdAt).toLocaleDateString('he-IL')}</span>
                    <div style={{display:'flex', gap:'10px'}}>
                      <Edit2 size={16} onClick={() => openModal(d)} style={{cursor:'pointer', color: '#94a3b8'}} />
                      <Trash2 size={16} onClick={() => handleDelete(d.id)} style={{cursor:'pointer', color:'#ef4444'}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, width: '60px' }}>ID</th>
                    <th style={styles.th}>איסוף</th>
                    <th style={styles.th}>יעד</th>
                    <th style={{ ...styles.th, width: '130px' }}>סטטוס</th>
                    <th style={{ ...styles.th, width: '90px' }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((d) => (
                    <tr key={d.id} style={styles.tableRow}>
                      <td style={styles.td}>{d.id}</td>
                      <td style={styles.td} title={d.pickupAddress}>{d.pickupAddress}</td>
                      <td style={styles.td} title={d.dropoffAddress}>{d.dropoffAddress}</td>
                      <td style={styles.td}><span style={styles.badge(d.status)}>{d.status}</span></td>
                      <td style={styles.td}>
                        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                          <Edit2 size={16} onClick={() => openModal(d)} style={{cursor:'pointer', color: '#94a3b8'}} />
                          <Trash2 size={16} onClick={() => handleDelete(d.id)} style={{cursor:'pointer', color:'#ef4444'}} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modal - ללא שינוי */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '15px'}}>
                <h2 style={{margin:0, color:'#fff'}}>{currentDelivery.id ? 'עריכת משלוח' : 'משלוח חדש'}</h2>
                <X onClick={() => setShowModal(false)} style={{cursor:'pointer', color:'#94a3b8'}} />
              </div>

              <div style={{position:'relative'}}>
                <label style={styles.modalLabel}>כתובת איסוף</label>
                <div style={styles.inputWithIcon}>
                  <input style={styles.input} value={currentDelivery.pickupAddress || ''} 
                    onChange={e => {
                        setCurrentDelivery({...currentDelivery, pickupAddress: e.target.value});
                        setActiveSearchField('pickupAddress');
                    }} required/>
                  {isSearchingAddress && activeSearchField === 'pickupAddress' && <Loader2 size={14} className="animate-spin" style={styles.inputLoader} />}
                </div>
                {activeSearchField === 'pickupAddress' && addressSuggestions.length > 0 && (
                  <ul style={styles.suggestionsList}>
                    {addressSuggestions.map(item => {
                      const { title, subtitle } = getCleanAddress(item);
                      return (
                        <li key={item.place_id} onClick={() => handleAddressSelect(item, 'pickupAddress')} style={styles.suggestionItem}>
                          <MapPin size={14} color="#3b82f6" style={{ marginTop: '4px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <span style={styles.suggestionTitle}>{title}</span>
                            <span style={styles.suggestionSubtitle}>{subtitle}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div style={{position:'relative'}}>
                <label style={styles.modalLabel}>כתובת יעד</label>
                <div style={styles.inputWithIcon}>
                  <input style={styles.input} value={currentDelivery.dropoffAddress || ''} 
                    onChange={e => {
                        setCurrentDelivery({...currentDelivery, dropoffAddress: e.target.value});
                        setActiveSearchField('dropoffAddress');
                    }} required/>
                  {isSearchingAddress && activeSearchField === 'dropoffAddress' && <Loader2 size={14} className="animate-spin" style={styles.inputLoader} />}
                </div>
                {activeSearchField === 'dropoffAddress' && addressSuggestions.length > 0 && (
                  <ul style={styles.suggestionsList}>
                    {addressSuggestions.map(item => {
                      const { title, subtitle } = getCleanAddress(item);
                      return (
                        <li key={item.place_id} onClick={() => handleAddressSelect(item, 'dropoffAddress')} style={styles.suggestionItem}>
                          <MapPin size={14} color="#3b82f6" style={{ marginTop: '4px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <span style={styles.suggestionTitle}>{title}</span>
                            <span style={styles.suggestionSubtitle}>{subtitle}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {currentDelivery.id && (
                <>
                  <label style={styles.modalLabel}>סטטוס</label>
                  <select style={styles.input} value={currentDelivery.status} onChange={e => setCurrentDelivery({...currentDelivery, status: e.target.value})}>
                    <option value="Pending">בהמתנה (Pending)</option>
                    <option value="InProgress">בביצוע (InProgress)</option>
                    <option value="Delivered">הושלם (Delivered)</option>
                  </select>
                </>
              )}

              {!currentDelivery.id && <p style={styles.infoText}>המשלוח ייכנס למערכת בסטטוס "בהמתנה" (Pending)</p>}

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button type="submit" style={styles.addBtn}>שמור משלוח</button>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  dashboard: { 
    minHeight: '100vh', 
    backgroundColor: '#0f172a', 
    color: '#f8fafc', 
    direction: 'rtl', 
    padding: '40px', 
    fontFamily: 'Heebo, sans-serif'
  },
  scrollableArea: {
    marginTop: '20px',
    width: '100%'
  },
  header: { display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '10px' },
  viewToggle: { display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px', marginLeft: '15px' },
  viewBtn: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer', borderRadius: '8px' },
  viewBtnActive: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '8px' },
  addBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  statsBar: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  statCard: { flex: '1 1 200px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' },
  statLabel: { fontSize: '12px', color: '#94a3b8' },
  statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  filterSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', flexWrap: 'wrap' },
  searchWrapper: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e293b', padding: '12px 20px', borderRadius: '15px', border: '1px solid #334155', flex: 1, minWidth: '250px' },
  searchInput: { background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%' },
  filterTabs: { display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px' },
  tab: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px' },
  tabActive: { backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#1e293b', borderRadius: '20px', padding: '20px', border: '1px solid #334155', textAlign: 'right' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  idLabel: { color: '#64748b', fontSize: '12px' },
  badge: (status) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    backgroundColor: status === 'Delivered' ? '#065f4633' : status === 'InProgress' ? '#1e40af33' : '#92400e33',
    color: status === 'Delivered' ? '#34d399' : status === 'InProgress' ? '#60a5fa' : '#fbbf24'
  }),
  addr: { fontSize: '14px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' },
  miniLine: { width: '2px', height: '12px', backgroundColor: '#334155', marginRight: '22px', marginVertical: '4px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px' },
  dateText: { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center' },
  tableWrapper: { backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  th: { padding: '15px', color: '#94a3b8', fontSize: '14px', borderBottom: '1px solid #334155' },
  td: { padding: '15px', fontSize: '14px', borderBottom: '1px solid #334155', color: '#e2e8f0' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modal: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '24px', width: '480px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' },
  modalLabel: { fontSize: '12px', color: '#94a3b8', marginTop: '15px', display: 'block' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { padding: '12px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none', marginTop: '5px' },
  inputWithIcon: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputLoader: { position: 'absolute', left: '12px', color: '#3b82f6' },
  suggestionsList: { position: 'absolute', top: '100%', width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', zIndex: 1100, marginTop: '5px' },
  suggestionItem: { padding: '12px', display: 'flex', gap: '12px', cursor: 'pointer', borderBottom: '1px solid #334155' },
  suggestionTitle: { fontSize: '14px', color: '#f8fafc' },
  suggestionSubtitle: { fontSize: '11px', color: '#94a3b8' },
  infoText: { fontSize: '12px', color: '#3b82f6', marginTop: '15px', textAlign: 'center' },
  cancelBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginTop: '10px' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }
};

export default DeliveryDashboard;

