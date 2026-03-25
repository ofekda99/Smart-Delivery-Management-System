import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Box, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

//const API_BASE = 'https://localhost:44333/api';
const API_BASE = 'https://smart-delivery-management-system-t6lh.onrender.com/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/User/login`, { email, password });
      
      const { token, role, name } = res.data;
      
      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);

      toast.success(`שלום ${name || 'מחובר'}, התחברת בהצלחה!`);

      if (role === 'Admin') {
        navigate('/deliveries');
      } else {
        navigate('/courier');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "שגיאה בפרטי ההתחברות";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* אלמנטים דקורטיביים ברקע (עיגולי אור) */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <Box size={32} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={styles.title}>LogiTrack <span style={{color: '#3b82f6'}}>Pro</span></h1>
          <p style={styles.subtitle}>מערכת ניהול והפצה חכמה</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>אימייל</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" style={styles.icon} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>סיסמה</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.icon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} color="#3b82f6" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <RefreshCw className="animate-spin" size={20} /> : 'כניסה למערכת'}
          </button>
        </form>

        <div style={styles.footer}>
          <ShieldCheck size={14} color="#64748b" />
          <p style={styles.footerText}>חיבור מאובטח לקצה לקצה</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0f172a', // background color with dark mode vibes
    direction: 'rtl', 
    fontFamily: "'Heebo', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  bgGlow1: {
    position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
    borderRadius: '50%', zIndex: 0
  },
  bgGlow2: {
    position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0) 70%)',
    borderRadius: '50%', zIndex: 0
  },
  card: { 
    width: '90%', 
    maxWidth: '420px', 
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Glassmorphism
    backdropFilter: 'blur(12px)',
    padding: '40px', 
    borderRadius: '24px', 
    border: '1px solid #334155',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1
  },
  header: { textAlign: 'center', marginBottom: '35px' },
  logoCircle: { 
    width: '60px', height: '60px', 
    backgroundColor: '#3b82f6', 
    borderRadius: '16px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    margin: '0 auto 20px',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
  },
  title: { fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 10px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginRight: '4px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', right: '16px' },
  input: { 
    width: '100%', 
    padding: '14px 48px 14px 16px', 
    borderRadius: '12px', 
    border: '1px solid #334155', 
    fontSize: '15px', 
    outline: 'none', 
    backgroundColor: '#0f172a', 
    color: '#fff',
    transition: '0.2s focus',
  },
  eyeBtn: { position: 'absolute', left: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  submitBtn: { 
    width: '100%', 
    padding: '16px', 
    borderRadius: '12px', 
    border: 'none', 
    backgroundColor: '#3b82f6', 
    color: '#fff', 
    fontSize: '16px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: '0.2s', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', 
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  footer: { marginTop: '30px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  footerText: { fontSize: '12px', color: '#64748b', margin: 0 }
};

export default Login;