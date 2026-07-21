import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import API from '../api';

export default function Track() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratedOrders, setRatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/api/my-orders', { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitRating = async () => {
    if (!rating) { alert('Please select a rating!'); return; }
    try {
      const token = localStorage.getItem('token');
      await API.post('/api/rating', { restaurant_id: ratingModal.restaurant_id, order_id: ratingModal.id, rating, review }, { headers: { Authorization: `Bearer ${token}` } });
      setRatedOrders([...ratedOrders, ratingModal.id]);
      setRatingModal(null); setRating(0); setReview('');
      alert('✅ Thank you for your rating!');
    } catch(e) { alert('Error submitting rating!'); }
  };

  const statusSteps = [
    { key: 'pending', icon: '📝', label: 'Order Placed' },
    { key: 'confirmed', icon: '✅', label: 'Confirmed' },
    { key: 'preparing', icon: '👨‍🍳', label: 'Preparing' },
    { key: 'on_the_way', icon: '🛵', label: 'On the Way' },
    { key: 'delivered', icon: '🎉', label: 'Delivered' },
  ];

  const getStepIndex = (status) => statusSteps.findIndex(s => s.key === status);
  const getPaymentBadge = (method) => method === 'upi' ? '💳 UPI' : '💵 Cash';

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fb', flexDirection: 'column', gap: '18px' }}>
      <style>{`@keyframes zeppoSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#ff6b00', fontWeight: '800', fontSize: '20px', letterSpacing: '3px' }}>ZEPPO</div>
      <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,107,0,0.15)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'zeppoSpin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
          <div style={s.headerTitle}>My Orders</div>
          <div style={s.headerCount}>{orders.length}</div>
        </div>

        <div style={s.content}>
          {orders.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: '70px', marginBottom: '15px' }}>📦</div>
              <h2 style={s.emptyTitle}>No orders yet!</h2>
              <p style={s.emptyText}>Order something delicious 😋</p>
              <button style={s.browseBtn} onClick={() => navigate('/')}>Browse Restaurants →</button>
            </div>
          ) : (
            <>
              {activeOrders.length > 0 && (
                <>
                  <div style={s.sectionLabel}>🔥 Active Orders</div>
                  {activeOrders.map(order => {
                    const currentIndex = getStepIndex(order.status);
                    return (
                      <div key={order.id} style={s.activeCard}>
                        <div style={s.orderHeaderRow}>
                          <div>
                            <div style={s.orderRest}>🍽️ {order.restaurant_name}</div>
                            <div style={s.orderTime}>Ordered at {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <div style={s.orderTotal}>₹{order.total}</div>
                        </div>

                        <div style={s.progressTrack}>
                          <div style={{ ...s.progressFill, width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }} />
                          {statusSteps.map((step, i) => (
                            <div key={step.key} style={{ ...s.progressDot, left: `${(i / (statusSteps.length - 1)) * 100}%`, background: i <= currentIndex ? '#ff6b00' : '#e5e7eb' }}>
                              {i <= currentIndex ? '✓' : ''}
                            </div>
                          ))}
                        </div>
                        <div style={s.progressLabels}>
                          {statusSteps.map((step, i) => (
                            <div key={step.key} style={{ ...s.progressLabel, color: i === currentIndex ? '#ff6b00' : i < currentIndex ? '#27ae60' : '#aaa', fontWeight: i === currentIndex ? '700' : '500' }}>
                              {step.label}
                            </div>
                          ))}
                        </div>

                        <div style={s.currentStatusBox}>
                          <span style={{ fontSize: '20px' }}>{statusSteps[currentIndex]?.icon}</span>
                          <div>
                            <div style={s.currentStatusText}>{statusSteps[currentIndex]?.label}</div>
                            <div style={s.currentStatusSub}>{getPaymentBadge(order.payment_method)} · 📍 {order.customer_address}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {pastOrders.length > 0 && (
                <>
                  <div style={s.sectionLabel}>Order History</div>
                  {pastOrders.map(order => (
                    <div key={order.id} style={s.pastCard}>
                      <div style={s.orderHeaderRow}>
                        <div>
                          <div style={s.orderRest}>🍽️ {order.restaurant_name}</div>
                          <div style={s.orderTime}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                        <div style={s.orderTotal}>₹{order.total}</div>
                      </div>
                      <div style={s.orderItems}>
                        {(() => { try { return JSON.parse(order.items).slice(0, 3).map((i, idx) => <span key={idx} style={s.orderItemChip}>{i.name}</span>); } catch { return null; } })()}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{ ...s.statusPill, ...(order.status === 'delivered' ? { background: '#d1e7dd', color: '#0a3622' } : { background: '#f8d7da', color: '#842029' }) }}>
                          {order.status === 'delivered' ? '✅ Delivered' : '❌ Cancelled'}
                        </span>
                        {order.status === 'delivered' && !ratedOrders.includes(order.id) && (
                          <button style={s.rateBtn} onClick={() => setRatingModal(order)}>⭐ Rate</button>
                        )}
                        {ratedOrders.includes(order.id) && <span style={{ fontSize: '12px', color: '#27ae60', fontWeight: '600' }}>✅ Rated</span>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div style={s.bottomNav}>
          <div style={s.navItem} onClick={() => navigate('/')}><span style={s.navIcon}>🏠</span><span>Home</span></div>
          <div style={s.navItem} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
          <div style={{ ...s.navItem, position: 'relative' }} onClick={() => navigate('/cart')}>
            <span style={s.navIcon}>🛒</span><span>Cart</span>
            {cartCount > 0 && <span style={s.navCartBadge}>{cartCount}</span>}
          </div>
          <div style={{ ...s.navItem, color: '#ff6b00' }}><span style={s.navIcon}>📦</span><span>Orders</span></div>
          <div style={s.navItem} onClick={() => navigate('/profile')}><span style={s.navIcon}>👤</span><span>Profile</span></div>
        </div>

        {ratingModal && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>Rate {ratingModal.restaurant_name}</h3>
              <p style={s.modalSub}>How was your experience?</p>
              <div style={s.stars}>
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ ...s.star, color: i <= rating ? '#ffd700' : '#e5e7eb' }} onClick={() => setRating(i)}>★</span>
                ))}
              </div>
              <textarea style={s.reviewInput} placeholder="Write a review (optional)..." value={review} onChange={e => setReview(e.target.value)} rows={3} />
              <button style={s.submitRating} onClick={submitRating}>Submit Rating</button>
              <button style={s.cancelRating} onClick={() => { setRatingModal(null); setRating(0); setReview(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fb' },
  container: { maxWidth: '480px', margin: '0 auto', paddingBottom: '70px' },
  header: { background: '#ff6b00', padding: '50px 16px 18px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer' },
  headerTitle: { fontSize: '19px', fontWeight: '700', flex: 1 },
  headerCount: { background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  content: { padding: '16px' },
  sectionLabel: { fontSize: '13px', fontWeight: '700', color: '#6b7280', margin: '18px 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' },

  activeCard: { background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #fde8d5' },
  orderHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' },
  orderRest: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  orderTime: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  orderTotal: { fontSize: '17px', fontWeight: '800', color: '#ff6b00' },

  progressTrack: { position: 'relative', height: '4px', background: '#f3f4f6', borderRadius: '2px', margin: '0 6px 8px' },
  progressFill: { position: 'absolute', top: 0, left: 0, height: '100%', background: '#ff6b00', borderRadius: '2px', transition: '0.4s' },
  progressDot: { position: 'absolute', top: '-6px', width: '16px', height: '16px', borderRadius: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '9px', fontWeight: '700', border: '2px solid white', transition: '0.4s' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  progressLabel: { fontSize: '9.5px', textAlign: 'center', flex: 1, whiteSpace: 'nowrap' },

  currentStatusBox: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff8f0', borderRadius: '12px', padding: '12px' },
  currentStatusText: { fontSize: '14px', fontWeight: '700', color: '#111827' },
  currentStatusSub: { fontSize: '11.5px', color: '#6b7280', marginTop: '2px' },

  pastCard: { background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  orderItems: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' },
  orderItemChip: { background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px' },
  statusPill: { fontSize: '11.5px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px' },
  rateBtn: { background: '#fff3e0', color: '#ff6b00', border: '1px solid #ff6b00', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },

  emptyBox: { textAlign: 'center', padding: '60px 20px' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  emptyText: { color: '#9ca3af', marginBottom: '20px' },
  browseBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },

  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: '#888', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
  navCartBadge: { position: 'absolute', top: '2px', right: '18px', background: '#27ae60', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', textAlign: 'center' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '5px' },
  modalSub: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
  stars: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
  star: { fontSize: '38px', cursor: 'pointer' },
  reviewInput: { width: '100%', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '15px' },
  submitRating: { width: '100%', padding: '14px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  cancelRating: { width: '100%', padding: '12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
};
