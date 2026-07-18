import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function DeliveryBoy() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [delivered, setDelivered] = useState(0);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const res = await API.get('/api/delivery-orders');
    setOrders(res.data);
    setDelivered(res.data.filter(o => o.status === 'delivered').length);
  };

  const updateStatus = async (id, status) => {
    await API.post('/api/orders/status', { id, status });
    loadOrders();
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>🛵 ZEPPO Delivery</div>
          <div style={s.headerSub}>Delivery Dashboard</div>
        </div>
        <button style={s.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
      </div>

      <div style={s.content}>
        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statNum}>{activeOrders.length}</div>
            <div style={s.statLabel}>Active Orders</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNum}>{delivered}</div>
            <div style={s.statLabel}>Delivered Today</div>
          </div>
        </div>

        {/* Orders */}
        {activeOrders.length === 0 ? (
          <div style={s.noOrders}>
            <div style={s.noOrdersIcon}>🛵</div>
            <h2 style={s.noOrdersTitle}>No active orders!</h2>
            <p style={s.noOrdersText}>Waiting for new orders... 🕐</p>
          </div>
        ) : (
          activeOrders.map(o => {
            let items = [];
            try { items = JSON.parse(o.items); } catch(e) {}
            return (
              <div key={o.id} style={s.orderCard}>
                <div style={{ ...s.statusBadge, ...getBadgeColor(o.status) }}>
                  {o.status.replace('_', ' ').toUpperCase()}
                </div>
                <div style={s.restName}>🍽️ {o.restaurant_name || 'Restaurant'}</div>
                <div style={s.infoRow}>👤 {o.customer_name}</div>
                <div style={s.infoRow}>📞 <a href={`tel:${o.customer_phone}`} style={s.phone}>{o.customer_phone}</a></div>
                <div style={s.infoRow}>📍 {o.customer_address}</div>
                <div style={s.itemsList}>
                  {items.map((item, i) => (
                    <div key={i} style={s.itemRow}>
                      <span>{item.name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <div style={s.total}>Total: ₹{o.total}</div>
                <div style={s.btnRow}>
                  {o.status === 'confirmed' && (
                    <button style={s.btnPreparing} onClick={() => updateStatus(o.id, 'preparing')}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <button style={s.btnPickup} onClick={() => updateStatus(o.id, 'on_the_way')}>
                      🛵 Picked Up — On the Way
                    </button>
                  )}
                  {o.status === 'on_the_way' && (
                    <button style={s.btnDeliver} onClick={() => updateStatus(o.id, 'delivered')}>
                      ✅ Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getBadgeColor(status) {
  const colors = {
    confirmed: { background: '#cfe2ff', color: '#084298' },
    preparing: { background: '#e2d9f3', color: '#6f42c1' },
    on_the_way: { background: '#ffd700', color: '#333' },
    delivered: { background: '#d1e7dd', color: '#0a3622' },
  };
  return colors[status] || { background: '#f0f0f0', color: '#333' };
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#ff6b00', color: 'white', padding: '15px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '20px', fontWeight: '700' },
  headerSub: { fontSize: '13px', opacity: '0.9', marginTop: '2px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  content: { padding: '15px 16px' },
  statsRow: { display: 'flex', gap: '15px', marginBottom: '20px' },
  statCard: { flex: 1, background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #ff6b00' },
  statNum: { fontSize: '32px', fontWeight: '700', color: '#ff6b00' },
  statLabel: { fontSize: '13px', color: '#888', marginTop: '5px' },
  noOrders: { textAlign: 'center', padding: '60px 20px' },
  noOrdersIcon: { fontSize: '60px', marginBottom: '15px' },
  noOrdersTitle: { fontSize: '20px', color: '#333', marginBottom: '8px' },
  noOrdersText: { color: '#888' },
  orderCard: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' },
  restName: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '10px' },
  infoRow: { fontSize: '14px', color: '#555', marginBottom: '6px' },
  phone: { color: '#ff6b00', textDecoration: 'none', fontWeight: '600' },
  itemsList: { background: '#f9f9f9', borderRadius: '8px', padding: '10px', margin: '12px 0' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', padding: '3px 0' },
  total: { fontSize: '18px', fontWeight: '700', color: '#ff6b00', marginBottom: '15px' },
  btnRow: { display: 'flex', gap: '10px' },
  btnPreparing: { flex: 1, background: '#6f42c1', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnPickup: { flex: 1, background: '#0d6efd', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnDeliver: { flex: 1, background: '#ff6b00', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};
