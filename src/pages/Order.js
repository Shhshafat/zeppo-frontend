import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState({});
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(localStorage.getItem('locationSub') || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [ordered, setOrdered] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [showRatings, setShowRatings] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const restRes = await API.get('/api/restaurants');
      const rest = restRes.data.find(r => r.id == id);
      setRestaurant(rest);
      const menuRes = await API.get(`/api/menu/${id}`);
      const cats = {};
      menuRes.data.forEach(item => {
        if (!cats[item.category]) cats[item.category] = [];
        cats[item.category].push(item);
      });
      setCategories(cats);
      const ratingsRes = await API.get(`/api/ratings/${id}`);
      setRatings(ratingsRes.data);
    } catch(e) { console.error(e); }
  };

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (index) => { const c = [...cart]; c.splice(index, 1); setCart(c); };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = Math.max(0, subtotal - couponDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { setCouponMsg('Please enter a coupon code!'); return; }
    try {
      const res = await API.post('/api/coupons/verify', { code: couponCode.toUpperCase(), total: subtotal });
      if (res.data.success) {
        setCouponDiscount(res.data.discount);
        setCouponApplied(true);
        setCouponMsg(`✅ Coupon applied! You saved ₹${res.data.discount}`);
      } else {
        setCouponMsg(`❌ ${res.data.message}`);
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch(e) {
      setCouponMsg('❌ Error applying coupon!');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponMsg('');
  };

  const placeOrder = async () => {
    if (!name || !phone || !address) { alert('Please fill all fields!'); return; }
    if (cart.length === 0) { alert('Please add items to cart!'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/api/order', {
        customer_name: name, customer_phone: phone,
        customer_address: address, restaurant_id: id,
        restaurant_name: restaurant?.name, items: cart,
        total, payment_method: paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setOrdered(true);
    } catch(e) { alert('Error placing order!'); }
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : restaurant?.rating;

  if (ordered) return (
    <div style={s.container}>
      <div style={s.successBox}>
        <div style={{ fontSize: '80px', marginBottom: '15px' }}>{paymentMethod === 'upi' ? '💳' : '🎉'}</div>
        <h2 style={s.successTitle}>Order Placed!</h2>
        {paymentMethod === 'upi' && (
          <div style={s.upiBox}>
            <div style={s.upiTitle}>Pay via UPI</div>
            <div style={s.upiId}>zeppo@upi</div>
            <div style={s.upiAmount}>Amount: ₹{total}</div>
            {couponDiscount > 0 && <div style={s.upiSaved}>You saved ₹{couponDiscount} with coupon! 🎉</div>}
            <div style={s.upiNote}>Send payment to above UPI ID to confirm order!</div>
            <div style={s.upiApps}>
              <div style={s.upiApp}>📱 GPay</div>
              <div style={s.upiApp}>📱 PhonePe</div>
              <div style={s.upiApp}>📱 Paytm</div>
            </div>
          </div>
        )}
        {paymentMethod === 'cash' && (
          <div>
            <p style={s.successText}>Pay ₹{total} cash on delivery 💵</p>
            {couponDiscount > 0 && <p style={{ color: '#27ae60', fontWeight: '700' }}>You saved ₹{couponDiscount}! 🎉</p>}
          </div>
        )}
        <p style={s.successText}>ZEPPO will deliver soon! 🛵</p>
        <button style={s.trackBtn} onClick={() => navigate('/track')}>Track Order →</button>
        <button style={s.homeBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.restName}>{restaurant?.emoji} {restaurant?.name}</div>
          <div style={s.restMeta}>{restaurant?.category} • {restaurant?.address}</div>
        </div>
      </div>

      {/* Rating Bar */}
      <div style={s.ratingBar} onClick={() => setShowRatings(!showRatings)}>
        <div style={s.ratingLeft}>
          <span style={s.ratingBadge}>⭐ {avgRating}</span>
          <span style={s.ratingCount}>{ratings.length} ratings</span>
        </div>
        <span style={s.ratingArrow}>{showRatings ? '▲' : '▼'} Reviews</span>
      </div>

      {/* Reviews */}
      {showRatings && (
        <div style={s.reviewsBox}>
          {ratings.length === 0 ? (
            <p style={s.noReview}>No reviews yet — be the first!</p>
          ) : (
            ratings.slice(0, 5).map((r, i) => (
              <div key={i} style={s.reviewItem}>
                <div style={s.reviewHeader}>
                  <span style={s.reviewName}>{r.user_name || 'User'}</span>
                  <span>{'⭐'.repeat(r.rating)}</span>
                </div>
                {r.review && <p style={s.reviewText}>{r.review}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Menu */}
      <div style={s.menuSection}>
        {Object.keys(categories).length === 0 ? (
          <div style={s.noMenu}>Menu coming soon! 🍽️</div>
        ) : (
          Object.entries(categories).map(([cat, items]) => (
            <div key={cat}>
              <div style={s.categoryTitle}>🍽️ {cat}</div>
              {items.map(item => (
                <div key={item.id} style={s.menuItem}>
                  <div style={s.itemLeft}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={s.itemImg}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={s.itemEmoji}>🍽️</div>
                    )}
                  </div>
                  <div style={s.itemInfo}>
                    <div style={s.itemName}>{item.name}</div>
                    {item.description && <div style={s.itemDesc}>{item.description}</div>}
                    <div style={s.itemPrice}>₹{item.price}</div>
                  </div>
                  <button style={s.addBtn} onClick={() => addToCart(item)}>+ Add</button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div style={s.cartSection}>
          <h3 style={s.cartTitle}>🛒 Your Cart</h3>
          {cart.map((item, i) => (
            <div key={i} style={s.cartItem}>
              <span style={s.cartItemName}>{item.name}</span>
              <span>₹{item.price} <button onClick={() => removeFromCart(i)} style={s.removeBtn}>×</button></span>
            </div>
          ))}

          {/* Bill */}
          <div style={s.billBox}>
            <div style={s.billRow}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={s.billRow}>
              <span>Delivery</span>
              <span style={{ color: '#27ae60' }}>FREE</span>
            </div>
            {couponDiscount > 0 && (
              <div style={s.billRow}>
                <span style={{ color: '#27ae60' }}>Coupon Discount</span>
                <span style={{ color: '#27ae60' }}>-₹{couponDiscount}</span>
              </div>
            )}
            <div style={s.totalRow}>
              <span>Total</span>
              <span style={{ color: '#ff6b00' }}>₹{total}</span>
            </div>
          </div>

          {/* Coupon */}
          <div style={s.couponBox}>
            <div style={s.couponTitle}>🎟️ Have a coupon?</div>
            {!couponApplied ? (
              <div style={s.couponRow}>
                <input
                  style={s.couponInput}
                  placeholder="Enter coupon code (e.g. ZEPPO50)"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); }}
                />
                <button style={s.couponBtn} onClick={applyCoupon}>Apply</button>
              </div>
            ) : (
              <div style={s.couponApplied}>
                <span style={{ color: '#27ae60', fontWeight: '700' }}>✅ {couponCode} applied!</span>
                <button style={s.couponRemoveBtn} onClick={removeCoupon}>Remove</button>
              </div>
            )}
            {couponMsg && (
              <div style={{ fontSize: '13px', color: couponApplied ? '#27ae60' : '#e74c3c', marginTop: '6px' }}>
                {couponMsg}
              </div>
            )}
            <div style={s.couponHint}>Try: ZEPPO50</div>
          </div>

          {/* Delivery Details */}
          <div style={s.deliveryForm}>
            <h3 style={s.formTitle}>📦 Delivery Details</h3>
            <input style={s.input} placeholder="Your Full Name *" value={name} onChange={e => setName(e.target.value)} />
            <input style={s.input} placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={s.input} placeholder="Delivery Address *" value={address} onChange={e => setAddress(e.target.value)} />

            {/* Payment */}
            <h3 style={s.formTitle}>💳 Payment Method</h3>
            <div style={s.paymentOptions}>
              <div style={{ ...s.paymentCard, border: paymentMethod === 'cash' ? '2px solid #ff6b00' : '2px solid #e0e0e0', background: paymentMethod === 'cash' ? '#fff3e0' : 'white' }}
                onClick={() => setPaymentMethod('cash')}>
                <div style={s.paymentIcon}>💵</div>
                <div style={s.paymentLabel}>Cash on Delivery</div>
                <div style={s.paymentSub}>Pay when delivered</div>
                {paymentMethod === 'cash' && <div style={s.paymentCheck}>✓</div>}
              </div>
              <div style={{ ...s.paymentCard, border: paymentMethod === 'upi' ? '2px solid #ff6b00' : '2px solid #e0e0e0', background: paymentMethod === 'upi' ? '#fff3e0' : 'white' }}
                onClick={() => setPaymentMethod('upi')}>
                <div style={s.paymentIcon}>📱</div>
                <div style={s.paymentLabel}>UPI Payment</div>
                <div style={s.paymentSub}>GPay, PhonePe, Paytm</div>
                {paymentMethod === 'upi' && <div style={s.paymentCheck}>✓</div>}
              </div>
            </div>

            {paymentMethod === 'upi' && (
              <div style={s.upiPreview}>
                <div style={s.upiPreviewTitle}>UPI ID: <strong>zeppo@upi</strong></div>
                <div style={s.upiPreviewSub}>Payment details shown after placing order</div>
              </div>
            )}

            <button style={s.orderBtn} onClick={placeOrder}>
              {paymentMethod === 'upi' ? `💳 Pay ₹${total} via UPI` : `✅ Place Order — ₹${total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', paddingBottom: '20px' },
  header: { background: '#ff6b00', color: 'white', padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '15px' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer' },
  restName: { fontSize: '18px', fontWeight: '700' },
  restMeta: { fontSize: '13px', opacity: '0.9', marginTop: '3px' },
  ratingBar: { background: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  ratingLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  ratingBadge: { background: '#27ae60', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' },
  ratingCount: { fontSize: '13px', color: '#888' },
  ratingArrow: { fontSize: '13px', color: '#ff6b00', fontWeight: '600' },
  reviewsBox: { background: 'white', padding: '15px 16px', marginBottom: '10px' },
  noReview: { color: '#888', fontSize: '14px', textAlign: 'center' },
  reviewItem: { padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  reviewName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  reviewText: { fontSize: '13px', color: '#666', lineHeight: '1.5' },
  menuSection: { padding: '15px 16px' },
  categoryTitle: { fontSize: '16px', fontWeight: '700', color: '#ff6b00', margin: '15px 0 10px', borderBottom: '2px solid #ff6b00', paddingBottom: '5px' },
  menuItem: { background: 'white', borderRadius: '12px', padding: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  itemLeft: { flexShrink: 0 },
  itemImg: { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' },
  itemEmoji: { width: '60px', height: '60px', borderRadius: '10px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '15px', fontWeight: '600', color: '#333' },
  itemDesc: { fontSize: '12px', color: '#888', marginTop: '3px' },
  itemPrice: { fontSize: '15px', fontWeight: '700', color: '#ff6b00', marginTop: '5px' },
  addBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 },
  cartSection: { margin: '0 16px', background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cartTitle: { fontSize: '16px', color: '#333', marginBottom: '12px', fontWeight: '700' },
  cartItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '14px' },
  cartItemName: { color: '#333' },
  removeBtn: { background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px' },
  billBox: { background: '#f9f9f9', borderRadius: '10px', padding: '12px', margin: '12px 0' },
  billRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px', color: '#555' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '16px', fontWeight: '700', color: '#333', borderTop: '1px solid #eee', marginTop: '5px' },
  couponBox: { background: '#f9f9f9', borderRadius: '12px', padding: '15px', marginBottom: '15px' },
  couponTitle: { fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '10px' },
  couponRow: { display: 'flex', gap: '8px' },
  couponInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', textTransform: 'uppercase' },
  couponBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  couponApplied: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fff4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #27ae60' },
  couponRemoveBtn: { background: 'none', border: 'none', color: '#e74c3c', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  couponHint: { fontSize: '12px', color: '#aaa', marginTop: '6px' },
  deliveryForm: { marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' },
  formTitle: { fontSize: '15px', color: '#333', marginBottom: '12px', fontWeight: '700' },
  input: { width: '100%', padding: '12px 15px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' },
  paymentOptions: { display: 'flex', gap: '12px', marginBottom: '15px' },
  paymentCard: { flex: 1, padding: '15px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', position: 'relative', transition: '0.2s' },
  paymentIcon: { fontSize: '24px', marginBottom: '6px' },
  paymentLabel: { fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '3px' },
  paymentSub: { fontSize: '11px', color: '#888' },
  paymentCheck: { position: 'absolute', top: '8px', right: '8px', background: '#ff6b00', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
  upiPreview: { background: '#fff3e0', border: '1px solid #ff6b00', borderRadius: '10px', padding: '12px', marginBottom: '15px', textAlign: 'center' },
  upiPreviewTitle: { fontSize: '15px', color: '#333', marginBottom: '5px' },
  upiPreviewSub: { fontSize: '12px', color: '#888' },
  orderBtn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '30px 20px', textAlign: 'center' },
  successTitle: { fontSize: '26px', fontWeight: '800', color: '#27ae60', marginBottom: '15px' },
  successText: { fontSize: '15px', color: '#666', marginBottom: '10px' },
  upiBox: { background: '#fff3e0', border: '2px solid #ff6b00', borderRadius: '16px', padding: '20px', marginBottom: '20px', width: '100%' },
  upiTitle: { fontSize: '14px', color: '#888', marginBottom: '5px' },
  upiId: { fontSize: '22px', fontWeight: '800', color: '#ff6b00', marginBottom: '5px' },
  upiAmount: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '5px' },
  upiSaved: { fontSize: '14px', color: '#27ae60', fontWeight: '600', marginBottom: '10px' },
  upiNote: { fontSize: '13px', color: '#666', marginBottom: '15px', lineHeight: '1.5' },
  upiApps: { display: 'flex', justifyContent: 'center', gap: '15px' },
  upiApp: { background: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#333' },
  trackBtn: { width: '100%', padding: '14px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  homeBtn: { width: '100%', padding: '14px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer' },
  noMenu: { textAlign: 'center', color: '#aaa', padding: '40px', fontSize: '16px' },
};
