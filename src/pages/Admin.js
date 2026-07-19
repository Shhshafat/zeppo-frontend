import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Admin() {
  const navigate = useNavigate();
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ orders: [], restaurants: [], users: [], applications: [], deliveryBoys: [], notifications: [], banners: [], coupons: [], analytics: {} });
  const [unread, setUnread] = useState(0);
  const [restForm, setRestForm] = useState({ name: '', category: '', emoji: '🍽️', address: '', description: '', image: '', commission_percent: 15, phone: '', min_order: 0, delivery_charge: 0, opening_time: '09:00', closing_time: '23:00' });
  const [menuForm, setMenuForm] = useState({ restaurant_id: '', category: '', name: '', price: '', original_price: '', description: '', image: '' });
  const [portions, setPortions] = useState([]); // [{name:'Half', price:100}]
  const [portionInput, setPortionInput] = useState({ name: '', price: '' });
  const [dboyForm, setDboyForm] = useState({ name: '', phone: '', email: '', password: '', salary_per_delivery: 50 });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', button_text: 'Order Now' });
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', type: 'flat', min_order: 0 });
  const [editRest, setEditRest] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [advanceModal, setAdvanceModal] = useState(null);
  const [advanceAmt, setAdvanceAmt] = useState('');
  const restImgRef = useRef();
  const foodImgRef = useRef();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [orders, rests, users, apps, dboys, notifs, banners, coupons, analytics] = await Promise.all([
      API.get('/api/orders'),
      API.get('/api/restaurants'),
      API.get('/api/users'),
      API.get('/api/applications'),
      API.get('/api/delivery-boys/stats'),
      API.get('/api/notifications'),
      API.get('/api/banners'),
      API.get('/api/coupons'),
      API.get('/api/analytics'),
    ]);
    setData({ orders: orders.data, restaurants: rests.data, users: users.data, applications: apps.data, deliveryBoys: dboys.data, notifications: notifs.data, banners: banners.data, coupons: coupons.data, analytics: analytics.data });
    setUnread(notifs.data.filter(n => !n.is_read).length);
    if (rests.data.length > 0 && !menuForm.restaurant_id) {
      setMenuForm(f => ({ ...f, restaurant_id: rests.data[0].id }));
    }
  };

  const uploadImage = async (file, type) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await API.post(`/api/upload/${type}`, fd);
    return res.data.url;
  };

  const addRestaurant = async () => {
    if (!restForm.name || !restForm.category || !restForm.address) { alert('Fill all fields!'); return; }
    let image = restForm.image;
    if (restImgRef.current?.files[0]) image = await uploadImage(restImgRef.current.files[0], 'restaurant');
    await API.post('/api/restaurants/add', { ...restForm, image });
    setRestForm({ name: '', category: '', emoji: '🍽️', address: '', description: '', image: '', commission_percent: 15, phone: '', min_order: 0, delivery_charge: 0, opening_time: '09:00', closing_time: '23:00' });
    if (restImgRef.current) restImgRef.current.value = '';
    alert('✅ Restaurant added!');
    loadAll();
  };

  const updateRestaurant = async () => {
    if (!editRest) return;
    let image = editRest.image;
    if (restImgRef.current?.files[0]) image = await uploadImage(restImgRef.current.files[0], 'restaurant');
    await API.post('/api/restaurants/update', { ...editRest, image });
    setEditRest(null);
    alert('✅ Restaurant updated!');
    loadAll();
  };

  const toggleRestaurant = async (id, is_open) => {
    await API.post('/api/restaurants/toggle', { id, is_open: is_open ? 0 : 1 });
    loadAll();
  };

  const addPortion = () => {
    if (!portionInput.name || !portionInput.price) { alert('Portion name and price dono bharo!'); return; }
    setPortions([...portions, { name: portionInput.name, price: parseInt(portionInput.price) }]);
    setPortionInput({ name: '', price: '' });
  };

  const removePortion = (i) => setPortions(portions.filter((_, idx) => idx !== i));

  const addMenuItem = async () => {
    if (!menuForm.restaurant_id || !menuForm.name) { alert('Fill all fields!'); return; }
    if (portions.length === 0 && !menuForm.price) { alert('Ya toh price daalo ya portions add karo!'); return; }
    let image = menuForm.image;
    if (foodImgRef.current?.files[0]) image = await uploadImage(foodImgRef.current.files[0], 'food');
    const basePrice = portions.length > 0 ? portions[0].price : parseInt(menuForm.price);
    await API.post('/api/menu/add', {
      ...menuForm,
      price: basePrice,
      original_price: menuForm.original_price ? parseInt(menuForm.original_price) : null,
      portions: portions.length > 0 ? portions : null,
      image
    });
    setMenuForm(f => ({ ...f, category: '', name: '', price: '', original_price: '', description: '', image: '' }));
    setPortions([]);
    if (foodImgRef.current) foodImgRef.current.value = '';
    alert('✅ Item added!');
    loadAll();
  };

  const markNotifRead = async () => {
    await API.post('/api/notifications/read');
    setUnread(0);
    loadAll();
  };

  const addDeliveryBoy = async () => {
    if (!dboyForm.name || !dboyForm.phone) { alert('Naam aur phone zaroori hai!'); return; }
    const res = await API.post('/api/delivery-boys/add', dboyForm);
    if (res.data.success === false) { alert(res.data.message || 'Error!'); return; }
    setDboyForm({ name: '', phone: '', email: '', password: '', salary_per_delivery: 50 });
    alert('✅ Delivery boy added!' + (dboyForm.email ? ' Login credentials ban gaye.' : ''));
    loadAll();
  };

  const giveAdvance = async () => {
    if (!advanceAmt || parseInt(advanceAmt) <= 0) { alert('Sahi amount daalo!'); return; }
    await API.post('/api/delivery-boys/advance', { id: advanceModal.id, amount: parseInt(advanceAmt) });
    setAdvanceModal(null);
    setAdvanceAmt('');
    alert('✅ Advance record ho gaya!');
    loadAll();
  };

  const assignDelivery = async (order_id, delivery_boy_id) => {
    await API.post('/api/orders/assign', { order_id, delivery_boy_id });
    loadAll();
  };

  const cancelOrder = async (id) => {
    if (window.confirm('Order cancel karna hai?')) {
      await API.post('/api/orders/cancel', { id });
      loadAll();
    }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const pages = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'orders', icon: '📦', label: 'Orders' },
    { key: 'restaurants', icon: '🏪', label: 'Restaurants' },
    { key: 'menu', icon: '🍽️', label: 'Menu' },
    { key: 'delivery', icon: '🛵', label: 'Delivery Boys' },
    { key: 'applications', icon: '📝', label: 'Applications' },
    { key: 'banners', icon: '🎨', label: 'Banners' },
    { key: 'coupons', icon: '🎟️', label: 'Coupons' },
    { key: 'users', icon: '👥', label: 'Users' },
  ];

  const { analytics } = data;

  return (
    <div style={s.container}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoText}>⚡ ZEPPO</div>
          <div style={s.logoSub}>Admin Panel</div>
        </div>
        {pages.map(p => (
          <div key={p.key} style={{ ...s.menuItem, ...(page === p.key ? s.menuActive : {}) }} onClick={() => setPage(p.key)}>
            <span style={s.menuIcon}>{p.icon}</span>
            <span>{p.label}</span>
          </div>
        ))}
        <div style={s.menuItem} onClick={() => navigate('/')}><span style={s.menuIcon}>🏠</span><span>Go to App</span></div>
        <div style={s.menuItem} onClick={logout}><span style={s.menuIcon}>🚪</span><span>Logout</span></div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <h2 style={s.pageTitle}>{pages.find(p => p.key === page)?.label || page}</h2>
          <div style={s.topbarRight}>
            <div style={s.notifBtn} onClick={() => { setShowNotif(!showNotif); markNotifRead(); }}>
              🔔 {unread > 0 && <span style={s.badge}>{unread}</span>}
            </div>
            <div style={s.adminBadge}>👤 Shafat</div>
          </div>
        </div>

        {showNotif && (
          <div style={s.notifDropdown}>
            <div style={s.notifTitle}>Notifications</div>
            {data.notifications.slice(0, 10).map(n => (
              <div key={n.id} style={{ ...s.notifItem, background: n.is_read ? 'white' : '#fff3e0' }}>
                <div style={s.notifMsg}>{n.title}</div>
                <div style={s.notifSub}>{n.message}</div>
                <div style={s.notifTime}>{n.created_at}</div>
              </div>
            ))}
          </div>
        )}

        {/* Advance Modal */}
        {advanceModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>💰 Advance to {advanceModal.name}</h3>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>
                Net Balance: ₹{advanceModal.total_earned - advanceModal.advance_taken}
              </div>
              <input style={s.input} placeholder="Advance Amount (₹)" type="number" value={advanceAmt} onChange={e => setAdvanceAmt(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={s.btnGreen} onClick={giveAdvance}>Confirm Advance</button>
                <button style={s.btnRed} onClick={() => { setAdvanceModal(null); setAdvanceAmt(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div style={s.content}>

          {/* Dashboard */}
          {page === 'dashboard' && (
            <div>
              <div style={s.statsGrid}>
                {[
                  { label: 'Total Orders', value: analytics.totalOrders || 0, icon: '📦', color: '#fff3e0' },
                  { label: 'Today Orders', value: analytics.todayOrders || 0, icon: '📅', color: '#e3f2fd' },
                  { label: 'Total Revenue', value: '₹' + (analytics.totalRevenue || 0), icon: '💰', color: '#e8f5e9' },
                  { label: 'Pending Orders', value: analytics.pendingOrders || 0, icon: '⏳', color: '#fce4ec' },
                  { label: 'Restaurants', value: analytics.totalRestaurants || 0, icon: '🏪', color: '#f3e5f5' },
                  { label: 'Total Users', value: analytics.totalUsers || 0, icon: '👥', color: '#e0f7fa' },
                  { label: 'ZEPPO Commission', value: '₹' + (analytics.totalCommission || 0), icon: '💸', color: '#fff9c4' },
                  { label: 'Pending Delivery Payout', value: '₹' + (analytics.totalPendingPayout || 0), icon: '🛵', color: '#ffe0b2' },
                ].map(card => (
                  <div key={card.label} style={s.statCard}>
                    <div>
                      <div style={s.statLabel}>{card.label}</div>
                      <div style={s.statValue}>{card.value}</div>
                    </div>
                    <div style={{ ...s.statIcon, background: card.color }}>{card.icon}</div>
                  </div>
                ))}
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏆 Top Restaurants by Orders</h3>
                <table style={s.table}>
                  <thead><tr>{['Restaurant', 'Orders', 'Revenue'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(analytics.topRestaurants || []).map((r, i) => (
                      <tr key={i}>
                        <td style={s.td}>{r.restaurant_name}</td>
                        <td style={s.td}>{r.orders}</td>
                        <td style={s.td}>₹{r.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>📦 Recent Orders</h3>
                <table style={s.table}>
                  <thead><tr>{['Customer', 'Restaurant', 'Total', 'Payment', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td style={s.td}>{o.customer_name}</td>
                        <td style={s.td}>{o.restaurant_name}</td>
                        <td style={s.td}>₹{o.total}</td>
                        <td style={s.td}>{o.payment_method === 'upi' ? '💳 UPI' : '💵 Cash'}</td>
                        <td style={s.td}><span style={{ ...s.badge2, ...getBadge(o.status) }}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {page === 'orders' && (
            <div style={s.tableCard}>
              <h3 style={s.tableTitle}>📦 All Orders</h3>
              <table style={s.table}>
                <thead><tr>{['ID', 'Customer', 'Phone', 'Restaurant', 'Total', 'Status', 'Delivery Boy', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.orders.map(o => (
                    <tr key={o.id}>
                      <td style={s.td}>#{o.id}</td>
                      <td style={s.td}>{o.customer_name}</td>
                      <td style={s.td}>{o.customer_phone}</td>
                      <td style={s.td}>{o.restaurant_name}</td>
                      <td style={s.td}>₹{o.total}</td>
                      <td style={s.td}><span style={{ ...s.badge2, ...getBadge(o.status) }}>{o.status}</span></td>
                      <td style={s.td}>
                        {o.status !== 'delivered' && o.status !== 'cancelled' ? (
                          <select style={{ ...s.input, marginBottom: 0, padding: '5px', fontSize: '12px' }}
                            value={o.delivery_boy_id || ''}
                            onChange={e => assignDelivery(o.id, e.target.value)}>
                            <option value="">-- Assign --</option>
                            {data.deliveryBoys.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        ) : (
                          data.deliveryBoys.find(d => d.id === o.delivery_boy_id)?.name || '-'
                        )}
                      </td>
                      <td style={s.td}>
                        {o.status === 'pending' && <button style={s.btnConfirm} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'confirmed' }); loadAll(); }}>Confirm</button>}
                        {o.status === 'confirmed' && <button style={s.btnPurple} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'preparing' }); loadAll(); }}>Preparing</button>}
                        {o.status === 'preparing' && <button style={s.btnBlue} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'on_the_way' }); loadAll(); }}>On Way</button>}
                        {o.status === 'on_the_way' && <button style={s.btnGreen} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'delivered' }); loadAll(); }}>Delivered</button>}
                        {(o.status === 'pending' || o.status === 'confirmed') && (
                          <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => cancelOrder(o.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Restaurants */}
          {page === 'restaurants' && (
            <div>
              {editRest && (
                <div style={s.modal}>
                  <div style={s.modalBox}>
                    <h3 style={s.modalTitle}>Edit Restaurant</h3>
                    <input style={s.input} placeholder="Name" value={editRest.name} onChange={e => setEditRest({ ...editRest, name: e.target.value })} />
                    <input style={s.input} placeholder="Category" value={editRest.category} onChange={e => setEditRest({ ...editRest, category: e.target.value })} />
                    <input style={s.input} placeholder="Emoji" value={editRest.emoji} onChange={e => setEditRest({ ...editRest, emoji: e.target.value })} />
                    <input style={s.input} placeholder="Address" value={editRest.address} onChange={e => setEditRest({ ...editRest, address: e.target.value })} />
                    <input style={s.input} placeholder="Phone" value={editRest.phone || ''} onChange={e => setEditRest({ ...editRest, phone: e.target.value })} />
                    <div style={s.formGrid}>
                      <input style={s.input} placeholder="Commission %" type="number" value={editRest.commission_percent ?? 15} onChange={e => setEditRest({ ...editRest, commission_percent: e.target.value })} />
                      <input style={s.input} placeholder="Min Order (₹)" type="number" value={editRest.min_order ?? 0} onChange={e => setEditRest({ ...editRest, min_order: e.target.value })} />
                      <input style={s.input} placeholder="Delivery Charge (₹)" type="number" value={editRest.delivery_charge ?? 0} onChange={e => setEditRest({ ...editRest, delivery_charge: e.target.value })} />
                      <div />
                      <div>
                        <label style={s.uploadLabel}>Opening Time</label>
                        <input style={s.input} type="time" value={editRest.opening_time || '09:00'} onChange={e => setEditRest({ ...editRest, opening_time: e.target.value })} />
                      </div>
                      <div>
                        <label style={s.uploadLabel}>Closing Time</label>
                        <input style={s.input} type="time" value={editRest.closing_time || '23:00'} onChange={e => setEditRest({ ...editRest, closing_time: e.target.value })} />
                      </div>
                    </div>
                    <textarea style={s.textarea} placeholder="Description" value={editRest.description || ''} onChange={e => setEditRest({ ...editRest, description: e.target.value })} />
                    <label style={s.uploadLabel}>📷 Change Logo/Image:</label>
                    <input type="file" ref={restImgRef} accept="image/*" style={s.fileInput} />
                    {editRest.image && <img src={editRest.image} alt="" style={s.previewImg} />}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button style={s.btnGreen} onClick={updateRestaurant}>Save Changes</button>
                      <button style={s.btnRed} onClick={() => setEditRest(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add New Restaurant</h3>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Restaurant Name *" value={restForm.name} onChange={e => setRestForm({ ...restForm, name: e.target.value })} />
                  <input style={s.input} placeholder="Category (e.g. Fast Food) *" value={restForm.category} onChange={e => setRestForm({ ...restForm, category: e.target.value })} />
                  <input style={s.input} placeholder="Emoji (e.g. 🍗)" value={restForm.emoji} onChange={e => setRestForm({ ...restForm, emoji: e.target.value })} />
                  <input style={s.input} placeholder="Address *" value={restForm.address} onChange={e => setRestForm({ ...restForm, address: e.target.value })} />
                  <input style={s.input} placeholder="Phone Number" value={restForm.phone} onChange={e => setRestForm({ ...restForm, phone: e.target.value })} />
                  <input style={s.input} placeholder="Commission % (default 15)" type="number" value={restForm.commission_percent} onChange={e => setRestForm({ ...restForm, commission_percent: e.target.value })} />
                  <input style={s.input} placeholder="Min Order Value (₹)" type="number" value={restForm.min_order} onChange={e => setRestForm({ ...restForm, min_order: e.target.value })} />
                  <input style={s.input} placeholder="Delivery Charge (₹, 0 = free)" type="number" value={restForm.delivery_charge} onChange={e => setRestForm({ ...restForm, delivery_charge: e.target.value })} />
                  <div>
                    <label style={s.uploadLabel}>Opening Time</label>
                    <input style={s.input} type="time" value={restForm.opening_time} onChange={e => setRestForm({ ...restForm, opening_time: e.target.value })} />
                  </div>
                  <div>
                    <label style={s.uploadLabel}>Closing Time</label>
                    <input style={s.input} type="time" value={restForm.closing_time} onChange={e => setRestForm({ ...restForm, closing_time: e.target.value })} />
                  </div>
                </div>
                <textarea style={s.textarea} placeholder="Description" value={restForm.description} onChange={e => setRestForm({ ...restForm, description: e.target.value })} />
                <label style={s.uploadLabel}>📷 Restaurant Logo/Image:</label>
                <input type="file" ref={restImgRef} accept="image/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addRestaurant}>➕ Add Restaurant</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏪 All Restaurants</h3>
                <table style={s.table}>
                  <thead><tr>{['Image', 'Name', 'Category', 'Commission', 'Min Order', 'Rating', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.restaurants.map(r => (
                      <tr key={r.id}>
                        <td style={s.td}>
                          {r.image ? <img src={r.image} alt="" style={s.thumbImg} /> : <span style={{ fontSize: '30px' }}>{r.emoji}</span>}
                        </td>
                        <td style={s.td}><strong>{r.name}</strong><div style={{ fontSize: '12px', color: '#888' }}>{r.phone}</div></td>
                        <td style={s.td}>{r.category}</td>
                        <td style={s.td}>{r.commission_percent || 15}%</td>
                        <td style={s.td}>₹{r.min_order || 0}</td>
                        <td style={s.td}>⭐ {r.rating}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge2, background: r.is_open ? '#d1e7dd' : '#f8d7da', color: r.is_open ? '#0a3622' : '#842029' }}>
                            {r.is_open ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <button style={s.btnConfirm} onClick={() => setEditRest(r)}>Edit</button>
                          <button style={{ ...s.btnConfirm, background: r.is_open ? '#f8d7da' : '#d1e7dd', color: r.is_open ? '#842029' : '#0a3622', marginLeft: '5px' }} onClick={() => toggleRestaurant(r.id, r.is_open)}>
                            {r.is_open ? 'Close' : 'Open'}
                          </button>
                          <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => { if (window.confirm('Delete?')) { API.post('/api/restaurants/delete', { id: r.id }); loadAll(); } }}>Del</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Menu */}
          {page === 'menu' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Menu Item</h3>
                <div style={s.formGrid}>
                  <select id="menu-rest-select" style={s.input} value={menuForm.restaurant_id} onChange={e => setMenuForm({ ...menuForm, restaurant_id: e.target.value })}>
                    <option value="">-- Select Restaurant --</option>
                    {data.restaurants.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}
                  </select>
                  <input style={s.input} placeholder="Category (Gravy, Tandoori...)" value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })} />
                  <input style={s.input} placeholder="Item Name *" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
                  <input style={s.input} placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} />
                </div>

                {portions.length === 0 && (
                  <div style={s.formGrid}>
                    <input style={s.input} placeholder="Price (₹) — if single size" type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} />
                    <input style={s.input} placeholder="Original Price (₹) — optional" type="number" value={menuForm.original_price} onChange={e => setMenuForm({ ...menuForm, original_price: e.target.value })} />
                  </div>
                )}

                <div style={s.portionBox}>
                  <label style={s.uploadLabel}>🍛 Portion Sizes (Half/Full/Qtr/Pcs) — optional, leave blank for single price</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input style={{ ...s.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Half" value={portionInput.name} onChange={e => setPortionInput({ ...portionInput, name: e.target.value })} />
                    <input style={{ ...s.input, marginBottom: 0, width: '100px' }} placeholder="Price" type="number" value={portionInput.price} onChange={e => setPortionInput({ ...portionInput, price: e.target.value })} />
                    <button style={s.btnConfirm} onClick={addPortion}>+ Add</button>
                  </div>
                  {portions.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {portions.map((p, i) => (
                        <div key={i} style={s.portionChip}>
                          {p.name} — ₹{p.price} <span style={{ cursor: 'pointer', color: '#e74c3c', marginLeft: '6px' }} onClick={() => removePortion(i)}>✕</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label style={s.uploadLabel}>🍽️ Food Photo:</label>
                <input type="file" ref={foodImgRef} accept="image/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addMenuItem}>➕ Add Item</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🍽️ Menu by Restaurant</h3>
                <MenuTable restaurants={data.restaurants} reload={loadAll} />
              </div>
            </div>
          )}

          {/* Delivery Boys */}
          {page === 'delivery' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Delivery Boy</h3>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Full Name *" value={dboyForm.name} onChange={e => setDboyForm({ ...dboyForm, name: e.target.value })} />
                  <input style={s.input} placeholder="Phone *" value={dboyForm.phone} onChange={e => setDboyForm({ ...dboyForm, phone: e.target.value })} />
                  <input style={s.input} placeholder="Login Email (optional)" value={dboyForm.email} onChange={e => setDboyForm({ ...dboyForm, email: e.target.value })} />
                  <input style={s.input} placeholder="Login Password (optional)" type="password" value={dboyForm.password} onChange={e => setDboyForm({ ...dboyForm, password: e.target.value })} />
                  <input style={s.input} placeholder="Salary per delivery (₹)" type="number" value={dboyForm.salary_per_delivery} onChange={e => setDboyForm({ ...dboyForm, salary_per_delivery: e.target.value })} />
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>💡 Email/Password doge toh delivery boy khud app mein login karke apne orders dekh sakega.</div>
                <button style={s.btnOrange} onClick={addDeliveryBoy}>➕ Add Delivery Boy</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🛵 Delivery Boys — Salary & Stats</h3>
                <table style={s.table}>
                  <thead><tr>{['Name', 'Phone', 'Salary/Delivery', 'Deliveries', 'Total Earned', 'Advance Taken', 'Net Balance', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.deliveryBoys.map(d => (
                      <tr key={d.id}>
                        <td style={s.td}><strong>{d.name}</strong>{d.user_id && <div style={{ fontSize: '11px', color: '#27ae60' }}>✅ Has Login</div>}</td>
                        <td style={s.td}>{d.phone}</td>
                        <td style={s.td}>
                          <input
                            type="number"
                            defaultValue={d.salary_per_delivery}
                            style={{ ...s.input, width: '80px', padding: '5px', marginBottom: 0 }}
                            onBlur={e => API.post('/api/delivery-boys/salary', { id: d.id, salary_per_delivery: e.target.value })}
                          />
                        </td>
                        <td style={s.td}>{d.total_deliveries}</td>
                        <td style={{ ...s.td, color: '#27ae60', fontWeight: '700' }}>₹{d.total_earned}</td>
                        <td style={{ ...s.td, color: '#e67e22', fontWeight: '700' }}>₹{d.advance_taken || 0}</td>
                        <td style={{ ...s.td, color: '#0d6efd', fontWeight: '700' }}>₹{d.total_earned - (d.advance_taken || 0)}</td>
                        <td style={s.td}><button style={s.btnConfirm} onClick={() => setAdvanceModal(d)}>💰 Advance</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications */}
          {page === 'applications' && (
            <div style={s.tableCard}>
              <h3 style={s.tableTitle}>📝 Delivery Applications</h3>
              <table style={s.table}>
                <thead><tr>{['Name', 'Father', 'Phone', 'Aadhar', 'Address', 'Bike', 'Education', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.applications.map(a => (
                    <tr key={a.id}>
                      <td style={s.td}>{a.full_name}</td>
                      <td style={s.td}>{a.father_name}</td>
                      <td style={s.td}>{a.phone}</td>
                      <td style={s.td}>{a.aadhar}</td>
                      <td style={s.td}>{a.address}</td>
                      <td style={s.td}>{a.has_bike}</td>
                      <td style={s.td}>{a.education}</td>
                      <td style={s.td}><span style={{ ...s.badge2, ...getBadge(a.status) }}>{a.status}</span></td>
                      <td style={s.td}>
                        <button style={s.btnGreen} onClick={() => { API.post('/api/application/status', { id: a.id, status: 'approved' }); loadAll(); }}>✅</button>
                        <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => { API.post('/api/application/status', { id: a.id, status: 'rejected' }); loadAll(); }}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>💡 Approve karne ke baad, "Delivery Boys" tab mein jaake unko login credentials ke saath add karo.</div>
            </div>
          )}

          {/* Banners */}
          {page === 'banners' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Banner</h3>
                <input style={s.input} placeholder="Title *" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} />
                <input style={s.input} placeholder="Subtitle" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
                <input style={s.input} placeholder="Button Text" value={bannerForm.button_text} onChange={e => setBannerForm({ ...bannerForm, button_text: e.target.value })} />
                <button style={s.btnOrange} onClick={async () => {
                  await API.post('/api/banners/add', bannerForm);
                  setBannerForm({ title: '', subtitle: '', button_text: 'Order Now' });
                  loadAll();
                }}>➕ Add Banner</button>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🎨 Active Banners</h3>
                {data.banners.map(b => (
                  <div key={b.id} style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '12px', padding: '20px', marginBottom: '10px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700' }}>{b.title}</div>
                      <div style={{ fontSize: '13px', opacity: '0.8' }}>{b.subtitle}</div>
                      <div style={{ background: '#ff6b00', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', display: 'inline-block', marginTop: '8px' }}>{b.button_text}</div>
                    </div>
                    <button style={s.btnRed} onClick={() => { API.post('/api/banners/delete', { id: b.id }); loadAll(); }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupons */}
          {page === 'coupons' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Coupon</h3>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Coupon Code (e.g. SAVE50) *" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                  <input style={s.input} placeholder="Discount *" type="number" value={couponForm.discount} onChange={e => setCouponForm({ ...couponForm, discount: e.target.value })} />
                  <select style={s.input} value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })}>
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                  <input style={s.input} placeholder="Min Order (₹)" type="number" value={couponForm.min_order} onChange={e => setCouponForm({ ...couponForm, min_order: e.target.value })} />
                </div>
                <button style={s.btnOrange} onClick={async () => {
                  await API.post('/api/coupons/add', couponForm);
                  setCouponForm({ code: '', discount: '', type: 'flat', min_order: 0 });
                  loadAll();
                }}>➕ Add Coupon</button>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🎟️ Active Coupons</h3>
                <table style={s.table}>
                  <thead><tr>{['Code', 'Discount', 'Type', 'Min Order', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.coupons.map(c => (
                      <tr key={c.id}>
                        <td style={s.td}><strong style={{ color: '#ff6b00' }}>{c.code}</strong></td>
                        <td style={s.td}>{c.type === 'percent' ? c.discount + '%' : '₹' + c.discount}</td>
                        <td style={s.td}>{c.type}</td>
                        <td style={s.td}>₹{c.min_order}</td>
                        <td style={s.td}><button style={s.btnRed} onClick={() => { API.post('/api/coupons/delete', { id: c.id }); loadAll(); }}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {page === 'users' && (
            <div style={s.tableCard}>
              <h3 style={s.tableTitle}>👥 All Users</h3>
              <table style={s.table}>
                <thead><tr>{['ID', 'Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>#{u.id}</td>
                      <td style={s.td}>{u.name}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>{u.phone}</td>
                      <td style={s.td}><span style={{ ...s.badge2, background: u.role === 'admin' ? '#cfe2ff' : u.role === 'delivery' ? '#ffe0b2' : '#f0f0f0', color: u.role === 'admin' ? '#084298' : u.role === 'delivery' ? '#e65100' : '#333' }}>{u.role}</span></td>
                      <td style={s.td}>{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Menu Table Component — with Edit
function MenuTable({ restaurants, reload }) {
  const [menuData, setMenuData] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [editPortions, setEditPortions] = useState([]);
  const [editPortionInput, setEditPortionInput] = useState({ name: '', price: '' });

  useEffect(() => {
    restaurants.forEach(async r => {
      const res = await API.get(`/api/menu/${r.id}`);
      setMenuData(prev => ({ ...prev, [r.id]: res.data }));
    });
  }, [restaurants]);

  const openEdit = (item) => {
    setEditItem({ ...item });
    try {
      setEditPortions(item.portions ? JSON.parse(item.portions) : []);
    } catch { setEditPortions([]); }
  };

  const addEditPortion = () => {
    if (!editPortionInput.name || !editPortionInput.price) return;
    setEditPortions([...editPortions, { name: editPortionInput.name, price: parseInt(editPortionInput.price) }]);
    setEditPortionInput({ name: '', price: '' });
  };

  const removeEditPortion = (i) => setEditPortions(editPortions.filter((_, idx) => idx !== i));

  const saveEdit = async () => {
    const basePrice = editPortions.length > 0 ? editPortions[0].price : parseInt(editItem.price);
    await API.post('/api/menu/update', {
      id: editItem.id, name: editItem.name, price: basePrice,
      original_price: editItem.original_price || null,
      portions: editPortions.length > 0 ? editPortions : null,
      description: editItem.description, image: editItem.image,
      is_available: editItem.is_available
    });
    setEditItem(null);
    reload();
  };

  const reloadMenu = () => {
    restaurants.forEach(async r => {
      const res = await API.get(`/api/menu/${r.id}`);
      setMenuData(prev => ({ ...prev, [r.id]: res.data }));
    });
    reload();
  };

  return (
    <div>
      {editItem && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h3 style={s.modalTitle}>Edit Menu Item</h3>
            <input style={s.input} placeholder="Name" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} />
            <textarea style={s.textarea} placeholder="Description" value={editItem.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} />

            {editPortions.length === 0 && (
              <div style={s.formGrid}>
                <input style={s.input} placeholder="Price (₹)" type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: e.target.value })} />
                <input style={s.input} placeholder="Original Price (₹)" type="number" value={editItem.original_price || ''} onChange={e => setEditItem({ ...editItem, original_price: e.target.value })} />
              </div>
            )}

            <div style={s.portionBox}>
              <label style={s.uploadLabel}>🍛 Portion Sizes</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input style={{ ...s.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Full" value={editPortionInput.name} onChange={e => setEditPortionInput({ ...editPortionInput, name: e.target.value })} />
                <input style={{ ...s.input, marginBottom: 0, width: '100px' }} placeholder="Price" type="number" value={editPortionInput.price} onChange={e => setEditPortionInput({ ...editPortionInput, price: e.target.value })} />
                <button style={s.btnConfirm} onClick={addEditPortion}>+ Add</button>
              </div>
              {editPortions.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {editPortions.map((p, i) => (
                    <div key={i} style={s.portionChip}>
                      {p.name} — ₹{p.price} <span style={{ cursor: 'pointer', color: '#e74c3c', marginLeft: '6px' }} onClick={() => removeEditPortion(i)}>✕</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', fontSize: '14px' }}>
              <input type="checkbox" checked={editItem.is_available === 1} onChange={e => setEditItem({ ...editItem, is_available: e.target.checked ? 1 : 0 })} />
              Available (uncheck for "Out of Stock")
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={s.btnGreen} onClick={saveEdit}>Save Changes</button>
              <button style={s.btnRed} onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {restaurants.map(r => (
        <div key={r.id} style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b00', marginBottom: '10px', padding: '8px 0', borderBottom: '2px solid #ff6b00' }}>
            {r.emoji} {r.name}
          </div>
          {(menuData[r.id] || []).length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '14px' }}>No items yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Image', 'Category', 'Item', 'Price', 'Status', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#888', borderBottom: '1px solid #f0f0f0' }}>{h}</th>)}</tr></thead>
              <tbody>
                {(menuData[r.id] || []).map(item => {
                  let itemPortions = [];
                  try { itemPortions = item.portions ? JSON.parse(item.portions) : []; } catch {}
                  return (
                    <tr key={item.id}>
                      <td style={{ padding: '8px' }}>
                        {item.image ? <img src={item.image} alt="" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>🍽️</span>}
                      </td>
                      <td style={{ padding: '8px', fontSize: '13px' }}>{item.category}</td>
                      <td style={{ padding: '8px', fontSize: '13px' }}><strong>{item.name}</strong><div style={{ fontSize: '12px', color: '#888' }}>{item.description}</div></td>
                      <td style={{ padding: '8px', fontSize: '13px' }}>
                        {itemPortions.length > 0 ? (
                          itemPortions.map((p, i) => <div key={i}>{p.name}: ₹{p.price}</div>)
                        ) : item.original_price ? (
                          <>
                            <span style={{ color: '#aaa', textDecoration: 'line-through', marginRight: '6px' }}>₹{item.original_price}</span>
                            <span style={{ color: '#ff6b00', fontWeight: '700' }}>₹{item.price}</span>
                          </>
                        ) : (
                          <span style={{ color: '#ff6b00', fontWeight: '700' }}>₹{item.price}</span>
                        )}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ ...s.badge2, background: item.is_available ? '#d1e7dd' : '#f8d7da', color: item.is_available ? '#0a3622' : '#842029' }}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button style={s.btnConfirm} onClick={() => openEdit(item)}>Edit</button>
                        <button style={{ ...s.btnConfirm, marginLeft: '5px', background: item.is_available ? '#f8d7da' : '#d1e7dd', color: item.is_available ? '#842029' : '#0a3622' }}
                          onClick={() => { API.post('/api/menu/toggle', { id: item.id, is_available: item.is_available ? 0 : 1 }); reloadMenu(); }}>
                          {item.is_available ? 'Mark Out' : 'Mark In'}
                        </button>
                        <button style={{ background: '#f8d7da', color: '#842029', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}
                          onClick={() => { API.post('/api/menu/delete', { id: item.id }); reloadMenu(); }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

function getBadge(status) {
  const colors = {
    pending: { background: '#fff3cd', color: '#856404' },
    confirmed: { background: '#cfe2ff', color: '#084298' },
    preparing: { background: '#e2d9f3', color: '#6f42c1' },
    on_the_way: { background: '#ffd700', color: '#333' },
    delivered: { background: '#d1e7dd', color: '#0a3622' },
    cancelled: { background: '#f8d7da', color: '#842029' },
    approved: { background: '#d1e7dd', color: '#0a3622' },
    rejected: { background: '#f8d7da', color: '#842029' },
  };
  return colors[status] || { background: '#f0f0f0', color: '#333' };
}

const s = {
  container: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  sidebar: { width: '240px', background: '#1a1a2e', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, overflowY: 'auto' },
  sidebarLogo: { padding: '20px', borderBottom: '1px solid #2d2d44' },
  logoText: { color: '#ff6b00', fontSize: '22px', fontWeight: '700' },
  logoSub: { color: '#aaa', fontSize: '12px', marginTop: '3px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#aaa', cursor: 'pointer', fontSize: '14px' },
  menuActive: { background: '#ff6b00', color: 'white', borderRadius: '0 25px 25px 0', marginRight: '15px' },
  menuIcon: { fontSize: '18px', width: '24px' },
  main: { marginLeft: '240px', flex: 1 },
  topbar: { background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 99 },
  pageTitle: { fontSize: '20px', color: '#333', fontWeight: '600' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  notifBtn: { position: 'relative', cursor: 'pointer', fontSize: '20px' },
  badge: { position: 'absolute', top: '-5px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adminBadge: { background: '#ff6b00', color: 'white', padding: '8px 15px', borderRadius: '25px', fontSize: '14px' },
  notifDropdown: { position: 'absolute', right: '20px', top: '65px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', width: '320px', zIndex: 200, maxHeight: '400px', overflowY: 'auto' },
  notifTitle: { padding: '15px', fontWeight: '700', borderBottom: '1px solid #f0f0f0', fontSize: '15px' },
  notifItem: { padding: '12px 15px', borderBottom: '1px solid #f5f5f5' },
  notifMsg: { fontSize: '14px', fontWeight: '600', color: '#333' },
  notifSub: { fontSize: '12px', color: '#888', marginTop: '3px' },
  notifTime: { fontSize: '11px', color: '#aaa', marginTop: '3px' },
  content: { padding: '25px 30px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  statCard: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: '13px', color: '#888', marginBottom: '5px' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#333' },
  statIcon: { width: '55px', height: '55px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  tableCard: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' },
  formCard: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' },
  tableTitle: { fontSize: '15px', color: '#333', marginBottom: '15px', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 8px', fontSize: '12px', color: '#888', borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 8px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f9f9f9' },
  badge2: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px', resize: 'vertical', minHeight: '80px' },
  uploadLabel: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '600' },
  fileInput: { marginBottom: '12px', fontSize: '13px' },
  previewImg: { width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', marginBottom: '10px', display: 'block' },
  thumbImg: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
  btnOrange: { background: '#ff6b00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnGreen: { background: '#d1e7dd', color: '#0a3622', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnRed: { background: '#f8d7da', color: '#842029', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnConfirm: { background: '#cfe2ff', color: '#084298', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnPurple: { background: '#e2d9f3', color: '#6f42c1', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnBlue: { background: '#cfe2ff', color: '#084298', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '16px', padding: '25px', width: '500px', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: '#333' },
  portionBox: { background: '#f9f9f9', borderRadius: '10px', padding: '15px', marginBottom: '12px' },
  portionChip: { background: '#fff3e0', color: '#e65100', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: '600' },
};
