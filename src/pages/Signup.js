import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../api';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referral_code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(f => ({ ...f, referral_code: ref.toUpperCase() }));
  }, [searchParams]);

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill all fields!'); return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/register', form);
      if (res.data.success) {
        setSuccess(form.referral_code ? 'Account created! ₹50 ZEPPO Money credited 🎉 Redirecting...' : 'Account created! Redirecting...');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError(res.data.message);
      }
    } catch (e) {
      setError('Server error!');
    }
    setLoading(false);
  };

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
        <h2 style={s.topTitle}>Getting started! 🚀</h2>
        <p style={s.topSub}>Create an account to continue</p>
      </div>

      {/* Form */}
      <div style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Full Name</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>👤</span>
            <input style={s.input} placeholder="Your full name"
              value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setError(''); }} />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>📧</span>
            <input style={s.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setError(''); }} />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Phone Number</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>📱</span>
            <input style={s.input} type="tel" placeholder="+91 XXXXXXXXXX"
              value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setError(''); }} />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <div style={s.inputWrap}>
            <span style={s.icon}>🔐</span>
            <input style={s.input} type="password" placeholder="Create a password"
              value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setError(''); }} />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Referral Code <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>(optional)</span></label>
          <div style={s.inputWrap}>
            <span style={s.icon}>🎁</span>
            <input style={s.input} placeholder="Enter friend's code — get ₹50!"
              value={form.referral_code} onChange={e => { setForm({...form, referral_code: e.target.value.toUpperCase()}); setError(''); }} />
          </div>
          {form.referral_code && <div style={s.referralHint}>🎉 You and your friend will both get ₹50 ZEPPO Money!</div>}
        </div>

        {error && <div style={s.error}>⚠️ {error}</div>}
        {success && <div style={s.success}>✅ {success}</div>}

        <button style={{ ...s.btn, opacity: loading ? 0.8 : 1 }} onClick={handleSignup} disabled={loading}>
          {loading ? '⏳ Creating account...' : 'Create Account →'}
        </button>

        <div style={s.orRow}>
          <div style={s.orLine} />
          <span style={s.orText}>Already have an account?</span>
          <div style={s.orLine} />
        </div>

        <Link to="/login" style={s.loginBtn}>Sign In</Link>

        <div style={s.partnerLink}>
          <Link to="/delivery-signup" style={s.partnerText}>🛵 Want to deliver? Join as Partner</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
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
  referralHint: { fontSize: '12px', color: '#ffd700', marginTop: '8px', paddingLeft: '4px' },
  error: { background: 'rgba(255,0,0,0.15)', color: '#ff6b6b', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '15px', border: '1px solid rgba(255,0,0,0.2)' },
  success: { background: 'rgba(39,174,96,0.15)', color: '#27ae60', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '15px', border: '1px solid rgba(39,174,96,0.2)' },
  btn: { width: '100%', padding: '17px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', letterSpacing: '1px', marginBottom: '20px', boxSizing: 'border-box' },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  orLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
  orText: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' },
  loginBtn: { display: 'block', width: '100%', padding: '15px', background: 'transparent', color: '#ff6b00', border: '2px solid #ff6b00', borderRadius: '14px', fontSize: '15px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', marginBottom: '20px', boxSizing: 'border-box' },
  partnerLink: { textAlign: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  partnerText: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' },
};
