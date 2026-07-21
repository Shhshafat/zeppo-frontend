import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import API from '../api';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, changeQty, removeItem, clearCart, cartTotal } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(localStorage.getItem('locationSub') || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [ordered, setOrdered] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartTotal;
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
    } catch(e) { setCouponMsg('❌ Error applying coupon!'); }
  };

  const removeCoupon = () => { setCouponCode(''); setCouponDiscount(0); setCouponApplied(false); setCouponMsg(''); };

  const placeOrder = async () => {
    if (!name || !phone || !address) { alert('Please fill all fields!'); return; }
    if (cart.items.length === 0) { alert('Your cart is empty!'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await API.post('/api/order', {
        customer_name: name, customer_phone: phone,
        customer_address: address, restaurant_id: cart.restaurantId,
        restaurant_name: cart.restaurantName,
        items: cart.items.map(c => ({ name: c.label, price: c.price, qty: c.qty })),
        total, payment_method: paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setOrdered(true);
        clearCart();
      }
    } catch(e) { alert('Error placing order!'); }
  };

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
            <div style={s.upiNote}>Send payment to above UPI ID to confirm order!</div>
          </div>
        )}
        {paymentMethod === 'cash' && <p style={s.successText}>Pay ₹{total} cash on delivery 💵</p>}
        <p style={s.successText}>ZEPPO will deliver soon! 🛵</p>
        <button style={s.trackBtn} onClick={() => navigate('/track')}>Track Order →</button>
        <button style={s.homeBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  if (cart.items.length === 0) return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.headerTitle}>Your Cart</div>
      </div>
      <div style={s.emptyBox}>
        <div style={{ fontSize: '70px', marginBottom: '15px' }}>🛒</div>
        <h2 style={s.emptyTitle}>Your cart is empty</h2>
        <p style={s.emptyText}>Add items from your favorite restaurant</p>
        <button style={s.browseBtn} onClick={() => navigate('/')}>Browse Restaurants →</button>
      </div>
      <BottomNav navigate={navigate} />
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.headerTitle}>Your Cart</div>
      </div>

      <div style={s.restBanner}>
        <span style={{ fontSize: '20px' }}>{cart.restaurantEmoji || '🍽️'}</span>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#222' }}>{cart.restaurantName}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Delivery in 30-40 min</div>
        </div>
      </div>

      <div style={{ padding: '15px 16px 100px' }}>
        {cart.items.map(c => (
          <div key={c.key} style={s.cartLineItem}>
            <div style={s.vegSquare(c.is_veg !== 0)} />
            <div style={{ flex: 1 }}>
              <div style={s.cartItemName}>{c.label}</div>
              <div style={s.cartItemPrice}>₹{c.price}</div>
            </div>
            <div style={s.qtyStepper}>
              <button style={s.qtyBtn} onClick={() => changeQty(c.key, -1)}>−</button>
              <span style={s.qtyNum}>{c.qty}</span>
              <button style={s.qtyBtn} onClick={() => changeQty(c.key, 1)}>+</button>
            </div>
            <button style={s.removeX} onClick={() => removeItem(c.key)}>✕</button>
          </div>
        ))}

        <div style={s.couponBox}>
          <div style={s.couponTitle}>🎟️ Have a coupon?</div>
          {!couponApplied ? (
            <div style={s.couponRow}>
              <input style={s.couponInput} placeholder="Enter coupon code (e.g. ZEPPO50)" value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); }} />
              <button style={s.couponBtn} onClick={applyCoupon}>Apply</button>
            </div>
          ) : (
            <div style={s.couponApplied}>
              <span style={{ color: '#27ae60', fontWeight: '700' }}>✅ {couponCode} applied!</span>
              <button style={s.couponRemoveBtn} onClick={removeCoupon}>Remove</button>
            </div>
          )}
          {couponMsg && <div style={{ fontSize: '13px', color: couponApplied ? '#27ae60' : '#e74c3c', marginTop: '6px' }}>{couponMsg}</div>}
          <div style={s.couponHint}>Try: ZEPPO50</div>
        </div>

        <div style={s.billBox}>
          <div style={s.billTitle}>Bill Details</div>
          <div style={s.billRow}><span>Item Total</span><span>₹{subtotal}</span></div>
          <div style={s.billRow}><span>Delivery Fee</span><span style={{ color: '#27ae60' }}>FREE</span></div>
          {couponDiscount > 0 && (
            <div style={s.billRow}><span style={{ color: '#27ae60' }}>Coupon Discount</span><span style={{ color: '#27ae60' }}>-₹{couponDiscount}</span></div>
          )}
          <div style={s.totalRow}><span>To Pay</span><span style={{ color: '#ff6b00' }}>₹{total}</span></div>
        </div>

        <div style={s.deliveryForm}>
          <h3 style={s.formTitle}>📦 Delivery Details</h3>
          <input style={s.input} placeholder="Your Full Name *" value={name} onChange={e => setName(e.target.value)} />
          <input style={s.input} placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} />
          <input style={s.input} placeholder="Delivery Address *" value={address} onChange={e => setAddress(e.target.value)} />

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

          <button style={s.orderBtn} onClick={placeOrder}>
            {paymentMethod === 'upi' ? `💳 Pay ₹${total} via UPI` : `✅ Place Order — ₹${total}`}
          </button>
        </div>
      </div>

      <BottomNav navigate={navigate} />
    </div>
  );
}

