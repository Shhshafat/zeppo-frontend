import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function DeliveryBoy() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [delivered, setDelivered] = useState(0);
  const [me, setMe] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [locationError, setLocationError] = useState('');
  const token = localStorage.getItem('token');
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([loadOrders(), loadMe(), loadAdvances()]).finally(() => setLoading(false));
    const interval = setInterval(() => { loadOrders(); loadMe(); loadAdvances(); }, 30000);
    return () => {
      clearInterval(interval);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // Once we know we're online, keep sending a fresh location every 2 minutes so the
  // auto-assign system always has a recent fix to work with.
  useEffect(() => {
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    if (me?.is_online === 1) {
      locationIntervalRef.current = setInterval(() => sendLocationPing(), 120000);
    }
    return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
  }, [me?.is_online]);

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  const sendLocationPing = async () => {
    try {
      const { lat, lng } = await getCurrentPosition();
      await API.post('/api/delivery-boys/update-location', { lat, lng }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      // Silent — a missed background ping isn't worth alarming the delivery partner about
    }
  };

  const loadOrders = async () => {
    const res = await API.get('/api/delivery-orders', { headers: { Authorization: `Bearer ${token}` } });
    setOrders(res.data);
    setDelivered(res.data.filter(o => o.status === 'delivered').length);
  };

  const loadMe = async () => {
    const res = await API.get('/api/delivery-boys/me', { headers: { Authorization: `Bearer ${token}` } });
    setMe(res.data);
  };

  const loadAdvances = async () => {
    const res = await API.get('/api/delivery-boys/my-advances', { headers: { Authorization: `Bearer ${token}` } });
    setAdvances(res.data);
  };

  const toggleOnline = async () => {
    setToggling(true);
    setLocationError('');
    const goingOnline = !(me?.is_online === 1);
    let lat = null, lng = null;
    if (goingOnline) {
      try {
        const pos = await getCurrentPosition();
        lat = pos.lat;
        lng = pos.lng;
      } catch (e) {
        setLocationError('Location access chahiye online hone ke liye — apne browser mein location permission "Allow" karo.');
        setToggling(false);
        return;
      }
    }
    await API.post('/api/delivery-boys/toggle-online', { lat, lng }, { headers: { Authorization: `Bearer ${token}` } });
    await loadMe();
    setToggling(false);
  };

  const updateStatus = async (id, status) => {
    await API.post('/api/orders/status', { id, status });
    loadOrders();
    loadMe();
  };

  const respondToOffer = async (id, accept) => {
    await API.post('/api/delivery-boys/orders/respond', { order_id: id, accept }, { headers: { Authorization: `Bearer ${token}` } });
    loadOrders();
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const formatDate = (dt) => dt ? new Date(dt + 'Z').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.delivery_accepted === 1);
  const pendingOffers = orders.filter(o => o.status !== 'delivered' && o.delivery_accepted === null);
  const isOnline = me?.is_online === 1;
  const netBalance = me ? me.total_earned - (me.advance_taken || 0) - (me.paid_out || 0) : 0;

  const statusInfo = {
    confirmed: { label: 'New Order', color: '#3b82f6', bg: '#eff6ff' },
    preparing: { label: 'Preparing', color: '#8b5cf6', bg: '#f5f3ff' },
    on_the_way: { label: 'On The Way', color: '#f59e0b', bg: '#fffbeb' },
  };

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

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTop}>
            <div style={s.brandRow}>
              <div style={s.brandIcon}>🛵</div>
              <div>
                <div style={s.brandText}>ZEPPO</div>
                <div style={s.brandSub}>Delivery Partner</div>
              </div>
            </div>
            <button style={s.logoutBtn} onClick={logout}>Logout</button>
          </div>
          {me && <div style={s.welcomeText}>Hi, {me.name.split(' ')[0]} 👋</div>}
        </div>

        <div style={s.content}>

          {/* Online/Offline Status Card */}
          <div style={{ ...s.statusCard, background: isOnline ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #64748b, #94a3b8)' }}>
            <div style={s.statusLeft}>
              <div style={{ ...s.statusPulse, background: isOnline ? '#4ade80' : '#cbd5e1' }}>
                {isOnline && <div style={s.pulseRing} />}
              </div>
              <div>
                <div style={s.statusTitle}>{isOnline ? "You're Online" : "You're Offline"}</div>
                <div style={s.statusSub}>{isOnline ? 'Receiving orders now' : 'Tap to start receiving orders'}</div>
              </div>
            </div>
            <button style={s.statusToggle} onClick={toggleOnline} disabled={toggling}>
              {toggling ? '···' : isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          {locationError ? (
            <div style={s.locationErrorBox}>📍 {locationError}</div>
          ) : null}

          {/* Stats Row */}
          <div style={s.statsGrid}>
            <div style={s.statBox}>
              <div style={s.statIcon}>📦</div>
              <div style={s.statValue}>{activeOrders.length}</div>
              <div style={s.statLabel}>Active</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>✅</div>
              <div style={s.statValue}>{delivered}</div>
              <div style={s.statLabel}>Delivered</div>
            </div>
            <div style={s.statBox}>
              <div style={s.statIcon}>💰</div>
              <div style={s.statValue}>₹{netBalance}</div>
              <div style={s.statLabel}>Balance</div>
            </div>
          </div>

          {/* Earnings Card */}
          {me && (
            <div style={s.earningsCard}>
              <div style={s.earningsHeader}>💼 Earnings Summary</div>
              <div style={s.earningsRow}>
                <span style={s.earningsLabel}>Total Earned</span>
                <span style={{ ...s.earningsVal, color: '#059669' }}>₹{me.total_earned}</span>
              </div>
              <div style={s.earningsDivider} />
              <div style={s.earningsRow}>
                <span style={s.earningsLabel}>Advance Taken</span>
                <span style={{ ...s.earningsVal, color: '#d97706' }}>−₹{me.advance_taken || 0}</span>
              </div>
              <div style={s.earningsDivider} />
              <div style={s.earningsRow}>
                <span style={s.earningsLabel}>Already Paid Out</span>
                <span style={{ ...s.earningsVal, color: '#7c3aed' }}>−₹{me.paid_out || 0}</span>
              </div>
              <div style={s.earningsDivider} />
              <div style={s.earningsRow}>
                <span style={{ ...s.earningsLabel, fontWeight: '700', color: '#111827' }}>Net Balance</span>
                <span style={{ ...s.earningsVal, color: '#2563eb', fontSize: '19px' }}>₹{netBalance}</span>
              </div>

              {advances.length > 0 && (
                <>
                  <div style={s.historyToggle} onClick={() => setShowHistory(!showHistory)}>
                    <span>📜 Advance History ({advances.length})</span>
                    <span>{showHistory ? '▲' : '▼'}</span>
                  </div>
                  {showHistory && (
                    <div style={s.historyList}>
                      {advances.map(a => (
                        <div key={a.id} style={s.historyItem}>
                          <div>
                            <div style={s.historyNote}>{a.note || 'Advance payment'}</div>
                            <div style={s.historyDate}>{formatDate(a.created_at)}</div>
                          </div>
                          <div style={s.historyAmount}>−₹{a.amount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Order Offers — need Accept/Decline before they count as this delivery boy's job */}
          {pendingOffers.length > 0 && (
            <>
              <div style={s.sectionTitle}>🔔 New Order Requests ({pendingOffers.length})</div>
              {pendingOffers.map(o => {
                let items = [];
                try { items = JSON.parse(o.items); } catch (e) {}
                return (
                  <div key={o.id} style={s.offerCard}>
                    <div style={s.offerBadge}>NEW REQUEST</div>
                    <div style={s.restRow}>
                      <span style={s.restIcon}>🍽️</span>
                      <span style={s.restName}>{o.restaurant_name || 'Restaurant'}</span>
                    </div>
                    <div style={s.detailsBox}>
                      <div style={s.detailRow}><span style={s.detailIcon}>📍</span><span style={s.detailText}>{o.customer_address}</span></div>
                      {o.delivery_distance_km ? (
                        <div style={s.detailRow}><span style={s.detailIcon}>🧭</span><span style={s.detailText}>{parseFloat(o.delivery_distance_km).toFixed(1)} km away</span></div>
                      ) : null}
                      <div style={s.detailRow}><span style={s.detailIcon}>💰</span><span style={s.detailText}>Earn ₹{me?.salary_per_delivery || 50} for this delivery</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{ ...s.actionBtn, background: '#dc2626', flex: 1 }} onClick={() => respondToOffer(o.id, false)}>✕ Decline</button>
                      <button style={{ ...s.actionBtn, background: '#059669', flex: 1 }} onClick={() => respondToOffer(o.id, true)}>✓ Accept</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Orders Section */}
          <div style={s.sectionTitle}>
            {isOnline ? `Active Orders (${activeOrders.length})` : 'Orders'}
          </div>

          {!isOnline ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>😴</div>
              <div style={s.emptyTitle}>You're currently offline</div>
              <div style={s.emptyText}>Go online to start receiving delivery orders</div>
            </div>
          ) : activeOrders.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>🛵</div>
              <div style={s.emptyTitle}>No active orders</div>
              <div style={s.emptyText}>New orders will appear here automatically</div>
            </div>
          ) : (
            activeOrders.map(o => {
              let items = [];
              try { items = JSON.parse(o.items); } catch(e) {}
              const info = statusInfo[o.status] || { label: o.status, color: '#666', bg: '#f5f5f5' };
              return (
                <div key={o.id} style={s.orderCard}>
                  <div style={s.orderCardHeader}>
                    <span style={{ ...s.statusBadge, color: info.color, background: info.bg }}>
                      ● {info.label}
                    </span>
                    <span style={s.orderTotal}>₹{o.total}</span>
                  </div>

                  <div style={s.restRow}>
                    <span style={s.restIcon}>🍽️</span>
                    <span style={s.restName}>{o.restaurant_name || 'Restaurant'}</span>
                  </div>

                  <div style={s.detailsBox}>
                    <div style={s.detailRow}>
                      <span style={s.detailIcon}>👤</span>
                      <span style={s.detailText}>{o.customer_name}</span>
                    </div>
                    <div style={s.detailRow}>
                      <span style={s.detailIcon}>📞</span>
                      <a href={`tel:${o.customer_phone}`} style={s.phoneLink}>{o.customer_phone}</a>
                    </div>
                    <div style={s.detailRow}>
                      <span style={s.detailIcon}>📍</span>
                      <span style={s.detailText}>{o.customer_address}</span>
                    </div>
                    {o.delivery_distance_km ? (
                      <div style={s.detailRow}>
                        <span style={s.detailIcon}>🧭</span>
                        <span style={s.detailText}>{parseFloat(o.delivery_distance_km).toFixed(1)} km away</span>
                      </div>
                    ) : null}
                  </div>

                  <div style={s.itemsBox}>
                    {items.map((item, i) => (
                      <div key={i} style={s.itemRow}>
                        <span style={s.itemName}>{item.name}</span>
                        <span style={s.itemPrice}>₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {o.status === 'confirmed' && (
                    <button style={{ ...s.actionBtn, background: '#8b5cf6' }} onClick={() => updateStatus(o.id, 'preparing')}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <button style={{ ...s.actionBtn, background: '#3b82f6' }} onClick={() => updateStatus(o.id, 'on_the_way')}>
                      🛵 Picked Up — On the Way
                    </button>
                  )}
                  {o.status === 'on_the_way' && (
                    <button style={{ ...s.actionBtn, background: '#ff6b00' }} onClick={() => updateStatus(o.id, 'delivered')}>
                      ✅ Mark as Delivered
                    </button>
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

  content: { padding: '18px 16px 40px' },

  statusCard: { borderRadius: '18px', padding: '18px', marginTop: '-30px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  statusLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusPulse: { width: '12px', height: '12px', borderRadius: '50%', position: 'relative', flexShrink: 0 },
  pulseRing: { position: 'absolute', top: '-4px', left: '-4px', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' },
  statusTitle: { fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '2px' },
  statusSub: { fontSize: '12px', color: 'rgba(255,255,255,0.8)' },
  statusToggle: { background: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#111827' },

  locationErrorBox: { background: '#fff3e0', color: '#e65100', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', marginBottom: '16px', border: '1px solid #ffe0b2' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' },
  statBox: { background: 'white', borderRadius: '14px', padding: '16px 8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  statIcon: { fontSize: '18px', marginBottom: '6px' },
  statValue: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' },

  earningsCard: { background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  earningsHeader: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '12px' },
  earningsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' },
  earningsLabel: { fontSize: '13.5px', color: '#6b7280' },
  earningsVal: { fontSize: '15px', fontWeight: '700' },
  earningsDivider: { height: '1px', background: '#f3f4f6', margin: '4px 0' },

  historyToggle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', padding: '10px 12px', background: '#fff8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#e67e22', cursor: 'pointer' },
  historyList: { marginTop: '10px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  historyNote: { fontSize: '13px', color: '#374151', fontWeight: '500' },
  historyDate: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' },
  historyAmount: { fontSize: '14px', fontWeight: '700', color: '#d97706' },

  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' },

  emptyState: { textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '16px', border: '1px solid #f0f0f2' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyTitle: { fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '5px' },
  emptyText: { fontSize: '13px', color: '#9ca3af' },

  offerCard: { background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '14px', border: '2px solid #ff6b00', boxShadow: '0 4px 16px rgba(255,107,0,0.15)', position: 'relative' },
  offerBadge: { position: 'absolute', top: '-10px', left: '16px', background: '#ff6b00', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' },
  orderCard: { background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  orderCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  statusBadge: { fontSize: '11.5px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px' },
  orderTotal: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  restRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  restIcon: { fontSize: '16px' },
  restName: { fontSize: '15px', fontWeight: '700', color: '#111827' },
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
};
