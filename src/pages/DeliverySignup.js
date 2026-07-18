import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DeliverySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '', father_name: '', phone: '', aadhar: '',
    dob: '', address: '', has_bike: '', bike_number: '', education: ''
  });
  const [docs, setDocs] = useState({
    photo: null, aadhar_doc: null, pan: null, license: null, edu_cert: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (!form.full_name || !form.phone || !form.aadhar || !form.address) {
      setError('Please fill all required fields!');
      return;
    }
    try {
      await axios.post('/api/apply', form);
      setSubmitted(true);
    } catch (e) {
      setError('Server error! Please try again.');
    }
  };

  if (submitted) return (
    <div style={s.container}>
      <div style={s.successBox}>
        <div style={s.successIcon}>🎉</div>
        <h2 style={s.successTitle}>Application Submitted!</h2>
        <p style={s.successText}>We will review your application and contact you within 2-3 business days.</p>
        <p style={s.successText}>Make sure your phone number is active: <strong>{form.phone}</strong></p>
        <button style={s.orangeBtn} onClick={() => navigate('/')}>Go to Home</button>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={s.headerTitle}>Become a Delivery Partner</div>
          <div style={s.headerSub}>Step {step} of 3</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${(step / 3) * 100}%` }} />
      </div>

      {/* Step Indicators */}
      <div style={s.steps}>
        {['Personal Info', 'Documents', 'Upload'].map((label, i) => (
          <div key={i} style={s.stepItem}>
            <div style={{ ...s.stepDot, background: step > i ? '#ff6b00' : step === i + 1 ? '#ff6b00' : '#ddd', color: step >= i + 1 ? 'white' : '#888' }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <div style={{ ...s.stepLabel, color: step === i + 1 ? '#ff6b00' : '#888' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.content}>

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <>
            <div style={s.notice}>
              ⚠️ All fields are mandatory. False information will result in permanent ban and legal action.
            </div>

            <label style={s.label}>Full Name *</label>
            <input style={s.input} placeholder="Enter your full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />

            <label style={s.label}>Father's Name *</label>
            <input style={s.input} placeholder="Enter father's name" value={form.father_name} onChange={e => update('father_name', e.target.value)} />

            <label style={s.label}>Phone Number *</label>
            <input style={s.input} placeholder="9876543210" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />

            <label style={s.label}>Date of Birth *</label>
            <input style={s.input} type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />

            <label style={s.label}>Full Address *</label>
            <input style={s.input} placeholder="Village, Kupwara" value={form.address} onChange={e => update('address', e.target.value)} />

            <label style={s.label}>Aadhar Card Number *</label>
            <input style={s.input} placeholder="XXXX XXXX XXXX" value={form.aadhar} onChange={e => update('aadhar', e.target.value)} />

            <button style={s.orangeBtn} onClick={() => {
              if (!form.full_name || !form.phone || !form.aadhar || !form.address) {
                setError('Please fill all fields!'); return;
              }
              setError(''); setStep(2);
            }}>Next →</button>
          </>
        )}

        {/* Step 2 — Vehicle & Education */}
        {step === 2 && (
          <>
            <label style={s.label}>Do you have a Bike? *</label>
            <div style={s.radioGroup}>
              {['Yes', 'No'].map(opt => (
                <div key={opt} style={{ ...s.radioBtn, background: form.has_bike === opt ? '#ff6b00' : 'white', color: form.has_bike === opt ? 'white' : '#333', border: `1.5px solid ${form.has_bike === opt ? '#ff6b00' : '#e0e0e0'}` }} onClick={() => update('has_bike', opt)}>
                  {opt === 'Yes' ? '🛵 Yes, I have a bike' : '❌ No, I don\'t'}
                </div>
              ))}
            </div>

            {form.has_bike === 'Yes' && (
              <>
                <label style={s.label}>Bike Registration Number *</label>
                <input style={s.input} placeholder="JK01A-XXXX" value={form.bike_number} onChange={e => update('bike_number', e.target.value)} />
              </>
            )}

            <label style={s.label}>Highest Education *</label>
            <div style={s.radioGroup}>
              {['8th Pass', '10th Pass', '12th Pass', 'Graduate'].map(opt => (
                <div key={opt} style={{ ...s.radioBtn, background: form.education === opt ? '#ff6b00' : 'white', color: form.education === opt ? 'white' : '#333', border: `1.5px solid ${form.education === opt ? '#ff6b00' : '#e0e0e0'}` }} onClick={() => update('education', opt)}>
                  🎓 {opt}
                </div>
              ))}
            </div>

            <button style={s.orangeBtn} onClick={() => {
              if (!form.has_bike || !form.education) {
                setError('Please fill all fields!'); return;
              }
              setError(''); setStep(3);
            }}>Next →</button>
          </>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
              Upload clear photos of your documents. All documents are required.
            </p>

            {[
              { key: 'photo', label: '📷 Your Photograph', desc: 'Recent passport size photo' },
              { key: 'aadhar_doc', label: '🪪 Aadhar Card', desc: 'Front and back side' },
              { key: 'pan', label: '🪪 PAN Card', desc: 'Clear photo of PAN card' },
              { key: 'license', label: '🚗 Driving License', desc: 'Valid driving license' },
              { key: 'edu_cert', label: '📜 Education Certificate', desc: '8th/10th/12th marksheet' },
            ].map(doc => (
              <div key={doc.key} style={s.uploadBox}>
                <div style={s.uploadLeft}>
                  <div style={s.uploadLabel}>{doc.label}</div>
                  <div style={s.uploadDesc}>{doc.desc}</div>
                  {docs[doc.key] && <div style={s.uploadDone}>✅ {docs[doc.key].name}</div>}
                </div>
                <label style={s.uploadBtn}>
                  {docs[doc.key] ? 'Change' : 'Upload'}
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setDocs({ ...docs, [doc.key]: e.target.files[0] })} />
                </label>
              </div>
            ))}

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <button style={s.orangeBtn} onClick={handleSubmit}>
              ✅ Submit Application
            </button>
          </>
        )}

        {error && step !== 3 && <div style={s.errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f7f7f7' },
  header: { background: '#ff6b00', padding: '50px 16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer' },
  headerTitle: { fontSize: '18px', fontWeight: '700' },
  headerSub: { fontSize: '13px', opacity: '0.8', marginTop: '2px' },
  progressBar: { height: '4px', background: '#ffe0cc' },
  progressFill: { height: '100%', background: '#ff6b00', transition: '0.3s' },
  steps: { display: 'flex', justifyContent: 'space-around', padding: '15px 16px', background: 'white', marginBottom: '10px' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  stepDot: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
  stepLabel: { fontSize: '11px', fontWeight: '600' },
  content: { padding: '15px 16px 40px' },
  notice: { background: '#fff3e0', border: '1px solid #ff6b00', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#e05a00', marginBottom: '20px', lineHeight: '1.5' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px', marginTop: '15px' },
  input: { width: '100%', padding: '13px 15px', border: '1.5px solid #e0e0e0', borderRadius: '12px', fontSize: '15px', outline: 'none', background: 'white', boxSizing: 'border-box', marginBottom: '5px' },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '5px' },
  radioBtn: { padding: '13px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'center' },
  orangeBtn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '20px', boxSizing: 'border-box' },
  uploadBox: { background: 'white', borderRadius: '12px', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  uploadLeft: { flex: 1 },
  uploadLabel: { fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '3px' },
  uploadDesc: { fontSize: '12px', color: '#888' },
  uploadDone: { fontSize: '12px', color: '#27ae60', marginTop: '4px' },
  uploadBtn: { background: '#ff6b00', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '10px' },
  errorBox: { background: '#fff3f3', color: '#c0392b', padding: '12px', borderRadius: '10px', fontSize: '14px', marginTop: '15px' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '30px 20px', textAlign: 'center' },
  successIcon: { fontSize: '80px', marginBottom: '20px' },
  successTitle: { fontSize: '26px', fontWeight: '800', color: '#27ae60', marginBottom: '15px' },
  successText: { fontSize: '15px', color: '#666', marginBottom: '10px', lineHeight: '1.6' },
};
