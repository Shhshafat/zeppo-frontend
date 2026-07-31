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
  const token = localStorage.getItem('token');

  const [docForm, setDocForm] = useState({ owner_name: '', fssai_license: '', gst_number: '' });
  const [savingDocs, setSavingDocs] = useState(false);
  const docFileRef = useRef();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([loadOrders(), loadMe(), loadEarnings()]).finally(() => setLoading(false));
    const interval = setInterval(() => { loadOrders(); }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (me) setDocForm({ owner_name: me.owner_name || '', fssai_license: me.fssai_license || '', gst_number: me.gst_number || '' });
  }, [me]);

  const loadOrders = async () => {
    const res = await API.get('/api/restaurant/orders', { headers: { Authorization: `Bearer ${token}` } });
    setOrders(res.data);
  };
  const loadMe = async () => {
    const res = await API.get('/api/restaurant/me', { headers: { Authorization: `Bearer ${token}` } });
    setMe(res.data);
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
                <div style={s.brandText}>ZEPPO Partner</div>
                <div style={s.brandSub}>{me?.name}</div>
              </div>
            </div>
            <button style={s.logoutBtn} onClick={logout}>Logout</button>
          </div>
          <div style={{ ...s.verifyBadge, color: vInfo.color, background: vInfo.bg }}>{vInfo.label}</div>
        </div>

        {/* Tab bar */}
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

          {/* ===== ORDERS TAB ===== */}
          {tab === 'orders' && (
            <>
              <div style={s.statsGrid}>
                <div style={s.statBox}><div style={s.statIcon}>📦</div><div style={s.statValue}>{activeOrders.length}</div><div style={s.statLabel}>Active</div></div>
                <div style={s.statBox}><div style={s.statIcon}>📅</div><div style={s.statValue}>{earnings?.todayOrders ?? 0}</div><div style={s.statLabel}>Today</div></div>
                <div style={s.statBox}><div style={s.statIcon}>💰</div><div style={s.statValue}>₹{earnings?.todayRevenue ?? 0}</div><div style={s.statLabel}>Today's Sales</div></div>
              </div>

              {activeOrders.some(o => o.status === 'pending' && o.delivery_accepted === 1) && (
                <div style={s.alertBanner}>
                  🔔 You have {activeOrders.filter(o => o.status === 'pending' && o.delivery_accepted === 1).length} new order(s) waiting to be confirmed!
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
                displayedOrders.map(o => {
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
                })
              )}
            </>
          )}

          {/* ===== EARNINGS TAB ===== */}
          {tab === 'earnings' && earnings && (
            <>
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
                <div style={s.earningsRow}><span style={s.earningsLabel}>Total Commission Owed to ZEPPO</span><span style={{ ...s.earningsVal, color: '#d97706' }}>₹{earnings.totalCommission}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}><span style={s.earningsLabel}>Already Settled</span><span style={{ ...s.earningsVal, color: '#059669' }}>₹{earnings.settled}</span></div>
                <div style={s.earningsDivider} />
                <div style={s.earningsRow}>
                  <span style={{ ...s.earningsLabel, fontWeight: '700', color: '#111827' }}>Pending Commission</span>
                  <span style={{ ...s.earningsVal, color: '#dc2626', fontSize: '17px' }}>₹{earnings.pendingCommissionOwed}</span>
                </div>
                <div style={s.commissionNote}>💡 ZEPPO settles commission payments periodically — contact support if this looks off.</div>
              </div>
            </>
          )}

          {/* ===== PROFILE TAB ===== */}
          {tab === 'profile' && me && (
            <>
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
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fb' },
  container: { maxWidth: '480px', margin: '0 auto' },

  header: { background: 'linear-gradient(135deg, #1a0a12, #2a1520)', padding: '45px 20px 20px', borderRadius: '0 0 24px 24px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { width: '38px', height: '38px', background: '#ff6b00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  brandText: { fontSize: '15px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' },
  brandSub: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' },
  logoutBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  verifyBadge: { display: 'inline-block', fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '20px' },

  tabBar: { display: 'flex', background: 'white', margin: '0 16px', marginTop: '-18px', borderRadius: '14px', padding: '5px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative', zIndex: 2 },
  tabBarBtn: { flex: 1, background: 'transparent', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' },
  tabBarBtnActive: { background: '#ff6b00', color: 'white' },

  content: { padding: '20px 16px 40px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' },
  statBox: { background: 'white', borderRadius: '14px', padding: '16px 8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  statIcon: { fontSize: '18px', marginBottom: '6px' },
  statValue: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: '10.5px', color: '#9ca3af', marginTop: '2px' },

  alertBanner: { background: '#fee2e2', color: '#991b1b', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },

  filterTabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  filterTabBtn: { flex: 1, background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' },
  filterTabBtnActive: { background: '#ff6b00', borderColor: '#ff6b00', color: 'white' },

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
  waitingRiderNote: { textAlign: 'center', fontSize: '12.5px', color: '#d97706', background: '#fffbeb', padding: '10px', borderRadius: '10px', fontWeight: '600' },

  earningsHero: { background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: '18px', padding: '22px', marginBottom: '16px', textAlign: 'center' },
  earningsHeroLabel: { fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', marginBottom: '6px' },
  earningsHeroValue: { fontSize: '32px', fontWeight: '800', color: 'white' },
  earningsHeroSub: { fontSize: '11.5px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' },

  earningsCard: { background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  earningsCardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '12px' },
  earningsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' },
  earningsLabel: { fontSize: '13.5px', color: '#6b7280' },
  earningsVal: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  earningsDivider: { height: '1px', background: '#f3f4f6', margin: '4px 0' },
  commissionNote: { fontSize: '11.5px', color: '#9ca3af', marginTop: '12px', lineHeight: '16px' },

  profileCard: { background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f0f0f2' },
  profileCardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '14px' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  profileLabel: { fontSize: '12.5px', color: '#9ca3af', flexShrink: 0 },
  profileVal: { fontSize: '13.5px', color: '#111827', fontWeight: '600', textAlign: 'right' },
  profileNote: { fontSize: '11.5px', color: '#9ca3af', marginTop: '12px', lineHeight: '16px' },

  formLabel: { display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '6px', marginTop: '4px' },
  formInput: { width: '100%', padding: '11px 13px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13.5px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' },
  docPreview: { width: '100%', maxWidth: '280px', borderRadius: '10px', marginBottom: '10px', display: 'block' },
  saveBtn: { width: '100%', background: '#ff6b00', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' },
};
