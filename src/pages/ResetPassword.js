import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) { setError('Please fill both fields!'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters!'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match!'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await API.post('/api/reset-password', { token, newPassword: password });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(res.data.message || 'Something went wrong.');
      }
    } catch (e) {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <div style={s.brandRow}>
          <div style={s.brandLogoBox}>
            <svg width="26" height="26" viewBox="0 0 100 100">
              <polygon points="58,10 38,52 54,52 42,90 72,48 54,48 65,10" fill="white"/>
            </svg>
          </div>
          <span style={s.brandText}>ZEPPO</span>
        </div>

        {success ? (
          <div style={s.card}>
            <div style={s.successIcon}>✅</div>
            <h2 style={s.successTitle}>Password Reset!</h2>
            <p style={s.successText}>Your password has been changed successfully. Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div style={s.headingBlock}>
              <h1 style={s.heading}>Set new password</h1>
              <p style={s.subheading}>Choose a strong password you haven't used before.</p>
            </div>

            <div style={s.card}>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <div style={{ ...s.inputWrap, borderColor: error ? '#e74c3c' : '#e5e7eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input
                    style={s.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                  />
                  <span style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <div style={{ ...s.inputWrap, borderColor: error ? '#e74c3c' : '#e5e7eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <input
                    style={s.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              {error && (
                <div style={s.errorBox}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <Link to="/login" style={s.backLink}>← Back to Login</Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fb' },
  container: { maxWidth: '480px', margin: '0 auto', padding: '40px 24px 50px', minHeight: '100vh', boxSizing: 'border-box' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' },
  brandLogoBox: { width: '36px', height: '36px', background: '#ff6b00', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandText: { fontSize: '18px', fontWeight: '800', color: '#111827', letterSpacing: '1px' },
  headingBlock: { marginBottom: '28px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 8px' },
  subheading: { fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' },
  card: { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2', textAlign: 'center' },
  field: { marginBottom: '18px', textAlign: 'left' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa', borderRadius: '12px', padding: '13px 14px', border: '1.5px solid #e5e7eb' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14.5px', color: '#111827' },
  eyeBtn: { cursor: 'pointer', fontSize: '15px', flexShrink: 0, opacity: 0.7 },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '11px 14px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '16px', border: '1px solid #fecaca', textAlign: 'left' },
  btn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 14px rgba(255,107,0,0.3)' },
  backLink: { fontSize: '13.5px', color: '#6b7280', textDecoration: 'none', fontWeight: '600' },
  successIcon: { fontSize: '48px', marginBottom: '14px' },
  successTitle: { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '10px' },
  successText: { fontSize: '14px', color: '#6b7280', lineHeight: '1.6' },
};
