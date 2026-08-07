import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function RestaurantApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    restaurant_name: '', owner_name: '', category: '', address: '', phone: '',
    fssai_license: '', gst_number: '',
    bank_account_holder: '', bank_account_number: '', bank_ifsc: '',
  });
  const fssaiRef = useRef();
  const idProofRef = useRef();
  const addressProofRef = useRef();

  const update = (key, value) => setForm({ ...form, [key]: value });

  const uploadDoc = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await API.post('/api/upload/document', fd);
    return res.data.success ? res.data.url : '';
  };

  const validateStep = () => {
    if (step === 1 && (!form.restaurant_name || !form.owner_name || !form.category || !form.address || !form.phone)) {
      alert('Please fill all fields!');
      return false;
    }
    if (step === 2 && !form.fssai_license) {
      alert('FSSAI license number is required to sell food legally!');
      return false;
    }
    if (step === 3 && (!form.bank_account_holder || !form.bank_account_number || !form.bank_ifsc)) {
      alert('Bank details are required — this is where ZEPPO settles your earnings!');
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(step + 1); };

  const submitApplication = async () => {
    if (!fssaiRef.current?.files[0]) { alert('Please upload your FSSAI license photo!'); return; }
    if (!idProofRef.current?.files[0]) { alert('Please upload owner ID proof!'); return; }
    setSubmitting(true);
    try {
      const fssai_document = await uploadDoc(fssaiRef.current.files[0]);
      const id_proof_document = await uploadDoc(idProofRef.current.files[0]);
      const address_proof_document = addressProofRef.current?.files[0] ? await uploadDoc(addressProofRef.current.files[0]) : '';
      const res = await API.post('/api/restaurant-apply', { ...form, fssai_document, id_proof_document, address_proof_document });
      if (res.data.success) setSubmitted(true);
      else alert(res.data.message || 'Could not submit application.');
    } catch (e) {
      alert('Could not submit application. Try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.successCard}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
          <div style={s.successTitle}>Application Submitted!</div>
          <div style={s.successText}>ZEPPO will review your details and documents, then contact you at {form.phone} within 24-48 hours.</div>
          <button style={s.homeBtn} onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerTitle}>🍽️ Partner With ZEPPO</div>
          <div style={s.headerSub}>Step {step} of 4</div>
        </div>
        <div style={s.progressTrack}><div style={{ ...s.progressFill, width: (step / 4) * 100 + '%' }} /></div>

        <div style={s.body}>
          {step === 1 && (
            <div>
              <div style={s.stepTitle}>🏪 Restaurant Details</div>
              <label style={s.label}>Restaurant Name *</label>
              <input style={s.input} value={form.restaurant_name} onChange={e => update('restaurant_name', e.target.value)} />
              <label style={s.label}>Owner's Full Name *</label>
              <input style={s.input} value={form.owner_name} onChange={e => update('owner_name', e.target.value)} />
              <label style={s.label}>Category (e.g. North Indian, Fast Food) *</label>
              <input style={s.input} value={form.category} onChange={e => update('category', e.target.value)} />
              <label style={s.label}>Restaurant Address *</label>
              <input style={s.input} value={form.address} onChange={e => update('address', e.target.value)} />
              <label style={s.label}>Phone Number *</label>
              <input style={s.input} value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={s.stepTitle}>📄 Legal Documents</div>
              <label style={s.label}>FSSAI License Number *</label>
              <input style={s.input} value={form.fssai_license} onChange={e => update('fssai_license', e.target.value)} />
              <label style={s.label}>Upload FSSAI Certificate Photo *</label>
              <input type="file" ref={fssaiRef} accept="image/*" style={s.fileInput} />
              <label style={s.label}>GST Number (optional)</label>
              <input style={s.input} value={form.gst_number} onChange={e => update('gst_number', e.target.value)} />
              <label style={s.label}>Upload Owner ID Proof (Aadhar / PAN) *</label>
              <input type="file" ref={idProofRef} accept="image/*" style={s.fileInput} />
              <label style={s.label}>Upload Address Proof (optional)</label>
              <input type="file" ref={addressProofRef} accept="image/*" style={s.fileInput} />
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={s.stepTitle}>🏦 Bank Details</div>
              <div style={s.hint}>This is where ZEPPO settles your weekly earnings — enter it carefully.</div>
              <label style={s.label}>Account Holder Name *</label>
              <input style={s.input} value={form.bank_account_holder} onChange={e => update('bank_account_holder', e.target.value)} />
              <label style={s.label}>Account Number *</label>
              <input style={s.input} value={form.bank_account_number} onChange={e => update('bank_account_number', e.target.value)} />
              <label style={s.label}>IFSC Code *</label>
              <input style={s.input} value={form.bank_ifsc} onChange={e => update('bank_ifsc', e.target.value.toUpperCase())} />
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={s.stepTitle}>✅ Review &amp; Submit</div>
              <div style={s.summaryBox}>
                <div style={s.summaryRow}><b>{form.restaurant_name}</b> — {form.category}</div>
                <div style={s.summaryRow}>Owner: {form.owner_name} · {form.phone}</div>
                <div style={s.summaryRow}>{form.address}</div>
                <div style={s.summaryRow}>FSSAI: {form.fssai_license}</div>
                <div style={s.summaryRow}>Bank: {form.bank_account_holder} · {form.bank_ifsc}</div>
              </div>
              <div style={s.hint}>Once submitted, ZEPPO will review your documents. You'll get login access to your Restaurant Dashboard as soon as you're approved.</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {step > 1 && <button style={s.backBtn} onClick={() => setStep(step - 1)}>Back</button>}
            {step < 4 ? (
              <button style={s.nextBtn} onClick={nextStep}>Continue</button>
            ) : (
              <button style={s.nextBtn} onClick={submitApplication} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
  card: { background: 'white', borderRadius: '20px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  header: { background: '#ff6b00', padding: '24px', color: 'white' },
  headerTitle: { fontSize: '19px', fontWeight: '800' },
  headerSub: { fontSize: '12px', opacity: 0.9, marginTop: '4px' },
  progressTrack: { height: '4px', background: '#f0f0f0' },
  progressFill: { height: '100%', background: '#ff6b00', transition: 'width 0.3s' },
  body: { padding: '24px' },
  stepTitle: { fontSize: '17px', fontWeight: '800', color: '#222', marginBottom: '16px' },
  hint: { fontSize: '12.5px', color: '#888', marginBottom: '14px', lineHeight: '18px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#666', marginTop: '12px', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '14px', marginBottom: '4px' },
  fileInput: { width: '100%', marginBottom: '10px', fontSize: '13px' },
  summaryBox: { background: '#fff3e0', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  summaryRow: { fontSize: '13px', color: '#555', marginBottom: '6px' },
  backBtn: { flex: 1, padding: '14px', borderRadius: '10px', border: 'none', background: '#f0f0f0', color: '#666', fontWeight: '700', cursor: 'pointer' },
  nextBtn: { flex: 2, padding: '14px', borderRadius: '10px', border: 'none', background: '#ff6b00', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  successCard: { background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '420px' },
  successTitle: { fontSize: '22px', fontWeight: '800', color: '#27ae60', marginBottom: '12px' },
  successText: { fontSize: '14px', color: '#666', lineHeight: '20px', marginBottom: '24px' },
  homeBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
};
