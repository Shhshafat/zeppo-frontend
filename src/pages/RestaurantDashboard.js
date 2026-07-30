import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([loadOrders(), loadMe()]).finally(() => setLoading(false));
    const interval = setInterval(() => { loadOrders(); }, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const res = await API.get('/api/restaurant/orders', { headers: { Authorization: `Bearer ${token}` } });
    setOrders(res.data);
  };

  const loadMe = async () => {
    const res = await API.get('/api/restaurant/me', { headers: { Authorization: `Bearer ${token}` } });
    setMe(res.data);
  };

  const updateStatus = async (id, status) => {
    await API.post('/api/restaurant/orders/status', { id, status }, { headers: { Authorization: `Bearer ${token}` } });
    loadOrders();
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const formatDate = (dt) => dt ? new Date(dt + 'Z').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

  const statusInfo = {
    pending: { label: 'New Order', color: '#dc2626', bg: '#fee2e2' },
    confirmed: { label: 'Confirmed', color: '#3b82f6', bg: '#eff6ff' },
    preparing: { label: 'Preparing', color: '#8b5cf6', bg: '#f5f3ff' },
    on_the_way: { label: 'Out for Delivery', color: '#f59e0b', bg: '#fffbeb' },
    delivered: { label: 'Delivered', color: '#059669', bg: '#ecfdf5' },
    cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6' },
  };

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const pastOrders = orders.filter(o => ['on_the_way', 'delivered', 'cancelled'].includes(o.status));
  const displayedOrders = filter === 'active' ? activeOrders : pastOrders;

  const todayRevenue = orders
    .filter(o => o.status === 'delivered' && new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + parseInt(o.total || 0), 0);
  const todayCount = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;

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
          <div style={s.headerTop}>
            <div style={s.brandRow}>
              <div style={s.brandIcon}>🍽️</div>
              <div>
                <div style={s.brandText}>ZEPPO</div>
                <div style={s.brandSub}>Restaurant Partner</div>
              </div>
            </div>
            <button style={s.logoutBtn} onClick={logout}>Logout</button>
          </div>
          {me && <div style={s.welcomeText}>{me.name}</div>}
          {me && <div style={s.welcomeSub}>{me.is_open ? '🟢 Currently Open' : '🔴 Currently Closed'}</div>}
        </div>

        <div style={s.content}>

          {/* Stats Row */}
          <div style={s.statsGrid}>
            <div style={s.statBox}>
              <div style={s.statIcon}>📦</div>
              <div style={s.statValue}>{activeOrders.length}</div>
              <div style={s.statLabel}>Active Orders</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>📅</div>
              <div style={s.statValue}>{todayCount}</div>
              <div style={s.statLabel}>Today's Orders</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>💰</div>
              <div style={s.statValue}>₹{todayRevenue}</div>
              <div style={s.statLabel}>Today's Revenue</div>
            </div>
          </div>

          {activeOrders.some(o => o.status === 'pending') && (
            <div style={s.alertBanner}>
              🔔 You have {activeOrders.filter(o => o.status === 'pending').length} new order(s) waiting to be confirmed!
            </div>
          )}

          <div style={s.tabRow}>
            <button style={{ ...s.tabBtn, ...(filter === 'active' ? s.tabBtnActive : {}) }} onClick={() => setFilter('active')}>
              Active ({activeOrders.length})
            </button>
            <button style={{ ...s.tabBtn, ...(filter === 'past' ? s.tabBtnActive : {}) }} onClick={() => setFilter('past')}>
              Past ({pastOrders.length})
            </button>
          </div>

          {displayedOrders.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>{filter === 'active' ? '🍽️' : '📋'}</div>
              <div style={s.emptyTitle}>{filter === 'active' ? 'No active orders' : 'No past orders yet'}</div>
              <div style={s.emptyText}>{filter === 'active' ? 'New orders will appear here automatically' : 'Completed orders will show up here'}</div>
            </div>
          ) : (
            displayedOrders.map(o => {
              let items = [];
              try { items = JSON.parse(o.items); } catch (e) {}
              const info = statusInfo[o.status] || { label: o.status, color: '#666', bg: '#f5f5f5' };
              return (
                <div key={o.id} style={s.orderCard}>
                  <div style={s.orderCardHeader}>
                    <span style={{ ...s.statusBadge, color: info.color, background: info.bg }}>● {info.label}</span>
                    <span style={s.orderTotal}>₹{o.total}</span>
                  </div>
                  <div style={s.orderMeta}>#{o.id} · {formatDate(o.created_at)}</div>

                  <div style={s.detailsBox}>
                    <div style={s.detailRow}><span style={s.detailIcon}>👤</span><span style={s.detailText}>{o.customer_name}</span></div>
                    <div style={s.detailRow}><span style={s.detailIcon}>📞</span><a href={`tel:${o.customer_phone}`} style={s.phoneLink}>{o.customer_phone}</a></div>
                    <div style={s.detailRow}><span style={s.detailIcon}>📍</span><span style={s.detailText}>{o.customer_address}</span></div>
                    <div style={s.detailRow}><span style={s.detailIcon}>💳</span><span style={s.detailText}>{o.payment_method === 'upi' ? 'UPI' : 'Cash on Delivery'}</span></div>
                  </div>

                  <div style={s.itemsBox}>
                    {items.map((item, i) => (
                      <div key={i} style={s.itemRow}>
                        <span style={s.itemName}>{item.qty > 1 ? `${item.qty} × ` : ''}{item.name}</span>
                        <span style={s.itemPrice}>₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {o.status === 'pending' && (
                    <button style={{ ...s.actionBtn, background: '#3b82f6' }} onClick={() => updateStatus(o.id, 'confirmed')}>
                      ✅ Confirm Order
                    </button>
                  )}
                  {o.status === 'confirmed' && (
                    <button style={{ ...s.actionBtn, background: '#8b5cf6' }} onClick={() => updateStatus(o.id, 'preparing')}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <div style={s.waitingNote}>🛵 Waiting for a delivery partner to pick up — this happens automatically.</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fb' },
  container: { maxWidth: '480px', margin: '0 auto' },

  header: { background: 'linear-gradient(135deg, #1a0a12, #2a1520)', padding: '45px 20px 24px', borderRadius: '0 0 24px 24px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { width: '38px', height: '38px', background: '#ff6b00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  brandText: { fontSize: '17px', fontWeight: '800', color: 'white', letterSpacing: '1px' },
  brandSub: { fontSize: '11px', color: 'rgba(255,255,255,0.5)' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  welcomeText: { fontSize: '22px', fontWeight: '700', color: 'white' },
  welcomeSub: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' },

  content: { padding: '18px 16px 40px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '-14px', marginBottom: '16px' },
  statBox: { background: 'white', borderRadius: '14px', padding: '16px 8px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', border: '1px solid #f0f0f2' },
  statIcon: { fontSize: '18px', marginBottom: '6px' },
  statValue: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: '10.5px', color: '#9ca3af', marginTop: '2px' },

  alertBanner: { background: '#fee2e2', color: '#991b1b', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },

  tabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tabBtn: { flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' },
  tabBtnActive: { background: '#ff6b00', borderColor: '#ff6b00', color: 'white' },

  emptyState: { textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '16px', border: '1px solid #f0f0f2' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyTitle: { fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '5px' },
  emptyText: { fontSize: '13px', color: '#9ca3af' },

  orderCard: { background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  orderCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  statusBadge: { fontSize: '11.5px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px' },
  orderTotal: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  orderMeta: { fontSize: '11.5px', color: '#9ca3af', marginBottom: '12px' },
  detailsBox: { background: '#fafafa', borderRadius: '12px', padding: '12px', marginBottom: '10px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' },
  detailIcon: { fontSize: '13px', width: '18px', flexShrink: 0 },
  detailText: { fontSize: '13.5px', color: '#374151' },
  phoneLink: { fontSize: '13.5px', color: '#ff6b00', fontWeight: '700', textDecoration: 'none' },
  itemsBox: { marginBottom: '14px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', padding: '3px 0' },
  itemName: {},
  itemPrice: { fontWeight: '600', color: '#374151' },
  actionBtn: { width: '100%', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  waitingNote: { textAlign: 'center', fontSize: '12.5px', color: '#8b5cf6', background: '#f5f3ff', padding: '10px', borderRadius: '10px', fontWeight: '600' },
};
