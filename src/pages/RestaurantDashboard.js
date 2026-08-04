import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showNotifs, setShowNotifs] = useState(false);
  const token = localStorage.getItem('token');
  const prevPendingCount = useRef(null);
  const audioRef = useRef(null);

  const [docForm, setDocForm] = useState({ owner_name: '', fssai_license: '', gst_number: '' });
  const [savingDocs, setSavingDocs] = useState(false);
  const docFileRef = useRef();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([loadOrders(), loadMe(), loadEarnings()]).finally(() => setLoading(false));
    const interval = setInterval(() => { loadOrders(); }, 20000);
    audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (me) setDocForm({ owner_name: me.owner_name || '', fssai_license: me.fssai_license || '', gst_number: me.gst_number || '' });
  }, [me]);

  const playAlertSound = () => {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const loadOrders = async () => {
    const res = await API.get('/api/restaurant/orders', { headers: { Authorization: `Bearer ${token}` } });
    const newPendingCount = res.data.filter(o => o.status === 'pending' && o.delivery_accepted === 1).length;
    if (prevPendingCount.current !== null && newPendingCount > prevPendingCount.current) {
      playAlertSound();
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('New Order! 🛵', { body: 'A new order is ready to confirm.' });
      }
    }
    prevPendingCount.current = newPendingCount;
    setOrders(res.data);
  };
  const loadMe = async () => {
    const res = await API.get('/api/restaurant/me', { headers: { Authorization: `Bearer ${token}` } });
    setMe(res.data);
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };
  const loadEarnings = async () => {
    const res = await API.get('/api/restaurant/earnings', { headers: { Authorization: `Bearer ${token}` } });
    setEarnings(res.data);
  };

  const updateStatus = async (id, status) => {
    const res = await API.post('/api/restaurant/orders/status', { id, status }, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data.success === false) { alert(res.data.message || 'Could not update order'); }
    loadOrders();
  };

  const saveDocuments = async () => {
    setSavingDocs(true);
    let fssai_document = me?.fssai_document || '';
    if (docFileRef.current?.files[0]) {
      const fd = new FormData();
      fd.append('image', docFileRef.current.files[0]);
      const upRes = await API.post('/api/upload/document', fd, { headers: { Authorization: `Bearer ${token}` } });
      if (upRes.data.success) fssai_document = upRes.data.url;
    }
    await API.post('/api/restaurant/documents', { ...docForm, fssai_document }, { headers: { Authorization: `Bearer ${token}` } });
    setSavingDocs(false);
    alert('✅ Details saved! Your documents are now pending review by ZEPPO.');
    loadMe();
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

  const verificationInfo = {
    pending: { label: '⏳ Verification Pending', color: '#d97706', bg: '#fffbeb' },
    verified: { label: '✅ Verified Partner', color: '#059669', bg: '#ecfdf5' },
    rejected: { label: '⚠️ Documents Rejected — please resubmit', color: '#dc2626', bg: '#fee2e2' },
  };

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const pastOrders = orders.filter(o => ['on_the_way', 'delivered', 'cancelled'].includes(o.status));
  const displayedOrders = filter === 'active' ? activeOrders : pastOrders;
  const vInfo = verificationInfo[me?.verification_status] || verificationInfo.pending;
  const notifOrders = orders.filter(o => o.status === 'pending' && o.delivery_accepted === 1).slice(0, 8);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f6f9', flexDirection: 'column', gap: '18px' }}>
      <style>{`@keyframes zeppoSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#ff6b00', fontWeight: '800', fontSize: '20px', letterSpacing: '3px' }}>ZEPPO</div>
      <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,107,0,0.15)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'zeppoSpin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.brandIcon}>🍽️</div>
          <div>
            <div style={s.brandText}>ZEPPO Partner</div>
            <div style={s.restNameSmall}>{me?.name}</div>
          </div>
          <div style={{ ...s.verifyBadge, color: vInfo.color, background: vInfo.bg }}>{vInfo.label}</div>
        </div>
        <div style={s.navRight}>
          <div style={s.notifWrap}>
            <div style={s.notifBell} onClick={() => setShowNotifs(!showNotifs)}>
              🔔
              {notifOrders.length > 0 && <span style={s.notifBadge}>{notifOrders.length}</span>}
            </div>
            {showNotifs && (
              <div style={s.notifDropdown}>
                <div style={s.notifDropdownTitle}>New Orders</div>
                {notifOrders.length === 0 ? (
                  <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>No new orders right now</div>
                ) : (
                  notifOrders.map(o => (
                    <div key={o.id} style={s.notifItem} onClick={() => { setTab('orders'); setFilter('active'); setShowNotifs(false); }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>Order #{o.id} — ₹{o.total}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{o.customer_name} · {formatDate(o.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.tabBar}>
        {[
          { key: 'orders', label: '📦 Orders' },
          { key: 'earnings', label: '💰 Earnings' },
          { key: 'profile', label: '🏪 Profile' },
        ].map(t => (
          <button key={t.key} style={{ ...s.tabBarBtn, ...(tab === t.key ? s.tabBarBtnActive : {}) }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.content}>

        {tab === 'orders' && (
          <>
            <div style={s.statsGrid}>
              <div style={s.statBox}><div style={s.statIcon}>📦</div><div style={s.statValue}>{activeOrders.length}</div><div style={s.statLabel}>Active</div></div>
              <div style={s.statBox}><div style={s.statIcon}>📅</div><div style={s.statValue}>{earnings?.todayOrders ?? 0}</div><div style={s.statLabel}>Today</div></div>
              <div style={s.statBox}><div style={s.statIcon}>💰</div><div style={s.statValue}>₹{earnings?.todayRevenue ?? 0}</div><div style={s.statLabel}>Today's Sales</div></div>
              <div style={s.statBox}><div style={s.statIcon}>⭐</div><div style={s.statValue}>{me?.rating ?? '-'}</div><div style={s.statLabel}>Rating</div></div>
            </div>

            {notifOrders.length > 0 && (
              <div style={s.alertBanner}>
                🔔 You have {notifOrders.length} new order(s) waiting to be confirmed!
              </div>
            )}

            <div style={s.filterTabRow}>
              <button style={{ ...s.filterTabBtn, ...(filter === 'active' ? s.filterTabBtnActive : {}) }} onClick={() => setFilter('active')}>
                Active ({activeOrders.length})
              </button>
              <button style={{ ...s.filterTabBtn, ...(filter === 'past' ? s.filterTabBtnActive : {}) }} onClick={() => setFilter('past')}>
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
              <div style={s.orderGrid}>
                {displayedOrders.map(o => {
                  let items = [];
                  try { items = JSON.parse(o.items); } catch (e) {}
                  const info = o.status === 'pending' && o.delivery_accepted !== 1
                    ? { label: 'Finding Rider...', color: '#d97706', bg: '#fffbeb' }
                    : (statusInfo[o.status] || { label: o.status, color: '#666', bg: '#f5f5f5' });
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

                      {o.status === 'pending' && o.delivery_accepted === 1 && (
                        <button style={{ ...s.actionBtn, background: '#3b82f6' }} onClick={() => updateStatus(o.id, 'confirmed')}>✅ Confirm Order</button>
                      )}
                      {o.status === 'pending' && o.delivery_accepted !== 1 && (
                        <div style={s.waitingRiderNote}>🛵 Waiting for a delivery partner to accept — you'll be able to confirm once someone does.</div>
                      )}
                      {o.status === 'confirmed' && (
                        <button style={{ ...s.actionBtn, background: '#8b5cf6' }} onClick={() => updateStatus(o.id, 'preparing')}>👨‍🍳 Start Preparing</button>
                      )}
                      {o.status === 'preparing' && (
                        <div style={s.waitingRiderNote}>🛵 Waiting for a delivery partner to pick up — this happens automatically.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'earnings' && earnings && (
          <div style={s.earningsLayout}>
            <div style={s.earningsHero}>
              <div style={s.earningsHeroLabel}>Total Lifetime Earnings</div>
              <div style={s.earningsHeroValue}>₹{earnings.netEarnings}</div>
              <div style={s.earningsHeroSub}>after {earnings.commissionPercent}% ZEPPO commission</div>
            </div>

            <div style={s.statsGrid}>
              <div style={s.statBox}><div style={s.statIcon}>📦</div><div style={s.statValue}>{earnings.totalOrders}</div><div style={s.statLabel}>Total Orders</div></div>
              <div style={s.statBox}><div style={s.statIcon}>✅</div><div style={s.statValue}>{earnings.deliveredCount}</div><div style={s.statLabel}>Delivered</div></div>
              <div style={s.statBox}><div style={s.statIcon}>❌</div><div style={s.statValue}>{earnings.cancelledCount}</div><div style={s.statLabel}>Cancelled</div></div>
            </div>

            <div style={s.twoColRow}>
              <div style={s.earningsCard}>
                <div style={s.earningsCardTitle}>📊 Revenue Breakdown</div>
                <div style={s.earningsRow}><span style={s.earningsLabel}>Today</span><span style={s.earningsVal}>₹{earnings.todayRevenue}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}><span style={s.earningsLabel}>Last 7 Days</span><span style={s.earningsVal}>₹{earnings.weekRevenue}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}><span style={s.earningsLabel}>All Time (delivered)</span><span style={s.earningsVal}>₹{earnings.totalRevenue}</span></div>
              </div>

              <div style={s.earningsCard}>
                <div style={s.earningsCardTitle}>💳 Commission &amp; Payout</div>
                <div style={s.earningsRow}><span style={s.earningsLabel}>Commission Rate</span><span style={s.earningsVal}>{earnings.commissionPercent}%</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}><span style={s.earningsLabel}>Total Commission Owed</span><span style={{ ...s.earningsVal, color: '#d97706' }}>₹{earnings.totalCommission}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}><span style={s.earningsLabel}>Already Settled</span><span style={{ ...s.earningsVal, color: '#059669' }}>₹{earnings.settled}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}>
                  <span style={{ ...s.earningsLabel, fontWeight: '700', color: '#111827' }}>Pending Commission</span>
                  <span style={{ ...s.earningsVal, color: '#dc2626', fontSize: '17px' }}>₹{earnings.pendingCommissionOwed}</span>
                </div>
              </div>
            </div>
            <div style={s.commissionNote}>💡 ZEPPO settles commission payments periodically — contact support if this looks off.</div>
          </div>
        )}

        {tab === 'profile' && me && (
          <div style={s.twoColRow}>
            <div style={s.profileCard}>
              <div style={s.profileCardTitle}>🏪 Business Details</div>
              <div style={s.profileRow}><span style={s.profileLabel}>Restaurant Name</span><span style={s.profileVal}>{me.name}</span></div>
              <div style={s.profileRow}><span style={s.profileLabel}>Category</span><span style={s.profileVal}>{me.category}</span></div>
              <div style={s.profileRow}><span style={s.profileLabel}>Address</span><span style={s.profileVal}>{me.address}</span></div>
              <div style={s.profileRow}><span style={s.profileLabel}>Phone</span><span style={s.profileVal}>{me.phone || '-'}</span></div>
              <div style={s.profileRow}><span style={s.profileLabel}>Commission Rate</span><span style={s.profileVal}>{me.commission_percent || 15}%</span></div>
              <div style={s.profileNote}>To change business details, please contact ZEPPO support.</div>
            </div>

            <div style={s.profileCard}>
              <div style={s.profileCardTitle}>📄 Verification Documents</div>
              <div style={{ ...s.verifyBadge, color: vInfo.color, background: vInfo.bg, marginBottom: '16px' }}>{vInfo.label}</div>

              <label style={s.formLabel}>Owner's Full Name</label>
              <input style={s.formInput} placeholder="As per ID proof" value={docForm.owner_name} onChange={e => setDocForm({ ...docForm, owner_name: e.target.value })} />

              <label style={s.formLabel}>FSSAI License Number</label>
              <input style={s.formInput} placeholder="14-digit FSSAI number" value={docForm.fssai_license} onChange={e => setDocForm({ ...docForm, fssai_license: e.target.value })} />

              <label style={s.formLabel}>GST Number (optional)</label>
              <input style={s.formInput} placeholder="If registered" value={docForm.gst_number} onChange={e => setDocForm({ ...docForm, gst_number: e.target.value })} />

              <label style={s.formLabel}>Upload FSSAI Certificate / License Photo</label>
              {me.fssai_document && (
                <img src={me.fssai_document} alt="FSSAI Document" style={s.docPreview} />
              )}
              <input type="file" ref={docFileRef} accept="image/*" style={{ marginBottom: '16px', fontSize: '13px' }} />

              <button style={s.saveBtn} onClick={saveDocuments} disabled={savingDocs}>
                {savingDocs ? 'Saving...' : '💾 Save & Submit for Review'}
              </button>
              <div style={s.profileNote}>Your restaurant needs a valid FSSAI license to legally sell food in India. ZEPPO reviews submissions within 24-48 hours.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f4f6f9' },

  navbar: { background: '#1a0a12', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },
  brandIcon: { width: '40px', height: '40px', background: '#ff6b00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px' },
  brandText: { fontSize: '15px', fontWeight: '800', color: 'white' },
  restNameSmall: { fontSize: '12.5px', color: 'rgba(255,255,255,0.65)' },
  verifyBadge: { fontSize: '11.5px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },

  notifWrap: { position: 'relative' },
  notifBell: { fontSize: '20px', cursor: 'pointer', position: 'relative', width: '38px', height: '38px', borderRadius: '19px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: '-4px', right: '-4px', background: '#dc2626', color: 'white', borderRadius: '9px', minWidth: '18px', height: '18px', fontSize: '10.5px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1a0a12' },
  notifDropdown: { position: 'absolute', top: '48px', right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', width: '300px', maxHeight: '360px', overflowY: 'auto', zIndex: 200 },
  notifDropdownTitle: { padding: '14px 16px', fontWeight: '700', fontSize: '13.5px', color: '#111827', borderBottom: '1px solid #f0f0f0' },
  notifItem: { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' },

  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },

  tabBar: { display: 'flex', gap: '8px', background: 'white', padding: '12px 30px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  tabBarBtn: { background: 'transparent', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' },
  tabBarBtnActive: { background: '#ff6b00', color: 'white' },

  content: { padding: '28px 30px', maxWidth: '1200px', margin: '0 auto' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' },
  statBox: { background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  statIcon: { fontSize: '22px', marginBottom: '8px' },
  statValue: { fontSize: '22px', fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },

  alertBanner: { background: '#fee2e2', color: '#991b1b', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' },

  filterTabRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterTabBtn: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 22px', fontSize: '13.5px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' },
  filterTabBtnActive: { background: '#ff6b00', borderColor: '#ff6b00', color: 'white' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '18px', border: '1px solid #f0f0f2' },
  emptyIcon: { fontSize: '54px', marginBottom: '14px' },
  emptyTitle: { fontSize: '17px', fontWeight: '700', color: '#374151', marginBottom: '6px' },
  emptyText: { fontSize: '13.5px', color: '#9ca3af' },

  orderGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' },
  orderCard: { background: 'white', borderRadius: '18px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
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
  waitingRiderNote: { textAlign: 'center', fontSize: '12.5px', color: '#d97706', background: '#fffbeb', padding: '10px', borderRadius: '10px', fontWeight: '600' },

  earningsLayout: {},
  twoColRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' },
  earningsHero: { background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '20px', padding: '28px', marginBottom: '20px', textAlign: 'center' },
  earningsHeroLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' },
  earningsHeroValue: { fontSize: '38px', fontWeight: '800', color: 'white' },
  earningsHeroSub: { fontSize: '12.5px', color: 'rgba(255,255,255,0.75)', marginTop: '6px' },

  earningsCard: { background: 'white', borderRadius: '18px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  earningsCardTitle: { fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '14px' },
  earningsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' },
  earningsLabel: { fontSize: '13.5px', color: '#6b7280' },
  earningsVal: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  earningsDivider: { height: '1px', background: '#f3f4f6', margin: '4px 0' },
  commissionNote: { fontSize: '12px', color: '#9ca3af', marginTop: '16px', lineHeight: '17px', textAlign: 'center' },

  profileCard: { background: 'white', borderRadius: '18px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  profileCardTitle: { fontSize: '14.5px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', padding: '9px 0', borderBottom: '1px solid #f5f5f5' },
  profileLabel: { fontSize: '12.5px', color: '#9ca3af', flexShrink: 0 },
  profileVal: { fontSize: '13.5px', color: '#111827', fontWeight: '600', textAlign: 'right' },
  profileNote: { fontSize: '11.5px', color: '#9ca3af', marginTop: '14px', lineHeight: '16px' },

  formLabel: { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px', marginTop: '4px' },
  formInput: { width: '100%', padding: '11px 13px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13.5px', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' },
  docPreview: { width: '100%', maxWidth: '280px', borderRadius: '10px', marginBottom: '12px', display: 'block' },
  saveBtn: { width: '100%', background: '#ff6b00', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' },
};
