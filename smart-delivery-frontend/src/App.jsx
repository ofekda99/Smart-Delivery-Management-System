import { useState, useEffect } from 'react'
import axios from 'axios'
import { Truck, MapPin, Plus, Edit2, Trash2, X, Navigation, Search, LayoutGrid, List, Calendar, CheckCircle, Clock, Package, RefreshCw, SearchX } from 'lucide-react'

const API_URL = 'https://localhost:44333/api/Delivery';

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState({ pickupAddress: '', dropoffAddress: '', status: 'Pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewType, setViewType] = useState('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await axios.get(API_URL);
      setDeliveries(res.data);
      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
      await axios.delete(`${API_URL}/${id}`); 
      fetchData(); 
    }
  };

  const openModal = (delivery = null) => {
    setCurrentDelivery(delivery || { pickupAddress: '', dropoffAddress: '', status: 'Pending' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (currentDelivery.id) await axios.put(`${API_URL}/${currentDelivery.id}`, currentDelivery);
    else await axios.post(API_URL, currentDelivery);
    setShowModal(false);
    fetchData();
  };

  if (loading) return <div style={styles.loader}>טוען מערכת ניהול...</div>;

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}><Navigation size={22} color="#fff" /></div>
          <h1 style={styles.title}>LogiTrack Pro</h1>
        </div>
        
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
          <button 
            onClick={fetchData} 
            style={styles.refreshBtn}
            className={isRefreshing ? 'spin' : ''}
          >
            <RefreshCw size={18} color={isRefreshing ? '#3b82f6' : '#94a3b8'} />
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
              {status === 'All' ? 'הכל' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
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
                <p style={styles.addr}><strong>⬆️</strong> {d.pickupAddress}</p>
                <div style={styles.miniLine}></div>
                <p style={styles.addr}><strong>⬇️</strong> {d.dropoffAddress}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.dateText}><Calendar size={12} style={{marginLeft:'5px'}} /> {new Date(d.createdAt).toLocaleDateString()}</span>
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
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>איסוף</th>
                  <th style={styles.th}>יעד</th>
                  <th style={styles.th}>סטטוס</th>
                  <th style={styles.th}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((d) => (
                  <tr key={d.id} style={styles.tableRow}>
                    <td style={styles.td}>{d.id}</td>
                    <td style={styles.td}>{d.pickupAddress}</td>
                    <td style={styles.td}>{d.dropoffAddress}</td>
                    <td style={styles.td}><span style={styles.badge(d.status)}>{d.status}</span></td>
                    <td style={styles.td}>
                      <div style={{display:'flex', gap:'15px'}}>
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

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '15px'}}>
                <h2 style={{margin:0}}>{currentDelivery.id ? 'עריכת משלוח' : 'משלוח חדש'}</h2>
                <X onClick={() => setShowModal(false)} style={{cursor:'pointer', color:'#94a3b8'}} />
              </div>
              <label style={styles.modalLabel}>כתובת איסוף</label>
              <input style={styles.input} value={currentDelivery.pickupAddress || ''} onChange={e => setCurrentDelivery({...currentDelivery, pickupAddress: e.target.value})} required/>
              <label style={styles.modalLabel}>כתובת יעד</label>
              <input style={styles.input} value={currentDelivery.dropoffAddress || ''} onChange={e => setCurrentDelivery({...currentDelivery, dropoffAddress: e.target.value})} required/>
              <label style={styles.modalLabel}>סטטוס</label>
              <select style={styles.input} value={currentDelivery.status} onChange={e => setCurrentDelivery({...currentDelivery, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="InProgress">InProgress</option>
                <option value="Delivered">Delivered</option>
              </select>
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button type="submit" style={styles.addBtn}>שמור</button>
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
  dashboard: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', direction: 'rtl', fontFamily: "'Inter', sans-serif", padding: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  logoArea: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { backgroundColor: '#3b82f6', padding: '8px', borderRadius: '10px' },
  title: { fontSize: '24px', fontWeight: '800', margin: 0 },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' },
  viewToggle: { display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px', border: '1px solid #334155' },
  viewBtn: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px', cursor: 'pointer', borderRadius: '8px', display: 'flex' },
  viewBtnActive: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '8px', display: 'flex' },
  addBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  statsBar: { display: 'flex', gap: '20px', marginBottom: '30px' },
  statCard: { flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' },
  statLabel: { fontSize: '12px', color: '#94a3b8' },
  statValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  filterSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' },
  searchWrapper: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e293b', padding: '12px 20px', borderRadius: '15px', border: '1px solid #334155', flex: 1 },
  searchInput: { background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  filterTabs: { display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px' },
  tab: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px' },
  tabActive: { backgroundColor: '#334155', color: '#fff', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#1e293b', borderRadius: '20px', padding: '20px', border: '1px solid #334155' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  idLabel: { color: '#64748b', fontSize: '12px' },
  miniLine: { width: '2px', height: '10px', backgroundColor: '#334155', margin: '4px 8px' },
  addr: { fontSize: '14px', margin: 0 },
  badge: (status) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
    backgroundColor: status === 'Delivered' ? '#065f4633' : status === 'InProgress' ? '#1e40af33' : '#92400e33',
    color: status === 'Delivered' ? '#34d399' : status === 'InProgress' ? '#60a5fa' : '#fbbf24'
  }),
  cardFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px', alignItems: 'center' },
  dateText: { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center' },
  tableWrapper: { backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  th: { padding: '15px', color: '#94a3b8', fontSize: '14px', borderBottom: '1px solid #334155' },
  td: { padding: '15px', fontSize: '14px', borderBottom: '1px solid #334155' },
  tableHeaderRow: { backgroundColor: '#33415566' },
  tableRow: { transition: 'background-color 0.2s' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: '#64748b', textAlign: 'center' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '24px', width: '450px', border: '1px solid #334155' },
  modalLabel: { fontSize: '12px', color: '#94a3b8', marginTop: '15px', display: 'block', marginBottom: '5px' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '10px', outline: 'none' },
  cancelBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', flex: 1, fontWeight: '600' },
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '20px' }
};

export default App;