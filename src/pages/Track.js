import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Track() {
  const navigate = useNavigate();
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
      const res = await API.get('/api/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitRating = async () => {
    if (!rating) { alert('Please select a rating!'); return; }
    try {
      const token = localStorage.getItem('token');
      await API.post('/api/rating', {
        restaurant_id: ratingModal.restaurant_id,
        order_id: ratingModal.id,
        rating, review
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRatedOrders([...ratedOrders, ratingModal.id]);
      setRatingModal(null);
      setRating(0);
      setReview('');
      alert('✅ Thank you for your rating!');
    } catch(e) { alert('Error submitting rating!'); }
  };

  const statusSteps = [
    { key: 'pending', icon: '📝', label: 'Order Placed', desc: 'Your order has been received' },
    { key: 'confirmed', icon: '✅', label: 'Confirmed', desc: 'Restaurant confirmed your order' },
    { key: 'preparing', icon: '👨‍🍳', label: 'Preparing', desc: 'Your food is being prepared' },
    { key: 'on_the_way', icon: '🛵', label: 'On the Way', desc: 'Delivery boy is on the way' },
    { key: 'delivered', icon: '🎉', label: 'Delivered', desc: 'Order delivered successfully' },
  ];

  const getStepIndex = (status) => statusSteps.findIndex(s => s.key === status);

  const getPaymentBadge = (method) => method === 'upi' ? '💳 UPI' : '💵 Cash';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a0a0f', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '50px' }}>📦</div>
      <div style={{ color: '#ff6b00', fontWeight: '700' }}>Loading Orders...</div>
    </div>
  );

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <h2 style={s.headerTitle}>My Orders</h2>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{orders.length} orders</div>
      </div>

      <div style={s.content}>
        {orders.length === 0 ? (
          <div style={s.noOrders}>
            <div style={{ fontSize: '70px', marginBottom: '15px' }}>📦</div>
            <h2 style={s.noOrdersTitle}>No orders yet!</h2>
            <p style={s.noOrdersText}>Order something delicious 😋</p>
            <button style={s.browseBtn} onClick={() => navigate('/')}>Browse Restaurants →</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={s.orderCard}>
              {/* Order Header */}
              <div style={s.orderHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.orderRest}>🍽️ {order.restaurant_name}</div>
                  <div style={s.orderAddr}>📍 {order.customer_address}</div>
                  <div style={s.orderTime}>🕐 {order.created_at}</div>
                  <div style={s.paymentBadge}>{getPaymentBadge(order.payment_method)}</div>
                </div>
                <div style={s.orderTotal}>₹{order.total}</div>
              </div>

              {/* Items */}
              <div style={s.orderItems}>
                {(() => {
                  try {
                    const items = JSON.parse(order.items);
                    return items.map((item, i) => (
                      <span key={i} style={s.orderItem}>{item.name}</span>
                    ));
                  } catch { return null; }
                })()}
              </div>

              {/* Tracking Steps */}
              <div style={s.tracking}>
                {statusSteps.map((step, i) => {
                  const currentIndex = getStepIndex(order.status);
                  const isDone = i < currentIndex;
                  const isActive = i === currentIndex;
                  return (
                    <div key={step.key}>
                      <div style={s.step}>
                        <div style={{ ...s.stepIcon, background: isDone ? '#27ae60' : isActive ? '#ff6b00' : 'rgba(255,255,255,0.1)', color: isDone || isActive ? 'white' : 'rgba(255,255,255,0.3)' }}>
                          {step.icon}
                        </div>
                        <div style={s.stepInfo}>
                          <div style={{ ...s.stepLabel, color: isDone || isActive ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: isActive ? '700' : '400' }}>{step.label}</div>
                          <div style={{ ...s.stepDesc, color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>{step.desc}</div>
                        </div>
                        {isActive && <div style={s.activeDot} />}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div style={{ ...s.stepLine, background: isDone ? '#27ae60' : 'rgba(255,255,255,0.1)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rate Button */}
              {order.status === 'delivered' && !ratedOrders.includes(order.id) && (
                <button style={s.rateBtn} onClick={() => setRatingModal(order)}>⭐ Rate this order</button>
              )}
              {ratedOrders.includes(order.id) && (
                <div style={s.ratedBadge}>✅ Rated — Thank you!</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div style={s.bottomNav}>
        <div style={s.navItem} onClick={() => navigate('/')}><span style={s.navIcon}>🏠</span><span>Home</span></div>
        <div style={s.navItem} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
        <div style={{ ...s.navItem, color: '#ff6b00' }}><span style={s.navIcon}>📦</span><span>Orders</span></div>
        <div style={s.navItem} onClick={() => navigate('/profile')}><span style={s.navIcon}>👤</span><span>Profile</span></div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Rate {ratingModal.restaurant_name}</h3>
            <p style={s.modalSub}>How was your experience?</p>
            <div style={s.stars}>
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ ...s.star, color: i <= rating ? '#ffd700' : 'rgba(255,255,255,0.2)' }}
                  onClick={() => setRating(i)}>★</span>
              ))}
            </div>
            <textarea style={s.reviewInput} placeholder="Write a review (optional)..."
              value={review} onChange={e => setReview(e.target.value)} rows={3} />
            <button style={s.submitRating} onClick={submitRating}>Submit Rating</button>
            <button style={s.cancelRating} onClick={() => { setRatingModal(null); setRating(0); setReview(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#1a0a0f', paddingBottom: '70px' },
  header: { background: '#ff6b00', padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer' },
  headerTitle: { fontSize: '20px', fontWeight: '700', flex: 1 },
  content: { padding: '15px 16px' },
  noOrders: { textAlign: 'center', padding: '60px 20px' },
  noOrdersTitle: { fontSize: '22px', color: 'white', marginBottom: '8px' },
  noOrdersText: { color: 'rgba(255,255,255,0.5)', marginBottom: '20px' },
  browseBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  orderCard: { background: '#2a1520', borderRadius: '16px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  orderRest: { fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' },
  orderAddr: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '3px' },
  orderTime: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' },
  paymentBadge: { fontSize: '12px', color: '#ff6b00', fontWeight: '600' },
  orderTotal: { fontSize: '20px', fontWeight: '700', color: '#ff6b00' },
  orderItems: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' },
  orderItem: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' },
  tracking: { marginTop: '10px' },
  step: { display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' },
  stepIcon: { width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: '14px' },
  stepDesc: { fontSize: '12px' },
  activeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b00' },
  stepLine: { width: '2px', height: '20px', margin: '3px 0 3px 18px' },
  rateBtn: { width: '100%', padding: '12px', background: 'rgba(255,107,0,0.15)', color: '#ff6b00', border: '1.5px solid #ff6b00', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '15px' },
  ratedBadge: { textAlign: 'center', padding: '10px', color: '#27ae60', fontSize: '14px', fontWeight: '600', marginTop: '10px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#1a0a0f', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.3)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#2a1520', borderRadius: '20px', padding: '25px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '5px' },
  modalSub: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' },
  stars: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
  star: { fontSize: '40px', cursor: 'pointer', transition: '0.2s' },
  reviewInput: { width: '100%', padding: '12px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', color: 'white' },
  submitRating: { width: '100%', padding: '14px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  cancelRating: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
};
