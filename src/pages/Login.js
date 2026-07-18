import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 2500);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields!'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('name', res.data.name);
        localStorage.setItem('role', res.data.role);
        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setError(res.data.message);
      }
    } catch (e) {
      setError('Server error!');
    }
    setLoading(false);
  };

  if (showSplash) return (
    <div style={s.splash}>
      <div style={s.splashCircle1} />
      <div style={s.splashCircle2} />
      <div style={s.splashContent}>
        <div style={s.splashLogoBox}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="white" opacity="0.15"/>
            <polygon points="58,15 38,50 54,50 42,85 72,50 54,50 65,15" fill="white"/>
          </svg>
        </div>
        <h1 style={s.splashTitle}>ZEPPO</h1>
        <p style={s.splashSub}>Ghar tak, jhatpat!</p>
      </div>
      <div style={s.splashDots}>
        <div style={{...s.dot, background: 'white'}}/>
        <div style={{...s.dot, background: 'rgba(255,255,255,0.4)'}}/>
        <div style={{...s.dot, background: 'rgba(255,255,255,0.4)'}}/>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      {/* Top */}
      <div style={s.top}>
        <div style={s.topLogo}>
          <svg width="45" height="45" viewBox="0 0 100 100">
            <polygon points="58,10 38,52 54,52 42,90 72,48 54,48 65,10" fill="white"/>
          </svg>
          <span style={s.topLogoText}>ZEPPO</span>
        </div>
        <h2 style={s.topTitle}>Welcome back! 👋</h2>
        <p style={s.topSub}>Sign in to order from your favorite restaurants</p>
      </div>

      {/* Form */}
      <div style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>📧</span>
            <input style={s.input} type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>🔐</span>
            <input style={s.input} type="password" placeholder="Enter your password"
              value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
          </div>
        </div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <button style={{ ...s.btn, opacity: loading ? 0.8 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? '⏳ Signing in...' : 'Sign In →'}
        </button>

        <div style={s.orRow}>
          <div style={s.orLine} />
          <span style={s.orText}>New to ZEPPO?</span>
          <div style={s.orLine} />
        </div>

        <Link to="/signup" style={s.signupBtn}>Create Free Account</Link>

        <div style={s.partnerLink}>
          <Link to="/delivery-signup" style={s.partnerText}>🛵 Want to deliver? Join as Partner</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  splash: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#ff6b00', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  splashCircle1: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '-80px', right: '-80px' },
  splashCircle2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: '60px', left: '-60px' },
  splashContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 },
  splashLogoBox: { width: '100px', height: '100px', background: 'rgba(255,255,255,0.15)', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' },
  splashTitle: { fontSize: '42px', fontWeight: '900', color: 'white', letterSpacing: '5px', margin: 0 },
  splashSub: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0 },
  splashDots: { display: 'flex', gap: '8px', position: 'absolute', bottom: '50px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },

  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#1a0a0f' },
  top: { background: '#ff6b00', padding: '50px 25px 60px', color: 'white' },
  topLogo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  topLogoText: { fontSize: '26px', fontWeight: '900', color: 'white', letterSpacing: '3px' },
  topTitle: { fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 6px' },
  topSub: { fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 },
  form: { background: '#2a1520', borderRadius: '24px 24px 0 0', marginTop: '-20px', padding: '30px 22px 40px', minHeight: '55vh' },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 16px', border: '1.5px solid rgba(255,255,255,0.1)' },
  icon: { fontSize: '16px', flexShrink: 0 },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '15px', color: 'white' },
  error: { background: 'rgba(255,0,0,0.15)', color: '#ff6b6b', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '15px', border: '1px solid rgba(255,0,0,0.2)' },
  btn: { width: '100%', padding: '17px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px', marginBottom: '20px', boxSizing: 'border-box' },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  orLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
  orText: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' },
  signupBtn: { display: 'block', width: '100%', padding: '15px', background: 'transparent', color: '#ff6b00', border: '2px solid #ff6b00', borderRadius: '14px', fontSize: '15px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', marginBottom: '20px', boxSizing: 'border-box' },
  partnerLink: { textAlign: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  partnerText: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' },
};
