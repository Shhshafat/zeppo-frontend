import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [showSplash, setShowSplash] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 2200);
  }, []);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) { setError('Please fill all fields!'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/login', { emailOrPhone, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('name', res.data.name);
        localStorage.setItem('role', res.data.role);
        if (res.data.role === 'admin') navigate('/admin');
        else if (res.data.role === 'delivery') navigate('/delivery');
        else if (res.data.role === 'restaurant') navigate('/restaurant-dashboard');
        else navigate('/');
      } else {
        setError(res.data.message);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  if (showSplash) return (
    <div style={s.splash}>
      <div style={s.splashGlow1} />
      <div style={s.splashGlow2} />
      <div style={s.splashContent}>
        <div style={s.splashLogoBox}>
          <svg width="52" height="52" viewBox="0 0 100 100">
            <polygon points="58,10 38,52 54,52 42,90 72,48 54,48 65,10" fill="#ff6b00"/>
          </svg>
        </div>
        <h1 style={s.splashTitle}>ZEPPO</h1>
        <p style={s.splashSub}>Ghar tak, jhatpat!</p>
      </div>
      <div style={s.splashLoader}><div style={s.splashLoaderBar} /></div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Brand */}
        <div style={s.brandRow}>
          <div style={s.brandLogoBox}>
            <svg width="26" height="26" viewBox="0 0 100 100">
              <polygon points="58,10 38,52 54,52 42,90 72,48 54,48 65,10" fill="white"/>
            </svg>
          </div>
          <span style={s.brandText}>ZEPPO</span>
        </div>

        {/* Heading */}
        <div style={s.headingBlock}>
          <h1 style={s.heading}>Welcome back</h1>
          <p style={s.subheading}>Sign in to continue ordering from your favorite local restaurants.</p>
        </div>

        {/* Card */}
        <div style={s.card}>
          <div style={s.field}>
            <label style={s.label}>Email or Phone Number</label>
            <div style={{ ...s.inputWrap, borderColor: error ? '#e74c3c' : '#e5e7eb' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <input
                style={s.input}
                placeholder="you@example.com or 9876543210"
                value={emailOrPhone}
                onKeyDown={handleKeyDown}
                onChange={e => { setEmailOrPhone(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div style={s.field}>
            <div style={s.labelRow}>
              <label style={s.label}>Password</label>
              <Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
            </div>
            <div style={{ ...s.inputWrap, borderColor: error ? '#e74c3c' : '#e5e7eb' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input
                style={s.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onKeyDown={handleKeyDown}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              <span style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} onClick={handleLogin} disabled={loading}>
            {loading ? (
              <span style={s.spinnerRow}><span style={s.spinner} /> Signing in...</span>
            ) : 'Sign In'}
          </button>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>New to ZEPPO?</span>
            <div style={s.dividerLine} />
          </div>

          <Link to="/signup" style={s.signupBtn}>Create an account</Link>
        </div>

        {/* Partner link */}
        <Link to="/delivery-signup" style={s.partnerCard}>
          <span style={s.partnerIcon}>🛵</span>
          <div>
            <div style={s.partnerTitle}>Become a Delivery Partner</div>
            <div style={s.partnerSub}>Earn daily, work near home</div>
          </div>
          <span style={s.partnerArrow}>›</span>
        </Link>

      </div>
    </div>
  );
}

const s = {
  // ---- Splash ----
  splash: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#0f0a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  splashGlow1: { position: 'absolute', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.25), transparent 70%)', top: '-100px', right: '-100px' },
  splashGlow2: { position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%)', bottom: '-80px', left: '-80px' },
  splashContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 1 },
  splashLogoBox: { width: '84px', height: '84px', background: 'white', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(255,107,0,0.35)' },
  splashTitle: { fontSize: '34px', fontWeight: '800', color: 'white', letterSpacing: '4px', margin: 0 },
  splashSub: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.5px' },
  splashLoader: { position: 'absolute', bottom: '60px', width: '120px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  splashLoaderBar: { width: '40%', height: '100%', background: '#ff6b00', borderRadius: '2px', animation: 'none' },

  // ---- Page ----
  page: { minHeight: '100vh', background: '#f8f9fb' },
  container: { maxWidth: '480px', margin: '0 auto', padding: '40px 24px 50px', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' },
  brandLogoBox: { width: '36px', height: '36px', background: '#ff6b00', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandText: { fontSize: '18px', fontWeight: '800', color: '#111827', letterSpacing: '1px' },

  headingBlock: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 8px' },
  subheading: { fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' },

  card: { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  field: { marginBottom: '18px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  forgotLink: { fontSize: '13px', color: '#ff6b00', fontWeight: '600', textDecoration: 'none' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa', borderRadius: '12px', padding: '13px 14px', border: '1.5px solid #e5e7eb', transition: '0.2s' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14.5px', color: '#111827' },
  eyeBtn: { cursor: 'pointer', fontSize: '15px', flexShrink: 0, opacity: 0.7 },

  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '11px 14px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '16px', border: '1px solid #fecaca' },

  btn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 4px 14px rgba(255,107,0,0.3)', transition: '0.2s' },
  spinnerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  spinner: { width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },

  divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  dividerLine: { flex: 1, height: '1px', background: '#eee' },
  dividerText: { fontSize: '12.5px', color: '#9ca3af', whiteSpace: 'nowrap' },

  signupBtn: { display: 'block', width: '100%', padding: '14px', background: 'white', color: '#111827', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14.5px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },

  partnerCard: { display: 'flex', alignItems: 'center', gap: '14px', background: 'white', borderRadius: '16px', padding: '16px', marginTop: '20px', textDecoration: 'none', border: '1px solid #f0f0f2', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  partnerIcon: { fontSize: '24px', width: '44px', height: '44px', background: '#fff3e0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  partnerTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '2px' },
  partnerSub: { fontSize: '12.5px', color: '#6b7280' },
  partnerArrow: { fontSize: '22px', color: '#d1d5db', marginLeft: 'auto' },
};