function BottomNav({ navigate }) {
  return (
    <div style={s.bottomNav}>
      <div style={s.navItem} onClick={() => navigate('/')}><span style={s.navIcon}>🏠</span><span>Home</span></div>
      <div style={s.navItem} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
      <div style={s.navItem} onClick={() => navigate('/track')}><span style={s.navIcon}>📦</span><span>Orders</span></div>
      <div style={s.navItem} onClick={() => navigate('/profile')}><span style={s.navIcon}>👤</span><span>Profile</span></div>
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#fff', paddingBottom: '70px' },
  header: { background: 'white', padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer' },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#222' },
  restBanner: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#fafafa', borderBottom: '8px solid #f5f5f5' },
  vegSquare: (veg) => ({ width: '14px', height: '14px', border: `1.5px solid ${veg ? '#0f8a1e' : '#b1000f'}`, borderRadius: '3px', flexShrink: 0 }),
  cartLineItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  cartItemName: { fontSize: '14px', fontWeight: '600', color: '#222' },
  cartItemPrice: { fontSize: '13px', color: '#888', marginTop: '2px' },
  qtyStepper: { display: 'flex', alignItems: 'center', gap: '10px', background: '#27ae60', borderRadius: '8px', padding: '6px 10px' },
  qtyBtn: { background: 'none', border: 'none', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '18px' },
  qtyNum: { color: 'white', fontSize: '14px', fontWeight: '700', minWidth: '14px', textAlign: 'center' },
  removeX: { background: '#fce4ec', border: 'none', color: '#e74c3c', width: '28px', height: '28px', borderRadius: '50%', fontSize: '13px', cursor: 'pointer', flexShrink: 0 },

  couponBox: { background: '#f9f9f9', borderRadius: '12px', padding: '15px', margin: '15px 0' },
  couponTitle: { fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '10px' },
  couponRow: { display: 'flex', gap: '8px' },
  couponInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', textTransform: 'uppercase' },
  couponBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  couponApplied: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fff4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #27ae60' },
  couponRemoveBtn: { background: 'none', border: 'none', color: '#e74c3c', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  couponHint: { fontSize: '12px', color: '#aaa', marginTop: '6px' },

  billBox: { background: '#f9f9f9', borderRadius: '12px', padding: '15px', marginBottom: '15px' },
  billTitle: { fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '10px' },
  billRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px', color: '#555' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '16px', fontWeight: '700', color: '#333', borderTop: '1px solid #eee', marginTop: '5px' },

  deliveryForm: { marginTop: '10px' },
  formTitle: { fontSize: '15px', color: '#333', marginBottom: '12px', fontWeight: '700' },
  input: { width: '100%', padding: '12px 15px', border: '1.5px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' },
  paymentOptions: { display: 'flex', gap: '12px', marginBottom: '15px' },
  paymentCard: { flex: 1, padding: '15px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', position: 'relative' },
  paymentIcon: { fontSize: '24px', marginBottom: '6px' },
  paymentLabel: { fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '3px' },
  paymentSub: { fontSize: '11px', color: '#888' },
  paymentCheck: { position: 'absolute', top: '8px', right: '8px', background: '#ff6b00', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
  orderBtn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },

  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: '#222', marginBottom: '8px' },
  emptyText: { color: '#888', marginBottom: '20px' },
  browseBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },

  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '30px 20px', textAlign: 'center' },
  successTitle: { fontSize: '26px', fontWeight: '800', color: '#27ae60', marginBottom: '15px' },
  successText: { fontSize: '15px', color: '#666', marginBottom: '10px' },
  upiBox: { background: '#fff3e0', border: '2px solid #ff6b00', borderRadius: '16px', padding: '20px', marginBottom: '20px', width: '100%' },
  upiTitle: { fontSize: '14px', color: '#888', marginBottom: '5px' },
  upiId: { fontSize: '22px', fontWeight: '800', color: '#ff6b00', marginBottom: '5px' },
  upiAmount: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '5px' },
  upiNote: { fontSize: '13px', color: '#666', marginBottom: '15px', lineHeight: '1.5' },
  trackBtn: { width: '100%', padding: '14px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
  homeBtn: { width: '100%', padding: '14px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer' },

  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: '#888', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
};
