import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Admin() {
  const navigate = useNavigate();
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ orders: [], restaurants: [], users: [], applications: [], deliveryBoys: [], notifications: [], banners: [], coupons: [], analytics: {}, shifts: [] });
  const [unread, setUnread] = useState(0);
  const [restForm, setRestForm] = useState({ name: '', category: '', emoji: '🍽️', address: '', description: '', image: '', commission_percent: 15, discount_percent: 0, free_delivery: 1, phone: '', min_order: 0, delivery_charge: 0, opening_time: '09:00', closing_time: '23:00', lat: '', lng: '', login_email: '', login_password: '', dineout_image: '' });
  const [menuForm, setMenuForm] = useState({ restaurant_id: '', category: '', name: '', price: '', original_price: '', description: '', image: '', is_veg: 1, is_featured: 0 });
  const [portions, setPortions] = useState([]);
  const [portionInput, setPortionInput] = useState({ name: '', price: '' });
  const [dboyForm, setDboyForm] = useState({ name: '', phone: '', email: '', password: '', salary_per_delivery: 50 });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', button_text: 'Order Now', link: '', category: 'food', position: 'top' });
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', type: 'flat', min_order: 0 });
  const [editRest, setEditRest] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [advanceModal, setAdvanceModal] = useState(null);
  const [advanceAmt, setAdvanceAmt] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const [removeModal, setRemoveModal] = useState(null);

  const [restSettlements, setRestSettlements] = useState([]);
  const [payRestModal, setPayRestModal] = useState(null);
  const [payAmt, setPayAmt] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDeliveryModal, setPayDeliveryModal] = useState(null);
  const [settleAmt, setSettleAmt] = useState('');
  const [settleNote, setSettleNote] = useState('');

  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('open');
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  // App Settings state
  const [settings, setSettings] = useState({});
  const [settingsForm, setSettingsForm] = useState({ top_banner_image: '', tagline: 'Ghar tak, jhatpat!', support_email: 'support@zeppo.in', support_phone: '', whatsapp_number: '', maintenance_mode: 'off', default_sound: 'muted', promo_popup_enabled: '0', promo_popup_title: '', promo_popup_text: '', promo_popup_button_text: '', promo_popup_link: '', promo_popup_is_video: '0' });

  // Stays state
  const [stays, setStays] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [stayForm, setStayForm] = useState({ name: '', type: 'Hotel', price_per_night: '', address: '', phone: '', amenities: '', description: '' });
  const [editStay, setEditStay] = useState(null);
  const [stayFilter, setStayFilter] = useState('pending');

  // Dineout Tiles state
  const [dineoutTiles, setDineoutTiles] = useState([]);
  const [tileForm, setTileForm] = useState({ label: '', icon: 'star', image: '', filter_type: 'none', filter_value: '', sort_order: 0 });
  const [editTile, setEditTile] = useState(null);

  // Stays Tiles state
  const [staysTiles, setStaysTiles] = useState([]);
  const [stayTileForm, setStayTileForm] = useState({ label: '', icon: 'star', image: '', filter_type: 'none', filter_value: '', sort_order: 0 });
  const [editStayTile, setEditStayTile] = useState(null);

  const restImgRef = useRef();
  const dineoutImgRef = useRef();
  const foodImgRef = useRef();
  const bannerFileRef = useRef();
  const topBannerRef = useRef();
  const dineoutBannerRef = useRef();
  const staysBannerRef = useRef();
  const promoImgRef = useRef();
  const stayImgRef = useRef();
  const editStayImgRef = useRef();
  const tileImgRef = useRef();
  const editTileImgRef = useRef();
  const stayTileImgRef = useRef();
  const editStayTileImgRef = useRef();

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (page === 'settlements') loadSettlements(); }, [page]);
  useEffect(() => { if (page === 'tickets') loadTickets(); }, [page]);
  useEffect(() => { if (page === 'appsettings') loadSettings(); }, [page]);
  useEffect(() => { if (page === 'stays') loadStays(); }, [page]);
  useEffect(() => { if (page === 'dineouttiles') loadTiles(); }, [page]);
  useEffect(() => { if (page === 'staystiles') loadStaysTiles(); }, [page]);

  const loadTiles = async () => {
    const res = await API.get('/api/dineout-tiles/all');
    setDineoutTiles(res.data);
  };

  const loadStaysTiles = async () => {
    const res = await API.get('/api/stays-tiles/all');
    setStaysTiles(res.data);
  };

  const loadAll = async () => {
    const [orders, rests, users, apps, dboys, notifs, banners, coupons, analytics, shifts] = await Promise.all([
      API.get('/api/orders'), API.get('/api/restaurants'), API.get('/api/users'), API.get('/api/applications'),
      API.get('/api/delivery-boys/stats'), API.get('/api/notifications'), API.get('/api/banners'),
      API.get('/api/coupons'), API.get('/api/analytics'), API.get('/api/delivery-boys/all-shifts'),
    ]);
    setData({ orders: orders.data, restaurants: rests.data, users: users.data, applications: apps.data, deliveryBoys: dboys.data, notifications: notifs.data, banners: banners.data, coupons: coupons.data, analytics: analytics.data, shifts: shifts.data });
    setUnread(notifs.data.filter(n => !n.is_read).length);
    if (rests.data.length > 0 && !menuForm.restaurant_id) setMenuForm(f => ({ ...f, restaurant_id: rests.data[0].id }));
  };

  const [refunds, setRefunds] = useState([]);
  const loadSettlements = async () => {
    const res = await API.get('/api/settlements/restaurants');
    setRestSettlements(res.data);
    const refundRes = await API.get('/api/orders/refunds');
    setRefunds(refundRes.data);
  };

  const markRefunded = async (id) => {
    if (!window.confirm('Confirm that this refund has been sent to the customer?')) return;
    await API.post('/api/orders/refunds/complete', { id });
    loadSettlements();
  };

  const loadTickets = async () => {
    const res = await API.get('/api/tickets');
    setTickets(res.data);
  };

  const loadSettings = async () => {
    const res = await API.get('/api/settings');
    setSettings(res.data);
    setSettingsForm(f => ({ ...f, ...res.data }));
  };

  const loadStays = async () => {
    const [staysRes, bookingsRes] = await Promise.all([API.get('/api/stays'), API.get('/api/stays/bookings')]);
    setStays(staysRes.data);
    setStayBookings(bookingsRes.data);
  };

  const uploadImage = async (file, type) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await API.post(`/api/upload/${type}`, fd);
    return res.data;
  };

  const addRestaurant = async () => {
    if (!restForm.name || !restForm.category || !restForm.address) { alert('Fill all fields!'); return; }
    let image = restForm.image;
    if (restImgRef.current?.files[0]) { const r = await uploadImage(restImgRef.current.files[0], 'restaurant'); image = r.url; }
    let dineout_image = restForm.dineout_image || '';
    if (dineoutImgRef.current?.files[0]) { const r = await uploadImage(dineoutImgRef.current.files[0], 'restaurant'); dineout_image = r.url; }
    const res = await API.post('/api/restaurants/add', { ...restForm, image, dineout_image });
    if (res.data.success === false) { alert(res.data.message || 'Error adding restaurant!'); return; }
    const loginWasCreated = restForm.login_email;
    setRestForm({ name: '', category: '', emoji: '🍽️', address: '', description: '', image: '', commission_percent: 15, discount_percent: 0, free_delivery: 1, phone: '', min_order: 0, delivery_charge: 0, opening_time: '09:00', closing_time: '23:00', lat: '', lng: '', login_email: '', login_password: '', dineout_image: '' });
    if (restImgRef.current) restImgRef.current.value = '';
    if (dineoutImgRef.current) dineoutImgRef.current.value = '';
    alert('✅ Restaurant added!' + (loginWasCreated ? ' Login credentials created — restaurant can sign in on the same login page.' : ''));
    loadAll();
  };

  const updateRestaurant = async () => {
    if (!editRest) return;
    let image = editRest.image;
    if (restImgRef.current?.files[0]) { const r = await uploadImage(restImgRef.current.files[0], 'restaurant'); image = r.url; }
    let dineout_image = editRest.dineout_image || '';
    if (dineoutImgRef.current?.files[0]) { const r = await uploadImage(dineoutImgRef.current.files[0], 'restaurant'); dineout_image = r.url; }
    await API.post('/api/restaurants/update', { ...editRest, image, dineout_image });
    setEditRest(null);
    if (dineoutImgRef.current) dineoutImgRef.current.value = '';
    alert('✅ Restaurant updated!');
    loadAll();
  };

  const toggleRestaurant = async (id, is_open) => { await API.post('/api/restaurants/toggle', { id, is_open: is_open ? 0 : 1 }); loadAll(); };

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
    if (foodImgRef.current?.files[0]) { const r = await uploadImage(foodImgRef.current.files[0], 'food'); image = r.url; }
    const basePrice = portions.length > 0 ? portions[0].price : parseInt(menuForm.price);
    await API.post('/api/menu/add', { ...menuForm, price: basePrice, original_price: menuForm.original_price ? parseInt(menuForm.original_price) : null, portions: portions.length > 0 ? portions : null, image });
    setMenuForm(f => ({ ...f, category: '', name: '', price: '', original_price: '', description: '', image: '', is_veg: 1, is_featured: 0 }));
    setPortions([]);
    if (foodImgRef.current) foodImgRef.current.value = '';
    alert('✅ Item added!');
    loadAll();
  };

  const markNotifRead = async () => { await API.post('/api/notifications/read'); setUnread(0); loadAll(); };

  const addDeliveryBoy = async () => {
    if (!dboyForm.name || !dboyForm.phone) { alert('Naam aur phone zaroori hai!'); return; }
    const res = await API.post('/api/delivery-boys/add', dboyForm);
    if (res.data.success === false) { alert(res.data.message || 'Error!'); return; }
    setDboyForm({ name: '', phone: '', email: '', password: '', salary_per_delivery: 50 });
    alert('✅ Delivery boy added!' + (dboyForm.email ? ' Login credentials ban gaye.' : ''));
    loadAll();
  };

  const openAdvanceModal = async (d) => {
    setAdvanceModal(d);
    const res = await API.get(`/api/delivery-boys/${d.id}/advances`);
    setAdvanceHistory(res.data);
  };

  const giveAdvance = async () => {
    if (!advanceAmt || parseInt(advanceAmt) <= 0) { alert('Sahi amount daalo!'); return; }
    await API.post('/api/delivery-boys/advance', { id: advanceModal.id, amount: parseInt(advanceAmt), note: advanceNote });
    setAdvanceModal(null); setAdvanceAmt(''); setAdvanceNote('');
    alert('✅ Advance record ho gaya!');
    loadAll();
  };

  const confirmRemove = async () => {
    await API.post('/api/delivery-boys/remove', { id: removeModal.id });
    setRemoveModal(null);
    alert('✅ Delivery boy remove ho gaya.');
    loadAll();
  };

  const assignDelivery = async (order_id, delivery_boy_id) => { await API.post('/api/orders/assign', { order_id, delivery_boy_id }); loadAll(); };
  const cancelOrder = async (id) => { if (window.confirm('Order cancel karna hai?')) { await API.post('/api/orders/cancel', { id }); loadAll(); } };
  const logout = () => { localStorage.clear(); navigate('/login'); };

  const formatTime = (dt) => dt ? new Date(dt + 'Z').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';
  const formatDate = (dt) => dt ? new Date(dt + 'Z').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
  const shiftDuration = (checkIn, checkOut) => {
    if (!checkIn) return '-';
    const start = new Date(checkIn + 'Z');
    const end = checkOut ? new Date(checkOut + 'Z') : new Date();
    const mins = Math.round((end - start) / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const payRestaurant = async () => {
    if (!payAmt || parseInt(payAmt) <= 0) { alert('Sahi amount daalo!'); return; }
    await API.post('/api/settlements/restaurant/pay', { restaurant_id: payRestModal.id, amount: parseInt(payAmt), note: payNote });
    setPayRestModal(null); setPayAmt(''); setPayNote('');
    alert('✅ Payment record ho gaya!');
    loadSettlements();
  };
  const settleDelivery = async () => {
    if (!settleAmt || parseInt(settleAmt) <= 0) { alert('Sahi amount daalo!'); return; }
    await API.post('/api/delivery-boys/settle', { id: payDeliveryModal.id, amount: parseInt(settleAmt), note: settleNote });
    setPayDeliveryModal(null); setSettleAmt(''); setSettleNote('');
    alert('✅ Payout settle ho gaya!');
    loadAll();
  };

  const sendReply = async () => {
    if (!replyText.trim()) { alert('Reply likho!'); return; }
    await API.post('/api/tickets/reply', { id: replyModal.id, reply: replyText });
    setReplyModal(null); setReplyText('');
    loadTickets();
  };
  const updateTicketStatus = async (id, status) => { await API.post('/api/tickets/status', { id, status }); loadTickets(); };

  const filteredTickets = tickets.filter(t => ticketFilter === 'all' ? true : t.status === ticketFilter);

  const addBanner = async () => {
    if (!bannerFileRef.current?.files[0]) { alert('Photo ya video upload karo!'); return; }
    const r = await uploadImage(bannerFileRef.current.files[0], 'banner');
    await API.post('/api/banners/add', { ...bannerForm, image: r.url, is_video: r.is_video });
    setBannerForm({ title: '', subtitle: '', button_text: 'Order Now', link: '', category: 'food', position: 'top' });
    if (bannerFileRef.current) bannerFileRef.current.value = '';
    loadAll();
  };

  // ===== App Settings handlers =====
  const saveSetting = async (key, value) => {
    await API.post('/api/settings', { key, value });
    loadSettings();
  };

  const saveAllSettings = async () => {
    let promo_popup_image = settingsForm.promo_popup_image || '';
    let promo_popup_is_video = settingsForm.promo_popup_is_video || '0';
    if (promoImgRef.current?.files[0]) {
      const r = await uploadImage(promoImgRef.current.files[0], 'banner');
      promo_popup_image = r.url;
      promo_popup_is_video = r.is_video ? '1' : '0';
    }
    const toSave = { ...settingsForm, promo_popup_image, promo_popup_is_video };
    for (const key of ['tagline', 'support_email', 'support_phone', 'whatsapp_number', 'maintenance_mode', 'default_sound', 'promo_popup_enabled', 'promo_popup_image', 'promo_popup_title', 'promo_popup_text', 'promo_popup_button_text', 'promo_popup_link', 'promo_popup_is_video']) {
      await API.post('/api/settings', { key, value: toSave[key] || '' });
    }
    if (promoImgRef.current) promoImgRef.current.value = '';
    alert('✅ Settings saved!');
    loadSettings();
  };

  const uploadTopBanner = async (suffix = '') => {
    const ref = suffix === 'dineout' ? dineoutBannerRef : suffix === 'stays' ? staysBannerRef : topBannerRef;
    if (!ref.current?.files[0]) { alert('Photo ya video select karo!'); return; }
    const r = await uploadImage(ref.current.files[0], 'banner');
    const key = suffix ? `top_banner_image_${suffix}` : 'top_banner_image';
    const videoKey = suffix ? `top_banner_is_video_${suffix}` : 'top_banner_is_video';
    await saveSetting(key, r.url);
    await saveSetting(videoKey, r.is_video ? '1' : '0');
    if (ref.current) ref.current.value = '';
    alert('✅ Banner updated!');
  };

  const removeTopBanner = async (suffix = '') => {
    const key = suffix ? `top_banner_image_${suffix}` : 'top_banner_image';
    await saveSetting(key, '');
    alert('✅ Removed!');
  };

  // ===== Stays handlers =====
  const addStay = async () => {
    if (!stayForm.name || !stayForm.price_per_night || !stayForm.address) { alert('Fill all required fields!'); return; }
    let images = [];
    if (stayImgRef.current?.files[0]) { const r = await uploadImage(stayImgRef.current.files[0], 'stay'); images = [r.url]; }
    await API.post('/api/stays/add', { ...stayForm, price_per_night: parseInt(stayForm.price_per_night), images });
    setStayForm({ name: '', type: 'Hotel', price_per_night: '', address: '', phone: '', amenities: '', description: '' });
    if (stayImgRef.current) stayImgRef.current.value = '';
    alert('✅ Stay added!');
    loadStays();
  };

  const openEditStay = (stay) => {
    let images = [];
    try { images = stay.images ? JSON.parse(stay.images) : []; } catch {}
    setEditStay({ ...stay, images });
  };

  const updateStay = async () => {
    let images = editStay.images || [];
    if (editStayImgRef.current?.files[0]) { const r = await uploadImage(editStayImgRef.current.files[0], 'stay'); images = [r.url]; }
    await API.post('/api/stays/update', { ...editStay, price_per_night: parseInt(editStay.price_per_night), images });
    setEditStay(null);
    alert('✅ Stay updated!');
    loadStays();
  };

  const deleteStay = async (id) => {
    if (window.confirm('Delete this stay listing?')) {
      await API.post('/api/stays/delete', { id });
      loadStays();
    }
  };

  const updateBookingStatus = async (id, status) => {
    await API.post('/api/stays/bookings/status', { id, status });
    loadStays();
  };

  // ===== Dineout Tiles handlers =====
  const addTile = async () => {
    if (!tileForm.label) { alert('Label zaroori hai!'); return; }
    let image = tileForm.image;
    if (tileImgRef.current?.files[0]) { const r = await uploadImage(tileImgRef.current.files[0], 'tile'); image = r.url; }
    await API.post('/api/dineout-tiles/add', { ...tileForm, image });
    setTileForm({ label: '', icon: 'star', image: '', filter_type: 'none', filter_value: '', sort_order: 0 });
    if (tileImgRef.current) tileImgRef.current.value = '';
    alert('✅ Tile added!');
    loadTiles();
  };
  const updateTile = async () => {
    let image = editTile.image;
    if (editTileImgRef.current?.files[0]) { const r = await uploadImage(editTileImgRef.current.files[0], 'tile'); image = r.url; }
    await API.post('/api/dineout-tiles/update', { ...editTile, image });
    setEditTile(null);
    alert('✅ Tile updated!');
    loadTiles();
  };
  const deleteTile = async (id) => {
    if (window.confirm('Delete this tile?')) {
      await API.post('/api/dineout-tiles/delete', { id });
      loadTiles();
    }
  };
  const toggleTileActive = async (tile) => {
    await API.post('/api/dineout-tiles/update', { ...tile, is_active: tile.is_active ? 0 : 1 });
    loadTiles();
  };

  const ICON_OPTIONS = ['percent', 'award', 'coffee', 'trending-up', 'star', 'gift', 'heart', 'map-pin', 'tag', 'thumbs-up', 'clock', 'truck', 'zap'];

  // ===== Stays Tiles handlers =====
  const addStayTile = async () => {
    if (!stayTileForm.label) { alert('Label zaroori hai!'); return; }
    let image = stayTileForm.image;
    if (stayTileImgRef.current?.files[0]) { const r = await uploadImage(stayTileImgRef.current.files[0], 'tile'); image = r.url; }
    await API.post('/api/stays-tiles/add', { ...stayTileForm, image });
    setStayTileForm({ label: '', icon: 'star', image: '', filter_type: 'none', filter_value: '', sort_order: 0 });
    if (stayTileImgRef.current) stayTileImgRef.current.value = '';
    alert('✅ Tile added!');
    loadStaysTiles();
  };
  const updateStayTile = async () => {
    let image = editStayTile.image;
    if (editStayTileImgRef.current?.files[0]) { const r = await uploadImage(editStayTileImgRef.current.files[0], 'tile'); image = r.url; }
    await API.post('/api/stays-tiles/update', { ...editStayTile, image });
    setEditStayTile(null);
    alert('✅ Tile updated!');
    loadStaysTiles();
  };
  const deleteStayTile = async (id) => {
    if (window.confirm('Delete this tile?')) {
      await API.post('/api/stays-tiles/delete', { id });
      loadStaysTiles();
    }
  };
  const toggleStayTileActive = async (tile) => {
    await API.post('/api/stays-tiles/update', { ...tile, is_active: tile.is_active ? 0 : 1 });
    loadStaysTiles();
  };

  const filteredBookings = stayBookings.filter(b => stayFilter === 'all' ? true : b.status === stayFilter);

  const pages = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'orders', icon: '📦', label: 'Orders' },
    { key: 'restaurants', icon: '🏪', label: 'Restaurants' },
    { key: 'menu', icon: '🍽️', label: 'Menu' },
    { key: 'delivery', icon: '🛵', label: 'Delivery Boys' },
    { key: 'settlements', icon: '💳', label: 'Settlements' },
    { key: 'stays', icon: '🏨', label: '🏨 Stays (Hotels/Rooms)' },
    { key: 'dineouttiles', icon: '🍽️', label: '🍽️ Dineout Features' },
    { key: 'staystiles', icon: '🏨', label: '🏨 Stays Features' },
    { key: 'tickets', icon: '🎫', label: 'Support Tickets' },
    { key: 'applications', icon: '📝', label: 'Applications' },
    { key: 'banners', icon: '🎨', label: 'Banners' },
    { key: 'coupons', icon: '🎟️', label: 'Coupons' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'appsettings', icon: '⚙️', label: 'App Settings' },
  ];

  const { analytics } = data;
  const pendingBookingsCount = stayBookings.filter(b => b.status === 'pending').length;

  return (
    <div style={s.container}>
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoText}>⚡ ZEPPO</div>
          <div style={s.logoSub}>Admin Panel</div>
        </div>
        {pages.map(p => (
          <div key={p.key} style={{ ...s.menuItem, ...(page === p.key ? s.menuActive : {}) }} onClick={() => setPage(p.key)}>
            <span style={s.menuIcon}>{p.icon}</span><span>{p.label}</span>
            {p.key === 'tickets' && analytics.openTickets > 0 && <span style={s.sideBadge}>{analytics.openTickets}</span>}
            {p.key === 'stays' && pendingBookingsCount > 0 && <span style={s.sideBadge}>{pendingBookingsCount}</span>}
            {p.key === 'settlements' && analytics.pendingRefunds > 0 && <span style={s.sideBadge}>{analytics.pendingRefunds}</span>}
          </div>
        ))}
        <div style={s.menuItem} onClick={() => navigate('/')}><span style={s.menuIcon}>🏠</span><span>Go to App</span></div>
        <div style={s.menuItem} onClick={logout}><span style={s.menuIcon}>🚪</span><span>Logout</span></div>
      </div>

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
                <div style={s.notifMsg}>{n.title}</div><div style={s.notifSub}>{n.message}</div><div style={s.notifTime}>{n.created_at}</div>
              </div>
            ))}
          </div>
        )}

        {advanceModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>💰 Advance to {advanceModal.name}</h3>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>Net Balance: ₹{advanceModal.total_earned - advanceModal.advance_taken - (advanceModal.paid_out || 0)}</div>
              <input style={s.input} placeholder="Advance Amount (₹)" type="number" value={advanceAmt} onChange={e => setAdvanceAmt(e.target.value)} />
              <input style={s.input} placeholder="Note (e.g. bike fuel, emergency)" value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button style={s.btnGreen} onClick={giveAdvance}>Confirm Advance</button>
                <button style={s.btnRed} onClick={() => { setAdvanceModal(null); setAdvanceAmt(''); setAdvanceNote(''); }}>Cancel</button>
              </div>
              {advanceHistory.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>History</div>
                  {advanceHistory.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span>{h.note || 'Advance'}</span><span style={{ fontWeight: '700', color: '#e67e22' }}>₹{h.amount} · {formatDate(h.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {removeModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>⚠️ Remove {removeModal.name}?</h3>
              <div style={{ background: '#fff3e0', borderRadius: '10px', padding: '15px', marginBottom: '15px' }}>
                <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>Final Settlement</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0d6efd' }}>₹{removeModal.total_earned - removeModal.advance_taken - (removeModal.paid_out || 0)}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Net balance owed — pay before removing.</div>
              </div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Removing disables their login. Order/salary history stays on record.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={s.btnRed} onClick={confirmRemove}>Confirm Remove</button>
                <button style={s.btnConfirm} onClick={() => setRemoveModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {payRestModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>💳 Record Payment — {payRestModal.name}</h3>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>Pending Commission: ₹{payRestModal.pending}</div>
              <input style={s.input} placeholder="Amount Received (₹)" type="number" value={payAmt} onChange={e => setPayAmt(e.target.value)} />
              <input style={s.input} placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={s.btnGreen} onClick={payRestaurant}>Confirm</button>
                <button style={s.btnRed} onClick={() => { setPayRestModal(null); setPayAmt(''); setPayNote(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {payDeliveryModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>💸 Settle Payout — {payDeliveryModal.name}</h3>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>
                Net Balance: ₹{payDeliveryModal.total_earned - payDeliveryModal.advance_taken - (payDeliveryModal.paid_out || 0)}
              </div>
              <input style={s.input} placeholder="Amount Paid (₹)" type="number" value={settleAmt} onChange={e => setSettleAmt(e.target.value)} />
              <input style={s.input} placeholder="Note (optional)" value={settleNote} onChange={e => setSettleNote(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={s.btnGreen} onClick={settleDelivery}>Confirm Payout</button>
                <button style={s.btnRed} onClick={() => { setPayDeliveryModal(null); setSettleAmt(''); setSettleNote(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {replyModal && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>🎫 {replyModal.subject}</h3>
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '15px', fontSize: '13px', color: '#555' }}>
                <div style={{ marginBottom: '4px' }}><strong>{replyModal.name}</strong> · {replyModal.phone} {replyModal.email ? `· ${replyModal.email}` : ''}</div>
                {replyModal.message}
              </div>
              {replyModal.admin_reply && (
                <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px', marginBottom: '15px', fontSize: '13px', color: '#1e40af' }}>
                  <strong>Previous reply:</strong> {replyModal.admin_reply}
                </div>
              )}
              <textarea style={s.textarea} placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button style={s.btnGreen} onClick={sendReply}>Send Reply</button>
                <button style={s.btnConfirm} onClick={() => { updateTicketStatus(replyModal.id, 'resolved'); setReplyModal(null); }}>Mark Resolved</button>
                <button style={s.btnRed} onClick={() => { setReplyModal(null); setReplyText(''); }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {editStay && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalTitle}>Edit Stay — {editStay.name}</h3>
              <input style={s.input} placeholder="Name" value={editStay.name} onChange={e => setEditStay({ ...editStay, name: e.target.value })} />
              <select style={s.input} value={editStay.type} onChange={e => setEditStay({ ...editStay, type: e.target.value })}>
                <option>Hotel</option><option>Apartment</option><option>Guesthouse</option><option>Homestay</option>
              </select>
              <input style={s.input} placeholder="Price per night (₹)" type="number" value={editStay.price_per_night} onChange={e => setEditStay({ ...editStay, price_per_night: e.target.value })} />
              <input style={s.input} placeholder="Address" value={editStay.address} onChange={e => setEditStay({ ...editStay, address: e.target.value })} />
              <input style={s.input} placeholder="Owner Phone" value={editStay.phone || ''} onChange={e => setEditStay({ ...editStay, phone: e.target.value })} />
              <input style={s.input} placeholder="Amenities (comma separated)" value={editStay.amenities || ''} onChange={e => setEditStay({ ...editStay, amenities: e.target.value })} />
              <textarea style={s.textarea} placeholder="Description" value={editStay.description || ''} onChange={e => setEditStay({ ...editStay, description: e.target.value })} />
              <label style={s.uploadLabel}>📷 Change Photo:</label>
              <input type="file" ref={editStayImgRef} accept="image/*" style={s.fileInput} />
              {editStay.images && editStay.images[0] && <img src={editStay.images[0]} alt="" style={s.previewImg} />}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button style={s.btnGreen} onClick={updateStay}>Save Changes</button>
                <button style={s.btnRed} onClick={() => setEditStay(null)}>Cancel</button>
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
                  { label: 'Open Support Tickets', value: analytics.openTickets || 0, icon: '🎫', color: '#fce4ec' },
                  { label: 'Pending Refunds', value: analytics.pendingRefunds || 0, icon: '💰', color: '#ffe0e0' },
                ].map(card => (
                  <div key={card.label} style={s.statCard}>
                    <div><div style={s.statLabel}>{card.label}</div><div style={s.statValue}>{card.value}</div></div>
                    <div style={{ ...s.statIcon, background: card.color }}>{card.icon}</div>
                  </div>
                ))}
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏆 Top Restaurants by Orders</h3>
                <table style={s.table}>
                  <thead><tr>{['Restaurant', 'Orders', 'Revenue'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>{(analytics.topRestaurants || []).map((r, i) => (<tr key={i}><td style={s.td}>{r.restaurant_name}</td><td style={s.td}>{r.orders}</td><td style={s.td}>₹{r.revenue}</td></tr>))}</tbody>
                </table>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>📦 Recent Orders</h3>
                <table style={s.table}>
                  <thead><tr>{['Customer', 'Restaurant', 'Total', 'Payment', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.orders.slice(0, 5).map(o => (
                      <tr key={o.id}><td style={s.td}>{o.customer_name}</td><td style={s.td}>{o.restaurant_name}</td><td style={s.td}>₹{o.total}</td>
                        <td style={s.td}>{o.payment_method === 'upi' ? '💳 UPI' : '💵 Cash'}</td><td style={s.td}><span style={{ ...s.badge2, ...getBadge(o.status) }}>{o.status}</span></td></tr>
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
                      <td style={s.td}>#{o.id}</td><td style={s.td}>{o.customer_name}</td><td style={s.td}>{o.customer_phone}</td>
                      <td style={s.td}>{o.restaurant_name}</td><td style={s.td}>₹{o.total}</td>
                      <td style={s.td}><span style={{ ...s.badge2, ...getBadge(o.status) }}>{o.status}</span></td>
                      <td style={s.td}>
                        {o.status !== 'delivered' && o.status !== 'cancelled' ? (
                          <select style={{ ...s.input, marginBottom: 0, padding: '5px', fontSize: '12px' }} value={o.delivery_boy_id || ''} onChange={e => assignDelivery(o.id, e.target.value)}>
                            <option value="">-- Assign --</option>
                            {data.deliveryBoys.map(d => <option key={d.id} value={d.id}>{d.is_online ? '🟢' : '⚪'} {d.name}</option>)}
                          </select>
                        ) : (data.deliveryBoys.find(d => d.id === o.delivery_boy_id)?.name || '-')}
                      </td>
                      <td style={s.td}>
                        {o.status === 'pending' && <button style={s.btnConfirm} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'confirmed' }); loadAll(); }}>Confirm</button>}
                        {o.status === 'confirmed' && <button style={s.btnPurple} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'preparing' }); loadAll(); }}>Preparing</button>}
                        {o.status === 'preparing' && <button style={s.btnBlue} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'on_the_way' }); loadAll(); }}>On Way</button>}
                        {o.status === 'on_the_way' && <button style={s.btnGreen} onClick={() => { API.post('/api/orders/status', { id: o.id, status: 'delivered' }); loadAll(); }}>Delivered</button>}
                        {(o.status === 'pending' || o.status === 'confirmed') && <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => cancelOrder(o.id)}>Cancel</button>}
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
                      <input style={s.input} placeholder="Discount % (e.g. 20 — shown as offer badge)" type="number" value={editRest.discount_percent ?? 0} onChange={e => setEditRest({ ...editRest, discount_percent: e.target.value })} />
                      <input style={s.input} placeholder="Min Order (₹)" type="number" value={editRest.min_order ?? 0} onChange={e => setEditRest({ ...editRest, min_order: e.target.value })} />
                      <input style={s.input} placeholder="Delivery Charge (₹)" type="number" value={editRest.delivery_charge ?? 0} onChange={e => setEditRest({ ...editRest, delivery_charge: e.target.value })} />
                      <select style={s.input} value={editRest.free_delivery ?? 1} onChange={e => setEditRest({ ...editRest, free_delivery: parseInt(e.target.value) })}>
                        <option value={1}>🎉 Free Delivery: Yes</option>
                        <option value={0}>Free Delivery: No</option>
                      </select>
                      <div><label style={s.uploadLabel}>Opening Time</label><input style={s.input} type="time" value={editRest.opening_time || '09:00'} onChange={e => setEditRest({ ...editRest, opening_time: e.target.value })} /></div>
                      <div><label style={s.uploadLabel}>Closing Time</label><input style={s.input} type="time" value={editRest.closing_time || '23:00'} onChange={e => setEditRest({ ...editRest, closing_time: e.target.value })} /></div>
                      <input style={s.input} placeholder="Latitude" value={editRest.lat ?? ''} onChange={e => setEditRest({ ...editRest, lat: e.target.value })} />
                      <input style={s.input} placeholder="Longitude" value={editRest.lng ?? ''} onChange={e => setEditRest({ ...editRest, lng: e.target.value })} />
                    </div>
                    <textarea style={s.textarea} placeholder="Description" value={editRest.description || ''} onChange={e => setEditRest({ ...editRest, description: e.target.value })} />
                    <label style={s.uploadLabel}>📷 Change Logo/Image:</label>
                    <input type="file" ref={restImgRef} accept="image/*" style={s.fileInput} />
                    {editRest.image && <img src={editRest.image} alt="" style={s.previewImg} />}

                    <label style={s.uploadLabel}>🍽️ Dineout Ambiance Photo (separate from logo):</label>
                    <input type="file" ref={dineoutImgRef} accept="image/*" style={s.fileInput} />
                    {editRest.dineout_image && <img src={editRest.dineout_image} alt="" style={s.previewImg} />}

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
                  <input style={s.input} placeholder="Discount % (e.g. 20 — shown as offer badge)" type="number" value={restForm.discount_percent} onChange={e => setRestForm({ ...restForm, discount_percent: e.target.value })} />
                  <input style={s.input} placeholder="Min Order Value (₹)" type="number" value={restForm.min_order} onChange={e => setRestForm({ ...restForm, min_order: e.target.value })} />
                  <input style={s.input} placeholder="Delivery Charge (₹, 0 = free)" type="number" value={restForm.delivery_charge} onChange={e => setRestForm({ ...restForm, delivery_charge: e.target.value })} />
                  <div>
                    <label style={s.uploadLabel}>Free Delivery Badge?</label>
                    <select style={s.input} value={restForm.free_delivery} onChange={e => setRestForm({ ...restForm, free_delivery: parseInt(e.target.value) })}>
                      <option value={1}>🎉 Yes, show "Free Delivery"</option>
                      <option value={0}>No</option>
                    </select>
                  </div>
                  <input style={s.input} placeholder="Latitude (e.g. 34.5259)" value={restForm.lat} onChange={e => setRestForm({ ...restForm, lat: e.target.value })} />
                  <input style={s.input} placeholder="Longitude (e.g. 74.2547)" value={restForm.lng} onChange={e => setRestForm({ ...restForm, lng: e.target.value })} />
                  <div><label style={s.uploadLabel}>Opening Time</label><input style={s.input} type="time" value={restForm.opening_time} onChange={e => setRestForm({ ...restForm, opening_time: e.target.value })} /></div>
                  <div><label style={s.uploadLabel}>Closing Time</label><input style={s.input} type="time" value={restForm.closing_time} onChange={e => setRestForm({ ...restForm, closing_time: e.target.value })} /></div>
                </div>
                <textarea style={s.textarea} placeholder="Description" value={restForm.description} onChange={e => setRestForm({ ...restForm, description: e.target.value })} />

                <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', background: '#f0f7ff', padding: '10px 12px', borderRadius: '8px' }}>
                  📍 <strong>How to get Latitude/Longitude:</strong> Open Google Maps, long-press the restaurant's exact location, tap the coordinates that pop up to copy them (e.g. "34.5259, 74.2547" — first number is Latitude, second is Longitude). This powers auto-assigning the nearest delivery boy and calculating accurate delivery fees.
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginTop: '5px' }}>
                  <label style={s.uploadLabel}>🔑 Restaurant Login (optional — lets them see &amp; confirm their own orders)</label>
                  <div style={s.formGrid}>
                    <input style={s.input} placeholder="Login Email" value={restForm.login_email} onChange={e => setRestForm({ ...restForm, login_email: e.target.value })} />
                    <input style={s.input} placeholder="Login Password" type="password" value={restForm.login_password} onChange={e => setRestForm({ ...restForm, login_password: e.target.value })} />
                  </div>
                </div>
                <label style={s.uploadLabel}>📷 Restaurant Logo/Image (used in Home, Stores, Category listings):</label>
                <input type="file" ref={restImgRef} accept="image/*" style={s.fileInput} />

                <label style={s.uploadLabel}>🍽️ Dineout Ambiance Photo (optional — shown on the "Reserve a Table" card in Dineout tab; if left empty, the logo above is used instead)</label>
                <input type="file" ref={dineoutImgRef} accept="image/*" style={s.fileInput} />

                <button style={s.btnOrange} onClick={addRestaurant}>➕ Add Restaurant</button>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏪 All Restaurants</h3>
                <table style={s.table}>
                  <thead><tr>{['Image', 'Name', 'Category', 'Commission', 'Discount', 'Min Order', 'Rating', 'Status', 'Verification', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.restaurants.map(r => (
                      <tr key={r.id}>
                        <td style={s.td}>{r.image ? <img src={r.image} alt="" style={s.thumbImg} /> : <span style={{ fontSize: '30px' }}>{r.emoji}</span>}</td>
                        <td style={s.td}><strong>{r.name}</strong><div style={{ fontSize: '12px', color: '#888' }}>{r.phone}</div></td>
                        <td style={s.td}>{r.category}</td><td style={s.td}>{r.commission_percent || 15}%</td>
                        <td style={s.td}>{r.discount_percent > 0 ? <span style={{ color: '#e74c3c', fontWeight: '700' }}>{r.discount_percent}% OFF</span> : <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={s.td}>₹{r.min_order || 0}</td><td style={s.td}>⭐ {r.rating}</td>
                        <td style={s.td}><span style={{ ...s.badge2, background: r.is_open ? '#d1e7dd' : '#f8d7da', color: r.is_open ? '#0a3622' : '#842029' }}>{r.is_open ? 'Open' : 'Closed'}</span></td>
                        <td style={s.td}>
                          <span style={{ ...s.badge2, ...(r.verification_status === 'verified' ? { background: '#d1e7dd', color: '#0a3622' } : r.verification_status === 'rejected' ? { background: '#f8d7da', color: '#842029' } : { background: '#fff3cd', color: '#856404' }) }}>
                            {r.verification_status === 'verified' ? '✅ Verified' : r.verification_status === 'rejected' ? '⚠️ Rejected' : '⏳ Pending'}
                          </span>
                          {r.fssai_document && (
                            <div style={{ marginTop: '6px' }}>
                              <a href={r.fssai_document} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#0d6efd' }}>View FSSAI Doc</a>
                              {r.fssai_license && <div style={{ fontSize: '10.5px', color: '#888' }}>{r.fssai_license}</div>}
                            </div>
                          )}
                          {r.fssai_document && r.verification_status !== 'verified' && (
                            <div style={{ marginTop: '6px' }}>
                              <button style={s.btnGreen} onClick={() => { API.post('/api/restaurants/verify', { id: r.id, verification_status: 'verified' }); loadAll(); }}>Verify</button>
                              <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => { API.post('/api/restaurants/verify', { id: r.id, verification_status: 'rejected' }); loadAll(); }}>Reject</button>
                            </div>
                          )}
                        </td>
                        <td style={s.td}>
                          <button style={s.btnConfirm} onClick={() => setEditRest(r)}>Edit</button>
                          <button style={{ ...s.btnConfirm, background: r.is_open ? '#f8d7da' : '#d1e7dd', color: r.is_open ? '#842029' : '#0a3622', marginLeft: '5px' }} onClick={() => toggleRestaurant(r.id, r.is_open)}>{r.is_open ? 'Close' : 'Open'}</button>
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
                  <label style={s.uploadLabel}>🍛 Portion Sizes — optional</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input style={{ ...s.input, marginBottom: 0, flex: 1 }} placeholder="e.g. Half" value={portionInput.name} onChange={e => setPortionInput({ ...portionInput, name: e.target.value })} />
                    <input style={{ ...s.input, marginBottom: 0, width: '100px' }} placeholder="Price" type="number" value={portionInput.price} onChange={e => setPortionInput({ ...portionInput, price: e.target.value })} />
                    <button style={s.btnConfirm} onClick={addPortion}>+ Add</button>
                  </div>
                  {portions.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {portions.map((p, i) => <div key={i} style={s.portionChip}>{p.name} — ₹{p.price} <span style={{ cursor: 'pointer', color: '#e74c3c', marginLeft: '6px' }} onClick={() => removePortion(i)}>✕</span></div>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div onClick={() => setMenuForm({ ...menuForm, is_veg: 1 })} style={{ flex: 1, padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: menuForm.is_veg === 1 ? '2px solid #27ae60' : '1px solid #e0e0e0', background: menuForm.is_veg === 1 ? '#e8f5e9' : 'white', color: menuForm.is_veg === 1 ? '#0a3622' : '#888' }}>🟢 Veg</div>
                  <div onClick={() => setMenuForm({ ...menuForm, is_veg: 0 })} style={{ flex: 1, padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: menuForm.is_veg === 0 ? '2px solid #e74c3c' : '1px solid #e0e0e0', background: menuForm.is_veg === 0 ? '#fce4ec' : 'white', color: menuForm.is_veg === 0 ? '#842029' : '#888' }}>🔴 Non-Veg</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 12px', fontSize: '13px', cursor: 'pointer', background: menuForm.is_featured ? '#fff3e0' : '#fafafa', padding: '10px 12px', borderRadius: '8px', border: menuForm.is_featured ? '1.5px solid #ff6b00' : '1px solid #eee' }}>
                  <input type="checkbox" checked={!!menuForm.is_featured} onChange={e => setMenuForm({ ...menuForm, is_featured: e.target.checked ? 1 : 0 })} />
                  🔥 Show in "Trending Dishes" on Home page
                </label>
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
                <button style={s.btnOrange} onClick={addDeliveryBoy}>➕ Add Delivery Boy</button>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🛵 Delivery Boys — Salary & Stats</h3>
                <table style={s.table}>
                  <thead><tr>{['Status', 'Name', 'Phone', 'Salary/Delivery', 'Deliveries', 'Total Earned', 'Advance', 'Paid Out', 'Net Balance', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.deliveryBoys.map(d => (
                      <tr key={d.id}>
                        <td style={s.td}><span style={{ ...s.badge2, background: d.is_online ? '#d1e7dd' : '#f0f0f0', color: d.is_online ? '#0a3622' : '#888' }}>{d.is_online ? '🟢' : '⚪'}</span></td>
                        <td style={s.td}><strong>{d.name}</strong>{d.user_id && <div style={{ fontSize: '11px', color: '#27ae60' }}>✅ Has Login</div>}</td>
                        <td style={s.td}>{d.phone}</td>
                        <td style={s.td}><input type="number" defaultValue={d.salary_per_delivery} style={{ ...s.input, width: '70px', padding: '5px', marginBottom: 0 }} onBlur={e => API.post('/api/delivery-boys/salary', { id: d.id, salary_per_delivery: e.target.value })} /></td>
                        <td style={s.td}>{d.total_deliveries}</td>
                        <td style={{ ...s.td, color: '#27ae60', fontWeight: '700' }}>₹{d.total_earned}</td>
                        <td style={{ ...s.td, color: '#e67e22', fontWeight: '700' }}>₹{d.advance_taken || 0}</td>
                        <td style={{ ...s.td, color: '#6f42c1', fontWeight: '700' }}>₹{d.paid_out || 0}</td>
                        <td style={{ ...s.td, color: '#0d6efd', fontWeight: '700' }}>₹{d.total_earned - (d.advance_taken || 0) - (d.paid_out || 0)}</td>
                        <td style={s.td}>
                          <button style={s.btnConfirm} onClick={() => openAdvanceModal(d)}>💰 Advance</button>
                          <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => setRemoveModal(d)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🕐 Today's Online/Offline Log</h3>
                {data.shifts.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No shifts recorded today yet.</p> : (
                  <table style={s.table}>
                    <thead><tr>{['Delivery Boy', 'Check In', 'Check Out', 'Duration'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>{data.shifts.map(sh => (<tr key={sh.id}><td style={s.td}>{sh.delivery_boy_name}</td><td style={s.td}>{formatTime(sh.check_in)}</td><td style={s.td}>{sh.check_out ? formatTime(sh.check_out) : <span style={{ color: '#27ae60', fontWeight: '600' }}>Still Online</span>}</td><td style={s.td}>{shiftDuration(sh.check_in, sh.check_out)}</td></tr>))}</tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SETTLEMENTS */}
          {page === 'settlements' && (
            <div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏪 Restaurant Commission Settlements</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Commission ZEPPO earns on each delivered order.</p>
                <table style={s.table}>
                  <thead><tr>{['Restaurant', 'Orders', 'Revenue', 'Commission %', 'Total Owed', 'Settled', 'Pending', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {restSettlements.map(r => (
                      <tr key={r.id}>
                        <td style={s.td}>{r.emoji} <strong>{r.name}</strong></td>
                        <td style={s.td}>{r.orders}</td>
                        <td style={s.td}>₹{r.revenue}</td>
                        <td style={s.td}>{r.commission_percent}%</td>
                        <td style={{ ...s.td, fontWeight: '700' }}>₹{r.totalCommission}</td>
                        <td style={{ ...s.td, color: '#27ae60' }}>₹{r.settled}</td>
                        <td style={{ ...s.td, color: r.pending > 0 ? '#e74c3c' : '#27ae60', fontWeight: '700' }}>₹{r.pending}</td>
                        <td style={s.td}>
                          {r.pending > 0 ? <button style={s.btnConfirm} onClick={() => setPayRestModal(r)}>Record Payment</button> : <span style={{ fontSize: '12px', color: '#27ae60' }}>✅ Settled</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🛵 Delivery Boy Payouts</h3>
                <table style={s.table}>
                  <thead><tr>{['Name', 'Total Earned', 'Advance', 'Paid Out', 'Net Balance', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.deliveryBoys.map(d => {
                      const net = d.total_earned - (d.advance_taken || 0) - (d.paid_out || 0);
                      return (
                        <tr key={d.id}>
                          <td style={s.td}><strong>{d.name}</strong></td>
                          <td style={{ ...s.td, color: '#27ae60' }}>₹{d.total_earned}</td>
                          <td style={{ ...s.td, color: '#e67e22' }}>₹{d.advance_taken || 0}</td>
                          <td style={{ ...s.td, color: '#6f42c1' }}>₹{d.paid_out || 0}</td>
                          <td style={{ ...s.td, fontWeight: '700', color: net > 0 ? '#0d6efd' : '#27ae60' }}>₹{net}</td>
                          <td style={s.td}>
                            {net > 0 ? <button style={s.btnConfirm} onClick={() => setPayDeliveryModal(d)}>Settle Payout</button> : <span style={{ fontSize: '12px', color: '#27ae60' }}>✅ Settled</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>💰 UPI Refunds Pending</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Orders cancelled after being paid via UPI — money needs to be manually sent back to customer.</p>
                {refunds.filter(o => o.refund_status === 'pending').length === 0 ? (
                  <p style={{ color: '#27ae60', fontSize: '14px' }}>✅ No pending refunds!</p>
                ) : (
                  <table style={s.table}>
                    <thead><tr>{['Order', 'Customer', 'Phone', 'Amount', 'Cancelled', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {refunds.filter(o => o.refund_status === 'pending').map(o => (
                        <tr key={o.id}>
                          <td style={s.td}>#{o.id}</td>
                          <td style={s.td}>{o.customer_name}</td>
                          <td style={s.td}>{o.customer_phone}</td>
                          <td style={{ ...s.td, fontWeight: '700', color: '#e74c3c' }}>₹{o.total}</td>
                          <td style={s.td}>{formatDate(o.created_at)}</td>
                          <td style={s.td}><button style={s.btnGreen} onClick={() => markRefunded(o.id)}>✅ Mark Refunded</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {refunds.filter(o => o.refund_status === 'refunded').length > 0 && (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', margin: '18px 0 8px' }}>Recently Refunded</div>
                    <table style={s.table}>
                      <thead><tr>{['Order', 'Customer', 'Amount'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {refunds.filter(o => o.refund_status === 'refunded').slice(0, 5).map(o => (
                          <tr key={o.id}><td style={s.td}>#{o.id}</td><td style={s.td}>{o.customer_name}</td><td style={{ ...s.td, color: '#27ae60' }}>₹{o.total}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STAYS */}
          {page === 'stays' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Hotel / Apartment / Room</h3>
                <div style={s.formGrid}>
                  <input style={s.input} placeholder="Name *" value={stayForm.name} onChange={e => setStayForm({ ...stayForm, name: e.target.value })} />
                  <select style={s.input} value={stayForm.type} onChange={e => setStayForm({ ...stayForm, type: e.target.value })}>
                    <option>Hotel</option><option>Apartment</option><option>Guesthouse</option><option>Homestay</option>
                  </select>
                  <input style={s.input} placeholder="Price per night (₹) *" type="number" value={stayForm.price_per_night} onChange={e => setStayForm({ ...stayForm, price_per_night: e.target.value })} />
                  <input style={s.input} placeholder="Address *" value={stayForm.address} onChange={e => setStayForm({ ...stayForm, address: e.target.value })} />
                  <input style={s.input} placeholder="Owner Phone" value={stayForm.phone} onChange={e => setStayForm({ ...stayForm, phone: e.target.value })} />
                  <input style={s.input} placeholder="Amenities (e.g. WiFi, AC, Parking)" value={stayForm.amenities} onChange={e => setStayForm({ ...stayForm, amenities: e.target.value })} />
                </div>
                <textarea style={s.textarea} placeholder="Description" value={stayForm.description} onChange={e => setStayForm({ ...stayForm, description: e.target.value })} />
                <label style={s.uploadLabel}>📷 Photo:</label>
                <input type="file" ref={stayImgRef} accept="image/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addStay}>➕ Add Stay</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏨 All Listings ({stays.length})</h3>
                {stays.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No stays added yet.</p> : (
                  <table style={s.table}>
                    <thead><tr>{['Photo', 'Name', 'Type', 'Price/Night', 'Address', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {stays.map(st => {
                        let imgs = [];
                        try { imgs = st.images ? JSON.parse(st.images) : []; } catch {}
                        return (
                          <tr key={st.id}>
                            <td style={s.td}>{imgs[0] ? <img src={imgs[0]} alt="" style={s.thumbImg} /> : <span style={{ fontSize: '24px' }}>🏨</span>}</td>
                            <td style={s.td}><strong>{st.name}</strong></td>
                            <td style={s.td}>{st.type}</td>
                            <td style={s.td}>₹{st.price_per_night}</td>
                            <td style={s.td}>{st.address}</td>
                            <td style={s.td}>
                              <button style={s.btnConfirm} onClick={() => openEditStay(st)}>Edit</button>
                              <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => deleteStay(st.id)}>Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>📩 Booking Requests</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  {['pending', 'confirmed', 'rejected', 'all'].map(f => (
                    <div key={f} onClick={() => setStayFilter(f)} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: stayFilter === f ? '#ff6b00' : 'white', color: stayFilter === f ? 'white' : '#555', border: '1px solid #e0e0e0', textTransform: 'capitalize' }}>{f}</div>
                  ))}
                </div>
                {filteredBookings.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No booking requests here.</p> : (
                  <table style={s.table}>
                    <thead><tr>{['Stay', 'Customer', 'Phone', 'Check-in', 'Check-out', 'Guests', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b.id}>
                          <td style={s.td}>{b.stay_name}</td>
                          <td style={s.td}>{b.customer_name}</td>
                          <td style={s.td}>{b.customer_phone}</td>
                          <td style={s.td}>{b.check_in}</td>
                          <td style={s.td}>{b.check_out}</td>
                          <td style={s.td}>{b.guests}</td>
                          <td style={s.td}><span style={{ ...s.badge2, ...getBadge(b.status) }}>{b.status}</span></td>
                          <td style={s.td}>
                            {b.status === 'pending' && (
                              <>
                                <button style={s.btnGreen} onClick={() => updateBookingStatus(b.id, 'confirmed')}>✅</button>
                                <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => updateBookingStatus(b.id, 'rejected')}>❌</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* DINEOUT FEATURES (Tiles) */}
          {page === 'dineouttiles' && (
            <div>
              {editTile && (
                <div style={s.modal}>
                  <div style={s.modalBox}>
                    <h3 style={s.modalTitle}>Edit Tile</h3>
                    <label style={s.uploadLabel}>Label (use a line break for 2 lines)</label>
                    <textarea style={s.textarea} value={editTile.label} onChange={e => setEditTile({ ...editTile, label: e.target.value })} />
                    <label style={s.uploadLabel}>Icon</label>
                    <select style={s.input} value={editTile.icon} onChange={e => setEditTile({ ...editTile, icon: e.target.value })}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <label style={s.uploadLabel}>What should tapping this tile filter by?</label>
                    <select style={s.input} value={editTile.filter_type} onChange={e => setEditTile({ ...editTile, filter_type: e.target.value })}>
                      <option value="none">Nothing (just decorative)</option>
                      <option value="category">Restaurant category contains...</option>
                      <option value="discount">Has a discount (discount % &gt; 0)</option>
                      <option value="rating">Rating at least...</option>
                    </select>
                    {editTile.filter_type !== 'none' && editTile.filter_type !== 'discount' && (
                      <input style={s.input} placeholder={editTile.filter_type === 'rating' ? 'e.g. 4' : 'e.g. cafe, fine dining...'} value={editTile.filter_value} onChange={e => setEditTile({ ...editTile, filter_value: e.target.value })} />
                    )}
                    <label style={s.uploadLabel}>Sort Order (lower shows first)</label>
                    <input style={s.input} type="number" value={editTile.sort_order} onChange={e => setEditTile({ ...editTile, sort_order: e.target.value })} />
                    <label style={s.uploadLabel}>📷 Tile Photo (optional)</label>
                    <input type="file" ref={editTileImgRef} accept="image/*" style={s.fileInput} />
                    {editTile.image && <img src={editTile.image} alt="" style={s.previewImg} />}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button style={s.btnGreen} onClick={updateTile}>Save Changes</button>
                      <button style={s.btnRed} onClick={() => setEditTile(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Dineout Hero Tile</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                  These are the quick-shortcut tiles shown on the Dineout tab (e.g. "Up To 20% OFF", "Fine Dining"). Add, edit, reorder, or remove them anytime — no coding needed.
                </p>
                <label style={s.uploadLabel}>Label (use a line break for 2 lines, e.g. "Up To\n20% OFF")</label>
                <textarea style={s.textarea} placeholder="Up To&#10;20% OFF" value={tileForm.label} onChange={e => setTileForm({ ...tileForm, label: e.target.value })} />
                <div style={s.formGrid}>
                  <div>
                    <label style={s.uploadLabel}>Icon</label>
                    <select style={s.input} value={tileForm.icon} onChange={e => setTileForm({ ...tileForm, icon: e.target.value })}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.uploadLabel}>Sort Order</label>
                    <input style={s.input} type="number" placeholder="1, 2, 3..." value={tileForm.sort_order} onChange={e => setTileForm({ ...tileForm, sort_order: e.target.value })} />
                  </div>
                </div>
                <label style={s.uploadLabel}>What should tapping this tile filter by?</label>
                <select style={s.input} value={tileForm.filter_type} onChange={e => setTileForm({ ...tileForm, filter_type: e.target.value })}>
                  <option value="none">Nothing (just decorative)</option>
                  <option value="category">Restaurant category contains...</option>
                  <option value="discount">Has a discount (discount % &gt; 0)</option>
                  <option value="rating">Rating at least...</option>
                </select>
                {tileForm.filter_type !== 'none' && tileForm.filter_type !== 'discount' && (
                  <input style={s.input} placeholder={tileForm.filter_type === 'rating' ? 'e.g. 4' : 'e.g. cafe, fine dining...'} value={tileForm.filter_value} onChange={e => setTileForm({ ...tileForm, filter_value: e.target.value })} />
                )}
                <label style={s.uploadLabel}>📷 Tile Photo (optional — if added, shows behind the icon instead of plain orange)</label>
                <input type="file" ref={tileImgRef} accept="image/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addTile}>➕ Add Tile</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🍽️ Current Dineout Tiles</h3>
                {dineoutTiles.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No tiles yet — add one above!</p> : (
                  <table style={s.table}>
                    <thead><tr>{['Photo', 'Order', 'Label', 'Icon', 'Filter', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {dineoutTiles.map(t => (
                        <tr key={t.id}>
                          <td style={s.td}>{t.image ? <img src={t.image} alt="" style={s.thumbImg} /> : <span style={{ fontSize: '20px', color: '#ccc' }}>—</span>}</td>
                          <td style={s.td}>{t.sort_order}</td>
                          <td style={s.td}><strong>{t.label.replace('\n', ' ')}</strong></td>
                          <td style={s.td}><code>{t.icon}</code></td>
                          <td style={s.td}>{t.filter_type === 'none' ? '—' : t.filter_type === 'discount' ? 'Has discount' : t.filter_type === 'rating' ? `Rating ≥ ${t.filter_value}` : `Category: ${t.filter_value}`}</td>
                          <td style={s.td}><span style={{ ...s.badge2, background: t.is_active ? '#d1e7dd' : '#f8d7da', color: t.is_active ? '#0a3622' : '#842029' }}>{t.is_active ? 'Active' : 'Hidden'}</span></td>
                          <td style={s.td}>
                            <button style={s.btnConfirm} onClick={() => setEditTile(t)}>Edit</button>
                            <button style={{ ...s.btnConfirm, background: t.is_active ? '#f8d7da' : '#d1e7dd', color: t.is_active ? '#842029' : '#0a3622', marginLeft: '5px' }} onClick={() => toggleTileActive(t)}>{t.is_active ? 'Hide' : 'Show'}</button>
                            <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => deleteTile(t.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* STAYS FEATURES (Tiles) */}
          {page === 'staystiles' && (
            <div>
              {editStayTile && (
                <div style={s.modal}>
                  <div style={s.modalBox}>
                    <h3 style={s.modalTitle}>Edit Tile</h3>
                    <label style={s.uploadLabel}>Label (use a line break for 2 lines)</label>
                    <textarea style={s.textarea} value={editStayTile.label} onChange={e => setEditStayTile({ ...editStayTile, label: e.target.value })} />
                    <label style={s.uploadLabel}>Icon</label>
                    <select style={s.input} value={editStayTile.icon} onChange={e => setEditStayTile({ ...editStayTile, icon: e.target.value })}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <label style={s.uploadLabel}>What should tapping this tile filter by?</label>
                    <select style={s.input} value={editStayTile.filter_type} onChange={e => setEditStayTile({ ...editStayTile, filter_type: e.target.value })}>
                      <option value="none">Nothing (just decorative)</option>
                      <option value="type">Stay type is... (Hotel, Apartment, etc.)</option>
                      <option value="rating">Rating at least...</option>
                      <option value="budget">Price per night at or below...</option>
                      <option value="luxury">Price per night at or above...</option>
                    </select>
                    {editStayTile.filter_type !== 'none' && (
                      <input style={s.input} placeholder={editStayTile.filter_type === 'rating' ? 'e.g. 4' : editStayTile.filter_type === 'type' ? 'e.g. Hotel' : 'e.g. 2000'} value={editStayTile.filter_value} onChange={e => setEditStayTile({ ...editStayTile, filter_value: e.target.value })} />
                    )}
                    <label style={s.uploadLabel}>Sort Order (lower shows first)</label>
                    <input style={s.input} type="number" value={editStayTile.sort_order} onChange={e => setEditStayTile({ ...editStayTile, sort_order: e.target.value })} />
                    <label style={s.uploadLabel}>📷 Tile Photo (optional)</label>
                    <input type="file" ref={editStayTileImgRef} accept="image/*" style={s.fileInput} />
                    {editStayTile.image && <img src={editStayTile.image} alt="" style={s.previewImg} />}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button style={s.btnGreen} onClick={updateStayTile}>Save Changes</button>
                      <button style={s.btnRed} onClick={() => setEditStayTile(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Stays Hero Tile</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                  Quick-shortcut tiles shown on the Stays tab (e.g. "Top Rated", "Budget Stays"). Add, edit, reorder, or remove anytime — no coding needed.
                </p>
                <label style={s.uploadLabel}>Label (use a line break for 2 lines, e.g. "Top\nRated")</label>
                <textarea style={s.textarea} placeholder="Top&#10;Rated" value={stayTileForm.label} onChange={e => setStayTileForm({ ...stayTileForm, label: e.target.value })} />
                <div style={s.formGrid}>
                  <div>
                    <label style={s.uploadLabel}>Icon</label>
                    <select style={s.input} value={stayTileForm.icon} onChange={e => setStayTileForm({ ...stayTileForm, icon: e.target.value })}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.uploadLabel}>Sort Order</label>
                    <input style={s.input} type="number" placeholder="1, 2, 3..." value={stayTileForm.sort_order} onChange={e => setStayTileForm({ ...stayTileForm, sort_order: e.target.value })} />
                  </div>
                </div>
                <label style={s.uploadLabel}>What should tapping this tile filter by?</label>
                <select style={s.input} value={stayTileForm.filter_type} onChange={e => setStayTileForm({ ...stayTileForm, filter_type: e.target.value })}>
                  <option value="none">Nothing (just decorative)</option>
                  <option value="type">Stay type is... (Hotel, Apartment, etc.)</option>
                  <option value="rating">Rating at least...</option>
                  <option value="budget">Price per night at or below...</option>
                  <option value="luxury">Price per night at or above...</option>
                </select>
                {stayTileForm.filter_type !== 'none' && (
                  <input style={s.input} placeholder={stayTileForm.filter_type === 'rating' ? 'e.g. 4' : stayTileForm.filter_type === 'type' ? 'e.g. Hotel' : 'e.g. 2000'} value={stayTileForm.filter_value} onChange={e => setStayTileForm({ ...stayTileForm, filter_value: e.target.value })} />
                )}
                <label style={s.uploadLabel}>📷 Tile Photo (optional — if added, shows behind the icon instead of plain orange)</label>
                <input type="file" ref={stayTileImgRef} accept="image/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addStayTile}>➕ Add Tile</button>
              </div>

              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🏨 Current Stays Tiles</h3>
                {staysTiles.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No tiles yet — add one above!</p> : (
                  <table style={s.table}>
                    <thead><tr>{['Photo', 'Order', 'Label', 'Icon', 'Filter', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {staysTiles.map(t => (
                        <tr key={t.id}>
                          <td style={s.td}>{t.image ? <img src={t.image} alt="" style={s.thumbImg} /> : <span style={{ fontSize: '20px', color: '#ccc' }}>—</span>}</td>
                          <td style={s.td}>{t.sort_order}</td>
                          <td style={s.td}><strong>{t.label.replace('\n', ' ')}</strong></td>
                          <td style={s.td}><code>{t.icon}</code></td>
                          <td style={s.td}>{t.filter_type === 'none' ? '—' : t.filter_type === 'rating' ? `Rating ≥ ${t.filter_value}` : t.filter_type === 'type' ? `Type: ${t.filter_value}` : t.filter_type === 'budget' ? `Price ≤ ₹${t.filter_value}` : `Price ≥ ₹${t.filter_value}`}</td>
                          <td style={s.td}><span style={{ ...s.badge2, background: t.is_active ? '#d1e7dd' : '#f8d7da', color: t.is_active ? '#0a3622' : '#842029' }}>{t.is_active ? 'Active' : 'Hidden'}</span></td>
                          <td style={s.td}>
                            <button style={s.btnConfirm} onClick={() => setEditStayTile(t)}>Edit</button>
                            <button style={{ ...s.btnConfirm, background: t.is_active ? '#f8d7da' : '#d1e7dd', color: t.is_active ? '#842029' : '#0a3622', marginLeft: '5px' }} onClick={() => toggleStayTileActive(t)}>{t.is_active ? 'Hide' : 'Show'}</button>
                            <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => deleteStayTile(t.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SUPPORT TICKETS */}
          {page === 'tickets' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {['open', 'in_progress', 'resolved', 'all'].map(f => (
                  <div key={f} onClick={() => setTicketFilter(f)} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: ticketFilter === f ? '#ff6b00' : 'white', color: ticketFilter === f ? 'white' : '#555', border: '1px solid #e0e0e0', textTransform: 'capitalize' }}>
                    {f.replace('_', ' ')}
                  </div>
                ))}
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🎫 Support Tickets ({filteredTickets.length})</h3>
                {filteredTickets.length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No tickets here.</p> : (
                  filteredTickets.map(t => (
                    <div key={t.id} style={{ background: '#fafafa', borderRadius: '12px', padding: '15px', marginBottom: '10px', border: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => { setReplyModal(t); setReplyText(t.admin_reply || ''); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '14px' }}>{t.subject}</strong>
                        <span style={{ ...s.badge2, ...(t.status === 'open' ? { background: '#fce4ec', color: '#c62828' } : t.status === 'in_progress' ? { background: '#fff3cd', color: '#856404' } : { background: '#d1e7dd', color: '#0a3622' }) }}>{t.status.replace('_', ' ')}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{t.message.slice(0, 100)}{t.message.length > 100 ? '...' : ''}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{t.name} · {t.phone} · {formatDate(t.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Applications */}
          {page === 'applications' && (
            <div style={s.tableCard}>
              <h3 style={s.tableTitle}>📝 Delivery Applications</h3>
              <table style={s.table}>
                <thead><tr>{['Name', 'Father', 'Phone', 'Aadhar', 'Address', 'Bike', 'Status', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.applications.map(a => (
                    <tr key={a.id}>
                      <td style={s.td}>{a.full_name}</td><td style={s.td}>{a.father_name}</td><td style={s.td}>{a.phone}</td>
                      <td style={s.td}>{a.aadhar}</td><td style={s.td}>{a.address}</td><td style={s.td}>{a.has_bike}</td>
                      <td style={s.td}><span style={{ ...s.badge2, ...getBadge(a.status) }}>{a.status}</span></td>
                      <td style={s.td}>
                        <button style={s.btnGreen} onClick={() => { API.post('/api/application/status', { id: a.id, status: 'approved' }); loadAll(); }}>✅</button>
                        <button style={{ ...s.btnRed, marginLeft: '5px' }} onClick={() => { API.post('/api/application/status', { id: a.id, status: 'rejected' }); loadAll(); }}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Banners */}
          {page === 'banners' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>➕ Add Banner</h3>
                <input style={s.input} placeholder="Title *" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} />
                <input style={s.input} placeholder="Subtitle" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
                <input style={s.input} placeholder="Button Text (e.g. Order Now)" value={bannerForm.button_text} onChange={e => setBannerForm({ ...bannerForm, button_text: e.target.value })} />
                <input style={s.input} placeholder="Link when tapped (e.g. /order/3 or /stores)" value={bannerForm.link} onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })} />
                <div style={s.formGrid}>
                  <div>
                    <label style={s.uploadLabel}>Show on which tab?</label>
                    <select style={s.input} value={bannerForm.category} onChange={e => setBannerForm({ ...bannerForm, category: e.target.value })}>
                      <option value="food">🍔 Food Tab</option>
                      <option value="dineout">🍽️ Dineout Tab</option>
                      <option value="stays">🏨 Stays Tab</option>
                      <option value="stores">🏪 Stores Page</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.uploadLabel}>Position on page</label>
                    <select style={s.input} value={bannerForm.position} onChange={e => setBannerForm({ ...bannerForm, position: e.target.value })}>
                      <option value="top">⬆️ Top (main banner)</option>
                      <option value="middle">↕️ Middle (while scrolling)</option>
                    </select>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                  💡 Link examples: <code>/stores</code> (all stores) · <code>/order/5</code> (specific restaurant) · leave blank for no action.
                </div>
                <label style={s.uploadLabel}>🖼️ Banner Photo or Video:</label>
                <input type="file" ref={bannerFileRef} accept="image/*,video/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={addBanner}>➕ Add Banner</button>
              </div>
              <div style={s.tableCard}>
                <h3 style={s.tableTitle}>🎨 Active Banners</h3>
                {data.banners.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No banners yet — add one above!</p>}
                {data.banners.map(b => (
                  <div key={b.id} style={{ borderRadius: '12px', marginBottom: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ position: 'relative', minHeight: '140px', background: '#1a1a2e' }}>
                      {b.is_video ? (
                        <video src={b.image} muted loop autoPlay playsInline style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      ) : (
                        <img src={b.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{b.title}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{b.subtitle}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Link: {b.link || '(none)'} {b.is_video ? '· 🎥 Video' : ''} · {b.category === 'dineout' ? '🍽️ Dineout' : b.category === 'stays' ? '🏨 Stays' : '🍔 Food'} tab · {b.position === 'middle' ? '↕️ Middle' : '⬆️ Top'}</div>
                      </div>
                      <button style={{ ...s.btnRed, position: 'absolute', top: '10px', right: '10px' }} onClick={() => { API.post('/api/banners/delete', { id: b.id }); loadAll(); }}>Delete</button>
                    </div>
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
                    <option value="flat">Flat (₹)</option><option value="percent">Percent (%)</option>
                  </select>
                  <input style={s.input} placeholder="Min Order (₹)" type="number" value={couponForm.min_order} onChange={e => setCouponForm({ ...couponForm, min_order: e.target.value })} />
                </div>
                <button style={s.btnOrange} onClick={async () => { await API.post('/api/coupons/add', couponForm); setCouponForm({ code: '', discount: '', type: 'flat', min_order: 0 }); loadAll(); }}>➕ Add Coupon</button>
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
                        <td style={s.td}>{c.type}</td><td style={s.td}>₹{c.min_order}</td>
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
                <thead><tr>{['ID', 'Name', 'Email', 'Phone', 'Role', 'Referral Code', 'Wallet', 'Joined'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>#{u.id}</td><td style={s.td}>{u.name}</td><td style={s.td}>{u.email}</td><td style={s.td}>{u.phone}</td>
                      <td style={s.td}><span style={{ ...s.badge2, background: u.role === 'admin' ? '#cfe2ff' : u.role === 'delivery' ? '#ffe0b2' : '#f0f0f0', color: u.role === 'admin' ? '#084298' : u.role === 'delivery' ? '#e65100' : '#333' }}>{u.role}</span></td>
                      <td style={{ ...s.td, fontFamily: 'monospace', color: '#888' }}>{u.referral_code || '-'}</td>
                      <td style={{ ...s.td, color: '#27ae60', fontWeight: '700' }}>₹{u.wallet_balance || 0}</td>
                      <td style={s.td}>{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* APP SETTINGS */}
          {page === 'appsettings' && (
            <div>
              <div style={s.formCard}>
                <h3 style={s.tableTitle}>🍔 Food Tab — Header Banner</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Shows at the top of the Food tab, above the search bar. Leave empty to hide.</p>
                {settings.top_banner_image && (
                  <div style={{ marginBottom: '12px' }}>
                    {settings.top_banner_is_video === '1' ? (
                      <video src={settings.top_banner_image} controls muted style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    ) : (
                      <img src={settings.top_banner_image} alt="" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    )}
                    <button style={s.btnRed} onClick={() => removeTopBanner()}>Remove</button>
                  </div>
                )}
                <label style={s.uploadLabel}>📷🎥 Upload Photo or Video (video can have sound):</label>
                <input type="file" ref={topBannerRef} accept="image/*,video/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={() => uploadTopBanner()}>⬆️ Upload / Replace</button>
              </div>

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>🍽️ Dineout Tab — Header Banner</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Shows at the top of the Dineout tab. Leave empty and it'll use the Food tab's banner instead.</p>
                {settings.top_banner_image_dineout && (
                  <div style={{ marginBottom: '12px' }}>
                    {settings.top_banner_is_video_dineout === '1' ? (
                      <video src={settings.top_banner_image_dineout} controls muted style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    ) : (
                      <img src={settings.top_banner_image_dineout} alt="" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    )}
                    <button style={s.btnRed} onClick={() => removeTopBanner('dineout')}>Remove</button>
                  </div>
                )}
                <label style={s.uploadLabel}>📷🎥 Upload Photo or Video:</label>
                <input type="file" ref={dineoutBannerRef} accept="image/*,video/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={() => uploadTopBanner('dineout')}>⬆️ Upload / Replace</button>
              </div>

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>🏨 Stays Tab — Header Banner</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Shows at the top of the Stays tab. Leave empty and it'll use the Food tab's banner instead.</p>
                {settings.top_banner_image_stays && (
                  <div style={{ marginBottom: '12px' }}>
                    {settings.top_banner_is_video_stays === '1' ? (
                      <video src={settings.top_banner_image_stays} controls muted style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    ) : (
                      <img src={settings.top_banner_image_stays} alt="" style={{ width: '100%', maxWidth: '300px', borderRadius: '12px', display: 'block', marginBottom: '10px' }} />
                    )}
                    <button style={s.btnRed} onClick={() => removeTopBanner('stays')}>Remove</button>
                  </div>
                )}
                <label style={s.uploadLabel}>📷🎥 Upload Photo or Video:</label>
                <input type="file" ref={staysBannerRef} accept="image/*,video/*" style={s.fileInput} />
                <button style={s.btnOrange} onClick={() => uploadTopBanner('stays')}>⬆️ Upload / Replace</button>
              </div>

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>⚙️ General Settings</h3>
                <label style={s.uploadLabel}>App Tagline</label>
                <input style={s.input} value={settingsForm.tagline} onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })} placeholder="Ghar tak, jhatpat!" />
                <label style={s.uploadLabel}>Support Email</label>
                <input style={s.input} value={settingsForm.support_email} onChange={e => setSettingsForm({ ...settingsForm, support_email: e.target.value })} placeholder="support@zeppo.in" />
                <label style={s.uploadLabel}>Support Phone</label>
                <input style={s.input} value={settingsForm.support_phone} onChange={e => setSettingsForm({ ...settingsForm, support_phone: e.target.value })} placeholder="+91-7006XXXXXX" />
                <label style={s.uploadLabel}>WhatsApp Number (for quick support link)</label>
                <input style={s.input} value={settingsForm.whatsapp_number} onChange={e => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })} placeholder="917006XXXXXX" />

                <label style={s.uploadLabel}>🔊 Video Banners — Default Sound</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div onClick={() => setSettingsForm({ ...settingsForm, default_sound: 'muted' })} style={{ flex: 1, padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: settingsForm.default_sound !== 'sound' ? '2px solid #ff6b00' : '1px solid #e0e0e0', background: settingsForm.default_sound !== 'sound' ? '#fff3e0' : 'white', color: settingsForm.default_sound !== 'sound' ? '#e65100' : '#888' }}>🔇 Muted by default</div>
                  <div onClick={() => setSettingsForm({ ...settingsForm, default_sound: 'sound' })} style={{ flex: 1, padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '700', border: settingsForm.default_sound === 'sound' ? '2px solid #ff6b00' : '1px solid #e0e0e0', background: settingsForm.default_sound === 'sound' ? '#fff3e0' : 'white', color: settingsForm.default_sound === 'sound' ? '#e65100' : '#888' }}>🔊 Sound on by default</div>
                </div>
                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '-8px', marginBottom: '15px' }}>Customers can always tap the speaker icon to override this.</p>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settingsForm.maintenance_mode === 'on'} onChange={e => setSettingsForm({ ...settingsForm, maintenance_mode: e.target.checked ? 'on' : 'off' })} />
                  🚧 Maintenance Mode (temporarily disable ordering for customers)
                </label>

                <button style={s.btnOrange} onClick={saveAllSettings}>💾 Save All Settings</button>
              </div>

              <div style={s.formCard}>
                <h3 style={s.tableTitle}>🎉 Promotional Popup</h3>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
                  An optional popup shown once when someone opens the app (Food, Dineout, Stays, and Stores). Completely empty and off by default — fill in only what you want to say (a discount, a new item, anything). Leave it off and nothing will ever show.
                </p>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0 15px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settingsForm.promo_popup_enabled === '1'} onChange={e => setSettingsForm({ ...settingsForm, promo_popup_enabled: e.target.checked ? '1' : '0' })} />
                  Enable popup
                </label>

                <label style={s.uploadLabel}>Title (optional)</label>
                <input style={s.input} value={settingsForm.promo_popup_title} onChange={e => setSettingsForm({ ...settingsForm, promo_popup_title: e.target.value })} placeholder="e.g. Weekend Special!" />

                <label style={s.uploadLabel}>Message (optional)</label>
                <textarea style={s.textarea} value={settingsForm.promo_popup_text} onChange={e => setSettingsForm({ ...settingsForm, promo_popup_text: e.target.value })} placeholder="e.g. Flat 20% off on all Biryani orders today only!" />

                <label style={s.uploadLabel}>Button Text (optional)</label>
                <input style={s.input} value={settingsForm.promo_popup_button_text} onChange={e => setSettingsForm({ ...settingsForm, promo_popup_button_text: e.target.value })} placeholder="e.g. Order Now" />

                <label style={s.uploadLabel}>Button Link (optional — e.g. /order/3, /stores)</label>
                <input style={s.input} value={settingsForm.promo_popup_link} onChange={e => setSettingsForm({ ...settingsForm, promo_popup_link: e.target.value })} placeholder="/stores" />

                <label style={s.uploadLabel}>📷🎥 Photo or Video (optional — supports normal video or 3D/animated clips)</label>
                {settings.promo_popup_image && (
                  settings.promo_popup_is_video === '1' ? (
                    <video src={settings.promo_popup_image} controls muted style={{ width: '100%', maxWidth: '260px', borderRadius: '10px', display: 'block', marginBottom: '10px' }} />
                  ) : (
                    <img src={settings.promo_popup_image} alt="" style={{ width: '100%', maxWidth: '260px', borderRadius: '10px', display: 'block', marginBottom: '10px' }} />
                  )
                )}
                <input type="file" ref={promoImgRef} accept="image/*,video/*" style={s.fileInput} />

                <button style={s.btnOrange} onClick={saveAllSettings}>💾 Save Popup Settings</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function MenuTable({ restaurants, reload }) {
  const [menuData, setMenuData] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [editPortions, setEditPortions] = useState([]);
  const [editPortionInput, setEditPortionInput] = useState({ name: '', price: '' });

  useEffect(() => { restaurants.forEach(async r => { const res = await API.get(`/api/menu/${r.id}`); setMenuData(prev => ({ ...prev, [r.id]: res.data })); }); }, [restaurants]);

  const openEdit = (item) => { setEditItem({ ...item }); try { setEditPortions(item.portions ? JSON.parse(item.portions) : []); } catch { setEditPortions([]); } };
  const addEditPortion = () => { if (!editPortionInput.name || !editPortionInput.price) return; setEditPortions([...editPortions, { name: editPortionInput.name, price: parseInt(editPortionInput.price) }]); setEditPortionInput({ name: '', price: '' }); };
  const removeEditPortion = (i) => setEditPortions(editPortions.filter((_, idx) => idx !== i));

  const saveEdit = async () => {
    const basePrice = editPortions.length > 0 ? editPortions[0].price : parseInt(editItem.price);
    await API.post('/api/menu/update', { id: editItem.id, name: editItem.name, price: basePrice, original_price: editItem.original_price || null, portions: editPortions.length > 0 ? editPortions : null, description: editItem.description, image: editItem.image, is_available: editItem.is_available, is_featured: editItem.is_featured });
    setEditItem(null);
    reload();
  };

  const reloadMenu = () => { restaurants.forEach(async r => { const res = await API.get(`/api/menu/${r.id}`); setMenuData(prev => ({ ...prev, [r.id]: res.data })); }); reload(); };

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
              {editPortions.length > 0 && (<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{editPortions.map((p, i) => <div key={i} style={s.portionChip}>{p.name} — ₹{p.price} <span style={{ cursor: 'pointer', color: '#e74c3c', marginLeft: '6px' }} onClick={() => removeEditPortion(i)}>✕</span></div>)}</div>)}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', fontSize: '14px' }}>
              <input type="checkbox" checked={editItem.is_available === 1} onChange={e => setEditItem({ ...editItem, is_available: e.target.checked ? 1 : 0 })} /> Available (uncheck for "Out of Stock")
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', fontSize: '14px' }}>
              <input type="checkbox" checked={editItem.is_featured === 1} onChange={e => setEditItem({ ...editItem, is_featured: e.target.checked ? 1 : 0 })} /> 🔥 Show in "Trending Dishes" on Home page
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
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b00', marginBottom: '10px', padding: '8px 0', borderBottom: '2px solid #ff6b00' }}>{r.emoji} {r.name}</div>
          {(menuData[r.id] || []).length === 0 ? <p style={{ color: '#aaa', fontSize: '14px' }}>No items yet</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Image', 'Category', 'Item', 'Price', 'Status', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#888', borderBottom: '1px solid #f0f0f0' }}>{h}</th>)}</tr></thead>
              <tbody>
                {(menuData[r.id] || []).map(item => {
                  let itemPortions = [];
                  try { itemPortions = item.portions ? JSON.parse(item.portions) : []; } catch {}
                  return (
                    <tr key={item.id}>
                      <td style={{ padding: '8px' }}>{item.image ? <img src={item.image} alt="" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>🍽️</span>}</td>
                      <td style={{ padding: '8px', fontSize: '13px' }}>{item.category}</td>
                      <td style={{ padding: '8px', fontSize: '13px' }}><strong>{item.name}</strong><div style={{ fontSize: '12px', color: '#888' }}>{item.description}</div></td>
                      <td style={{ padding: '8px', fontSize: '13px' }}>
                        {itemPortions.length > 0 ? itemPortions.map((p, i) => <div key={i}>{p.name}: ₹{p.price}</div>) :
                          item.original_price ? (<><span style={{ color: '#aaa', textDecoration: 'line-through', marginRight: '6px' }}>₹{item.original_price}</span><span style={{ color: '#ff6b00', fontWeight: '700' }}>₹{item.price}</span></>) :
                            <span style={{ color: '#ff6b00', fontWeight: '700' }}>₹{item.price}</span>}
                      </td>
                      <td style={{ padding: '8px' }}><span style={{ ...s.badge2, background: item.is_available ? '#d1e7dd' : '#f8d7da', color: item.is_available ? '#0a3622' : '#842029' }}>{item.is_available ? 'Available' : 'Out of Stock'}</span></td>
                      <td style={{ padding: '8px' }}>
                        <button style={s.btnConfirm} onClick={() => openEdit(item)}>Edit</button>
                        <button style={{ ...s.btnConfirm, marginLeft: '5px', background: item.is_available ? '#f8d7da' : '#d1e7dd', color: item.is_available ? '#842029' : '#0a3622' }} onClick={() => { API.post('/api/menu/toggle', { id: item.id, is_available: item.is_available ? 0 : 1 }); reloadMenu(); }}>{item.is_available ? 'Mark Out' : 'Mark In'}</button>
                        <button style={{ ...s.btnConfirm, marginLeft: '5px', background: item.is_featured ? '#fff3e0' : '#f0f0f0', color: item.is_featured ? '#e65100' : '#666' }} onClick={() => { API.post('/api/menu/toggle-featured', { id: item.id, is_featured: item.is_featured ? 0 : 1 }); reloadMenu(); }}>{item.is_featured ? '🔥 Trending' : 'Mark Trending'}</button>
                        <button style={{ background: '#f8d7da', color: '#842029', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }} onClick={() => { API.post('/api/menu/delete', { id: item.id }); reloadMenu(); }}>Delete</button>
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
    pending: { background: '#fff3cd', color: '#856404' }, confirmed: { background: '#cfe2ff', color: '#084298' },
    preparing: { background: '#e2d9f3', color: '#6f42c1' }, on_the_way: { background: '#ffd700', color: '#333' },
    delivered: { background: '#d1e7dd', color: '#0a3622' }, cancelled: { background: '#f8d7da', color: '#842029' },
    approved: { background: '#d1e7dd', color: '#0a3622' }, rejected: { background: '#f8d7da', color: '#842029' },
  };
  return colors[status] || { background: '#f0f0f0', color: '#333' };
}

const s = {
  container: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  sidebar: { width: '240px', background: '#1a1a2e', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, overflowY: 'auto' },
  sidebarLogo: { padding: '20px', borderBottom: '1px solid #2d2d44' },
  logoText: { color: '#ff6b00', fontSize: '22px', fontWeight: '700' },
  logoSub: { color: '#aaa', fontSize: '12px', marginTop: '3px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: '#aaa', cursor: 'pointer', fontSize: '14px', position: 'relative' },
  menuActive: { background: '#ff6b00', color: 'white', borderRadius: '0 25px 25px 0', marginRight: '15px' },
  menuIcon: { fontSize: '18px', width: '24px' },
  sideBadge: { position: 'absolute', right: '25px', background: 'red', color: 'white', borderRadius: '10px', fontSize: '10px', padding: '2px 7px', fontWeight: '700' },
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
  statValue: { fontSize: '22px', fontWeight: '700', color: '#333' },
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
