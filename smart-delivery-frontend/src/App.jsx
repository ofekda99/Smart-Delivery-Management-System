import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // 1. הגדרת המשתנים (State) - איפה שומרים את הנתונים
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. פונקציה שפונה ל-Backend (C#)
  const fetchData = async () => {
    try {
      setLoading(true);
      // *** שים לב: תשנה את הפורט (7000) לפורט האמיתי של ה-API שלך! ***
      const response = await axios.get('https://localhost:44333/api/Deliveries');
      setDeliveries(response.data);
      setLoading(false);
    } catch (err) {
      console.error("שגיאה בחיבור לשרת:", err);
      setError("לא מצליח למשוך נתונים. וודא שה-Backend רץ ושהגדרת CORS.");
      setLoading(false);
    }
  };

  // 3. הרצה של הפונקציה ברגע שהדף עולה
  useEffect(() => {
    fetchData();
  }, []);

  // תצוגת טעינה או שגיאה
  if (loading) return <div style={styles.center}>טוען נתונים מהמערכת...</div>;
  if (error) return <div style={{...styles.center, color: 'red'}}>{error}</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📦 מערכת ניהול משלוחים חכמה</h1>
        <p>סטודנט שנה ג' - פרויקט Full Stack</p>
      </header>

      <div style={styles.grid}>
        {deliveries.length === 0 ? (
          <p>אין משלוחים במערכת כרגע.</p>
        ) : (
          deliveries.map((d) => (
            <div key={d.id} style={styles.card}>
              <h3>משלוח #{d.id}</h3>
              <p><strong>יעד:</strong> {d.address}</p>
              <div style={styles.statusBadge(d.status)}>
                {d.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// עיצוב בסיסי (במקום CSS נפרד, כדי שיהיה לך קל)
const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, Tahoma, sans-serif', direction: 'rtl' },
  header: { borderBottom: '2px solid #eee', marginBottom: '20px', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { 
    border: '1px solid #ddd', padding: '15px', borderRadius: '12px', 
    backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
  },
  center: { textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' },
  statusBadge: (status) => ({
    display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
    backgroundColor: status === 'Delivered' ? '#d4edda' : '#fff3cd',
    color: status === 'Delivered' ? '#155724' : '#856404',
    marginTop: '10px'
  })
};

export default App;