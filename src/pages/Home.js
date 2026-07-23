import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import API from '../api';

const FoodIcon = ({ color = 'white', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 10h16a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M5 14l1 6h12l1-6" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M12 10c0-3 2-5 2-7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const DineIcon = ({ color = 'white', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2v8a3 3 0 0 1-3 3M18 2v20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const StayIcon = ({ color = 'white', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SearchIconSvg = ({ color = '#aaa', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>
);

export default function Home() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('food');
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeMiddleBanner, setActiveMiddleBanner] = useState(0);
  const [activeDineoutBanner, setActiveDineoutBanner] = useState(0);
  const [activeStaysBanner, setActiveStaysBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [vegMode, setVegMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [bookModal, setBookModal] = useState(null);
  const [vegModalOpen, setVegModalOpen] = useState(false);
  const [vegModalChoice, setVegModalChoice] = useState('all');
  const [settings, setSettings] = useState({});
  const [topBannerMuted, setTopBannerMuted] = useState(true);
  const [soundInitDone, setSoundInitDone] = useState(false);

  // Stays state
  const [stays, setStays] = useState([]);
  const [staysLoading, setStaysLoading] = useState(true);
  const [stayBookModal, setStayBookModal] = useState(null);
  const [stayBookForm, setStayBookForm] = useState({ customer_name: '', customer_phone: '', check_in: '', check_out: '', guests: 1 });
  const [stayBookSent, setStayBookSent] = useState(false);

  const role = localStorage.getItem('role');
  const location = localStorage.getItem('location') || 'Kupwara';
  const locationSub = localStorage.getItem('locationSub') || 'Jammu & Kashmir';
  const token = localStorage.getItem('token');

  const isVeg = (item) => item.is_veg === 1 || item.is_veg === undefined;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [restRes, orderRes, bannerRes, settingsRes] = await Promise.all([
        API.get('/api/restaurants'),
        API.get('/api/my-orders', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/api/banners'),
        API.get('/api/settings'),
      ]);
      const rests = restRes.data;
      setRestaurants(rests);
      setRecentOrders(orderRes.data.slice(0, 3));
      setBanners(bannerRes.data);
      setSettings(settingsRes.data);
      if (!soundInitDone) {
        setTopBannerMuted(settingsRes.data.default_sound !== 'sound');
        setSoundInitDone(true);
      }
      const allItems = [];
      for (const r of rests) {
        try {
          const menuRes = await API.get(`/api/menu/${r.id}`);
          menuRes.data.forEach(item => allItems.push({ ...item, restaurant_name: r.name, restaurant_id: r.id, restaurant_emoji: r.emoji }));
        } catch(e) {}
      }
      setMenuItems(allItems);
      setFilteredItems(allItems);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  const loadStays = useCallback(async () => {
    try {
      setStaysLoading(true);
      const res = await API.get('/api/stays');
      setStays(res.data);
    } catch(e) { console.error(e); }
    finally { setStaysLoading(false); }
  }, []);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, [token, loadData, navigate]);

  useEffect(() => {
    if (activeTab === 'stays' && stays.length === 0) loadStays();
  }, [activeTab, stays.length, loadStays]);

  const foodTopBanners = banners.filter(b => (b.category || 'food') === 'food' && (b.position || 'top') === 'top');
  const foodMiddleBanners = banners.filter(b => (b.category || 'food') === 'food' && b.position === 'middle');
  const dineoutTopBanners = banners.filter(b => b.category === 'dineout' && (b.position || 'top') === 'top');
  const dineoutMiddleBanners = banners.filter(b => b.category === 'dineout' && b.position === 'middle');
  const staysTopBanners = banners.filter(b => b.category === 'stays' && (b.position || 'top') === 'top');
  const staysMiddleBanners = banners.filter(b => b.category === 'stays' && b.position === 'middle');

  useEffect(() => {
    if (foodTopBanners.length <= 1) return;
    const t = setInterval(() => setActiveBanner(p => (p + 1) % foodTopBanners.length), 4500);
    return () => clearInterval(t);
  }, [foodTopBanners.length]);

  useEffect(() => {
    if (foodMiddleBanners.length <= 1) return;
    const t = setInterval(() => setActiveMiddleBanner(p => (p + 1) % foodMiddleBanners.length), 5000);
    return () => clearInterval(t);
  }, [foodMiddleBanners.length]);

  useEffect(() => {
    if (dineoutTopBanners.length <= 1) return;
    const t = setInterval(() => setActiveDineoutBanner(p => (p + 1) % dineoutTopBanners.length), 4500);
    return () => clearInterval(t);
  }, [dineoutTopBanners.length]);

  useEffect(() => {
    if (staysTopBanners.length <= 1) return;
    const t = setInterval(() => setActiveStaysBanner(p => (p + 1) % staysTopBanners.length), 4500);
    return () => clearInterval(t);
  }, [staysTopBanners.length]);

  useEffect(() => {
    let items = menuItems;
    if (search) {
      items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()) || i.restaurant_name.toLowerCase().includes(search.toLowerCase()));
    } else if (activeCategory !== 'All') {
      items = items.filter(i => i.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (vegMode) items = items.filter(isVeg);
    setFilteredItems(items);
  }, [vegMode, menuItems]);

  const handleSearch = (q) => {
    setSearch(q);
    let items = menuItems;
    if (q) {
      const ql = q.toLowerCase();
      items = items.filter(i => {
        const hay = `${i.name} ${i.category} ${i.restaurant_name}`.toLowerCase();
        return ql.split(' ').every(word => word === '' || hay.includes(word));
      });
    }
    if (vegMode) items = items.filter(isVeg);
    setFilteredItems(items);
  };

  const filterByCategory = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    setShowSearch(false);
    let items = cat === 'All' ? menuItems : menuItems.filter(i => i.category.toLowerCase().includes(cat.toLowerCase()));
    if (vegMode) items = items.filter(isVeg);
    setFilteredItems(items);
  };

  const openVegModal = () => { setVegModalChoice(vegMode ? 'veg' : 'all'); setVegModalOpen(true); };
  const applyVegModal = () => { setVegMode(vegModalChoice === 'veg'); setVegModalOpen(false); };

  const displayedRestaurants = vegMode ? restaurants.filter(r => menuItems.some(i => i.restaurant_id === r.id && isVeg(i))) : restaurants;

  const statusColors = { pending: '#f39c12', confirmed: '#3498db', preparing: '#9b59b6', on_the_way: '#e67e22', delivered: '#27ae60' };

  const categories = [
    { img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&h=200&fit=crop&q=80', emoji: '🍽️', name: 'All' },
    { img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop&q=80', emoji: '🍚', name: 'Biryani' },
    { img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop&q=80', emoji: '🍲', name: 'Gravy' },
    { img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop&q=80', emoji: '🔥', name: 'Tandoori' },
    { img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&h=200&fit=crop&q=80', emoji: '🍢', name: 'Tikka' },
    { img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&q=80', emoji: '🍕', name: 'Pizza' },
    { img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80', emoji: '🍔', name: 'Burger' },
    { img: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=200&h=200&fit=crop&q=80', emoji: '🥤', name: 'Drinks' },
    { img: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&h=200&fit=crop&q=80', emoji: '🍗', name: 'Fast Food' },
    { img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop&q=80', emoji: '🍰', name: 'Desserts' },
  ];

  const moreOnZeppo = [
    { emoji: '🎟️', title: 'Coupons', sub: 'Save more', bg: 'linear-gradient(135deg,#6B1B3A,#4A0F2A)', action: () => navigate('/stores') },
    { emoji: '🛵', title: 'Delivery Partner', sub: 'Join & earn', bg: 'linear-gradient(135deg,#1a1a6e,#0d0d4a)', action: () => navigate('/delivery-signup') },
    { emoji: '📦', title: 'Track Order', sub: 'Live status', bg: 'linear-gradient(135deg,#1B4332,#0a2a1e)', action: () => navigate('/track') },
    { emoji: '🏪', title: 'All Stores', sub: 'Explore', bg: 'linear-gradient(135deg,#7c2d12,#431407)', action: () => navigate('/stores') },
  ];

  const renderBannerCarousel = (list, active) => {
    if (list.length === 0) return null;
    const b = list[active % list.length];
    return (
      <div style={s.bigBanner}>
        <div key={b.id} style={s.bannerSlide}>
          {b.is_video ? <video src={b.image} autoPlay muted loop playsInline style={s.bannerMedia} /> : <img src={b.image} alt={b.title} style={s.bannerMedia} />}
          <div style={s.bannerOverlay} />
          <div style={s.bannerTextBox}>
            <div style={s.bigBannerTag}>⚡ EXCLUSIVE</div>
            <div style={s.bigBannerTitle}>{b.title}</div>
            <div style={s.bigBannerSub}>{b.subtitle}</div>
            <div style={s.bigBannerBtn} onClick={(e) => { e.stopPropagation(); if (b.link) navigate(b.link); }}>{b.button_text || 'ORDER NOW'}</div>
          </div>
        </div>
      </div>
    );
  };

  const openStayBook = (stay) => {
    setStayBookModal(stay);
    setStayBookForm({ customer_name: localStorage.getItem('name') || '', customer_phone: '', check_in: '', check_out: '', guests: 1 });
    setStayBookSent(false);
  };

  const submitStayBooking = async () => {
    const { customer_name, customer_phone, check_in, check_out, guests } = stayBookForm;
    if (!customer_name || !customer_phone || !check_in || !check_out) { alert('Please fill all fields!'); return; }
    try {
      const token = localStorage.getItem('token');
      await API.post('/api/stays/book', {
        stay_id: stayBookModal.id, stay_name: stayBookModal.name,
        customer_name, customer_phone, check_in, check_out, guests
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setStayBookSent(true);
    } catch (e) { alert('Error sending booking request!'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a0a0f', flexDirection: 'column', gap: '18px' }}>
      <style>{`@keyframes zeppoSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#ff6b00', fontWeight: '800', fontSize: '24px', letterSpacing: '4px' }}>ZEPPO</div>
      <div style={{ width: '34px', height: '34px', border: '3px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'zeppoSpin 0.8s linear infinite' }} />
    </div>
  );

  // ===== FULL-SCREEN SEARCH =====
  if (showSearch) {
    return (
      <div style={s.searchPage}>
        <div style={s.searchTopBar}>
          <button style={s.searchBackBtn} onClick={() => { setShowSearch(false); setSearch(''); handleSearch(''); }}>←</button>
          <div style={s.searchInputWrap}>
            <SearchIconSvg />
            <input autoFocus style={s.searchTopInput} placeholder="Search for dishes & restaurants" value={search} onChange={e => handleSearch(e.target.value)} />
            {search && <span style={{ cursor: 'pointer', color: '#aaa', fontSize: '14px' }} onClick={() => handleSearch('')}>✕</span>}
          </div>
        </div>
        <div style={s.searchBody}>
          {!search ? (
            <>
              <div style={s.searchSectionLabel}>Popular Categories</div>
              <div style={s.searchCatGrid}>
                {categories.filter(c => c.name !== 'All').map(cat => (
                  <div key={cat.name} style={s.searchCatCard} onClick={() => { setSearch(cat.name); handleSearch(cat.name); }}>
                    <img src={cat.img} alt={cat.name} style={s.searchCatImg} onError={e => { e.target.outerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;background:#f5f5f5;">${cat.emoji}</div>`; }} />
                    <div style={s.searchCatName}>{cat.name}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={s.searchSectionLabel}>{filteredItems.length} results for "{search}"</div>
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}><div style={{ fontSize: '45px', marginBottom: '12px' }}>😔</div><p style={{ color: '#888' }}>No dishes found for "{search}"</p></div>
              ) : (
                <div style={s.searchResultsGrid}>
                  {filteredItems.map((item, i) => (
                    <div key={i} style={s.searchResultCard} onClick={() => navigate(`/order/${item.restaurant_id}`)}>
                      <div style={s.searchResultImg}>{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <div style={{ fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{item.restaurant_emoji || '🍽️'}</div>}</div>
                      <div style={{ padding: '10px 12px', flex: 1 }}>
                        <div style={s.vegDotBadge(isVeg(item))} />
                        <div style={s.searchResultName}>{item.name}</div>
                        <div style={s.searchResultRest}>{item.restaurant_name}</div>
                        <div style={s.searchResultPrice}>₹{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== STAYS TAB =====
  if (activeTab === 'stays') {
    return (
      <div style={s.container}>
        <style>{`@keyframes fadeBanner { from { opacity: 0; } to { opacity: 1; } }`}</style>
        {stayBookModal && (
          <div style={s.bookModalOverlay} onClick={() => setStayBookModal(null)}>
            <div style={s.stayBookBox} onClick={e => e.stopPropagation()}>
              {stayBookSent ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '44px', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#222', marginBottom: '6px' }}>Request Sent!</div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>We'll confirm your booking at {stayBookModal.name} soon. You may also get a call for confirmation.</div>
                  <button style={s.closeBookBtn} onClick={() => setStayBookModal(null)}>Close</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#222', marginBottom: '4px' }}>Book {stayBookModal.name}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>₹{stayBookModal.price_per_night}/night · {stayBookModal.address}</div>
                  <input style={s.input} placeholder="Your Name *" value={stayBookForm.customer_name} onChange={e => setStayBookForm({ ...stayBookForm, customer_name: e.target.value })} />
                  <input style={s.input} placeholder="Phone Number *" value={stayBookForm.customer_phone} onChange={e => setStayBookForm({ ...stayBookForm, customer_phone: e.target.value })} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={s.smallLabel}>Check-in</label>
                      <input style={s.input} type="date" value={stayBookForm.check_in} onChange={e => setStayBookForm({ ...stayBookForm, check_in: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={s.smallLabel}>Check-out</label>
                      <input style={s.input} type="date" value={stayBookForm.check_out} onChange={e => setStayBookForm({ ...stayBookForm, check_out: e.target.value })} />
                    </div>
                  </div>
                  <label style={s.smallLabel}>Guests</label>
                  <input style={s.input} type="number" min="1" value={stayBookForm.guests} onChange={e => setStayBookForm({ ...stayBookForm, guests: e.target.value })} />
                  <button style={s.stayBookBtn} onClick={submitStayBooking}>Send Booking Request</button>
                  <button style={s.closeBookBtn} onClick={() => setStayBookModal(null)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        )}

        <div style={s.topBrandWrap}>
          {settings.top_banner_image && (
            settings.top_banner_is_video === '1' ? (
              <video src={settings.top_banner_image} autoPlay loop playsInline muted={topBannerMuted} style={s.topBrandBg} />
            ) : (
              <img src={settings.top_banner_image} alt="ZEPPO" style={s.topBrandBg} />
            )
          )}
          {settings.top_banner_image && <div style={s.topBrandOverlay} />}
          {settings.top_banner_image && settings.top_banner_is_video === '1' && (
            <button style={s.soundToggleBtn} onClick={() => setTopBannerMuted(m => !m)}>{topBannerMuted ? '🔇' : '🔊'}</button>
          )}
          <div style={s.header}>
            <div style={s.headerLeft} onClick={() => navigate('/location')}>
              <div style={s.locationRow}><span style={s.locationName}>{location}</span><span style={s.locationArrow}>›</span></div>
              <div style={s.locationSub}>{locationSub}</div>
            </div>
          </div>
          <div style={s.tabs}>
            <div style={s.tab} onClick={() => setActiveTab('food')}><FoodIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Food</span></div>
            <div style={s.tab} onClick={() => setActiveTab('dineout')}><DineIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Dineout</span></div>
            <div style={{ ...s.tab, ...s.tabActive }}><StayIcon color="white" /><span style={{ ...s.tabLabel, color: 'white' }}>Stays</span></div>
          </div>
        </div>

        <div style={s.whiteSection}>
          {staysTopBanners.length > 0 && (
            <div style={{ padding: '16px 16px 5px' }}>
              {renderBannerCarousel(staysTopBanners, activeStaysBanner)}
              {staysTopBanners.length > 1 && <div style={s.bannerDots}>{staysTopBanners.map((_, i) => <div key={i} style={{ ...s.dot, background: i === activeStaysBanner ? '#ff6b00' : '#ddd', width: i === activeStaysBanner ? '18px' : '6px' }} onClick={() => setActiveStaysBanner(i)} />)}</div>}
            </div>
          )}
          <div style={s.section}>
            <div style={s.sectionTitle}>🏨 Hotels & Rooms in {location}</div>
            <div style={s.sectionSub}>Coming to town? Book a place to stay</div>
            {staysLoading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>Loading...</div>
            ) : stays.length === 0 ? (
              <div style={s.noRest}><div style={{ fontSize: '50px', marginBottom: '10px' }}>🏨</div><p style={{ color: '#888' }}>No stays listed yet — check back soon!</p></div>
            ) : (
              stays.map((st, idx) => {
                let imgs = [];
                try { imgs = st.images ? JSON.parse(st.images) : []; } catch {}
                let amenities = st.amenities ? st.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
                return (
                  <React.Fragment key={st.id}>
                    <div style={s.stayCard} onClick={() => openStayBook(st)}>
                      <div style={s.stayImgBox}>
                        {imgs[0] ? <img src={imgs[0]} alt={st.name} style={s.stayImg} /> : <div style={s.stayImgFallback}>🏨</div>}
                        <div style={s.stayTypeBadge}>{st.type}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={s.restName}>{st.name}</div>
                        <div style={s.restMetaRow}><span style={s.ratingBadge}>⭐ {st.rating}</span><span style={s.metaDot}>•</span><span style={s.timeText}>{st.type}</span></div>
                        <div style={s.restAddr}>📍 {st.address}</div>
                        {amenities.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                            {amenities.slice(0, 3).map((a, i) => <span key={i} style={s.amenityChip}>{a}</span>)}
                          </div>
                        )}
                        <div style={s.stayPriceRow}>
                          <span style={s.stayPrice}>₹{st.price_per_night}<span style={{ fontSize: '11px', fontWeight: '500', color: '#888' }}>/night</span></span>
                          <span style={s.bookNowText}>Book Now →</span>
                        </div>
                      </div>
                    </div>
                    {idx === 1 && staysMiddleBanners.length > 0 && <div style={{ margin: '15px 0' }}>{renderBannerCarousel(staysMiddleBanners, 0)}</div>}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
        <BottomNav navigate={navigate} active="home" cartCount={cartCount} onHome={() => setActiveTab('food')} />
      </div>
    );
  }

  // ===== DINEOUT TAB =====
  if (activeTab === 'dineout') {
    return (
      <div style={s.container}>
        <style>{`@keyframes fadeBanner { from { opacity: 0; } to { opacity: 1; } }`}</style>
        {bookModal && (
          <div style={s.bookModalOverlay} onClick={() => setBookModal(null)}>
            <div style={s.bookModalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍽️</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#222', marginBottom: '6px' }}>Book a Table at {bookModal.name}</div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>Table booking is launching soon! Call the restaurant directly to reserve for now.</div>
              {bookModal.phone && <a href={`tel:${bookModal.phone}`} style={s.callBtn}>📞 Call {bookModal.phone}</a>}
              <button style={s.closeBookBtn} onClick={() => setBookModal(null)}>Close</button>
            </div>
          </div>
        )}
        <div style={s.topBrandWrap}>
          {settings.top_banner_image && (
            settings.top_banner_is_video === '1' ? (
              <video src={settings.top_banner_image} autoPlay loop playsInline muted={topBannerMuted} style={s.topBrandBg} />
            ) : (
              <img src={settings.top_banner_image} alt="ZEPPO" style={s.topBrandBg} />
            )
          )}
          {settings.top_banner_image && <div style={s.topBrandOverlay} />}
          {settings.top_banner_image && settings.top_banner_is_video === '1' && (
            <button style={s.soundToggleBtn} onClick={() => setTopBannerMuted(m => !m)}>{topBannerMuted ? '🔇' : '🔊'}</button>
          )}
          <div style={s.header}>
            <div style={s.headerLeft} onClick={() => navigate('/location')}>
              <div style={s.locationRow}><span style={s.locationName}>{location}</span><span style={s.locationArrow}>›</span></div>
              <div style={s.locationSub}>{locationSub}</div>
            </div>
          </div>
          <div style={s.tabs}>
            <div style={s.tab} onClick={() => setActiveTab('food')}><FoodIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Food</span></div>
            <div style={{ ...s.tab, ...s.tabActive }}><DineIcon color="white" /><span style={{ ...s.tabLabel, color: 'white' }}>Dineout</span></div>
            <div style={s.tab} onClick={() => setActiveTab('stays')}><StayIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Stays</span></div>
          </div>
        </div>
        <div style={s.whiteSection}>
          {dineoutTopBanners.length > 0 && (
            <div style={{ padding: '16px 16px 5px' }}>
              {renderBannerCarousel(dineoutTopBanners, activeDineoutBanner)}
              {dineoutTopBanners.length > 1 && <div style={s.bannerDots}>{dineoutTopBanners.map((_, i) => <div key={i} style={{ ...s.dot, background: i === activeDineoutBanner ? '#ff6b00' : '#ddd', width: i === activeDineoutBanner ? '18px' : '6px' }} onClick={() => setActiveDineoutBanner(i)} />)}</div>}
            </div>
          )}
          <div style={s.section}>
            <div style={s.sectionTitle}>🍽️ Restaurants Near You</div>
            <div style={s.sectionSub}>Book a table & enjoy dine-in experience</div>
            {restaurants.length === 0 ? (
              <div style={s.noRest}><div style={{ fontSize: '50px', marginBottom: '10px' }}>😔</div><p style={{ color: '#888' }}>No restaurants available for dine-in yet</p></div>
            ) : (
              restaurants.map((r, idx) => (
                <React.Fragment key={r.id}>
                  <div style={s.dineoutCard} onClick={() => setBookModal(r)}>
                    <div style={s.dineoutCardImgBox}>
                      {r.image ? <img src={r.image} alt={r.name} style={s.dineoutCardImg} /> : <div style={s.dineoutCardEmoji}>{r.emoji}</div>}
                      <div style={s.dineoutBadge}>🍽️ Dine-In</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.restName}>{r.name}</div>
                      <div style={s.restMetaRow}><span style={s.ratingBadge}>⭐ {r.rating}</span><span style={s.metaDot}>•</span><span style={s.timeText}>{r.category}</span></div>
                      <div style={s.restAddr}>📍 {r.address}</div>
                      <div style={s.bookNowText}>Book a Table →</div>
                    </div>
                  </div>
                  {idx === 1 && dineoutMiddleBanners.length > 0 && <div style={{ margin: '15px 0' }}>{renderBannerCarousel(dineoutMiddleBanners, 0)}</div>}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
        <BottomNav navigate={navigate} active="home" cartCount={cartCount} onHome={() => setActiveTab('food')} />
      </div>
    );
  }

  // ===== FOOD TAB (default) =====
  return (
    <div style={s.container}>
      <style>{`@keyframes fadeBanner { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {vegModalOpen && (
        <div style={s.vegModalOverlay} onClick={() => setVegModalOpen(false)}>
          <div style={s.vegModalBox} onClick={e => e.stopPropagation()}>
            <div style={s.vegModalHeader}>
              <div style={s.vegModalTitle}>I want to see<br/>veg choices from</div>
              <span style={{ fontSize: '30px' }}>🥗</span>
            </div>
            <div style={s.vegModalDivider} />
            <div style={s.vegModalOption} onClick={() => setVegModalChoice('all')}>
              <span style={s.vegModalOptionText}>All restaurants</span>
              <div style={{ ...s.radioOuterGreen, borderColor: vegModalChoice === 'all' ? '#27ae60' : '#ccc' }}>{vegModalChoice === 'all' && <div style={s.radioInnerGreen} />}</div>
            </div>
            <div style={s.vegModalOption} onClick={() => setVegModalChoice('veg')}>
              <span style={s.vegModalOptionText}>Pure veg restaurants only</span>
              <div style={{ ...s.radioOuterGreen, borderColor: vegModalChoice === 'veg' ? '#27ae60' : '#ccc' }}>{vegModalChoice === 'veg' && <div style={s.radioInnerGreen} />}</div>
            </div>
            <button style={s.vegModalBtn} onClick={applyVegModal}>Show restaurants</button>
          </div>
        </div>
      )}

      {/* Top branding banner — now full background behind header/tabs/search */}
      <div style={s.topBrandWrap}>
        {settings.top_banner_image && (
          settings.top_banner_is_video === '1' ? (
            <video src={settings.top_banner_image} autoPlay loop playsInline muted={topBannerMuted} style={s.topBrandBg} />
          ) : (
            <img src={settings.top_banner_image} alt="ZEPPO" style={s.topBrandBg} />
          )
        )}
        {settings.top_banner_image && <div style={s.topBrandOverlay} />}
        {settings.top_banner_image && settings.top_banner_is_video === '1' && (
          <button style={s.soundToggleBtn} onClick={() => setTopBannerMuted(m => !m)}>{topBannerMuted ? '🔇' : '🔊'}</button>
        )}

        <div style={s.header}>
          <div style={s.headerLeft} onClick={() => navigate('/location')}>
            <div style={s.locationRow}><span style={s.locationName}>{location.length > 18 ? location.slice(0, 18) + '...' : location}</span><span style={s.locationArrow}>›</span></div>
            <div style={s.locationSub}>{locationSub.length > 30 ? locationSub.slice(0, 30) + '...' : locationSub}</div>
          </div>
          <div style={s.headerRight}>
            {role === 'admin' && <div style={s.adminBtn} onClick={() => navigate('/admin')}>Admin</div>}
            <div style={s.menuBtn} onClick={() => navigate('/profile')}><div style={s.menuLine} /><div style={s.menuLine} /><div style={s.menuLine} /></div>
          </div>
        </div>

        <div style={s.tabs}>
          <div style={{ ...s.tab, ...s.tabActive }}><FoodIcon color="white" /><span style={{ ...s.tabLabel, color: 'white' }}>Food</span></div>
          <div style={s.tab} onClick={() => setActiveTab('dineout')}><DineIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Dineout</span></div>
          <div style={s.tab} onClick={() => setActiveTab('stays')}><StayIcon color="#888" /><span style={{ ...s.tabLabel, color: '#888' }}>Stays</span></div>
        </div>

        <div style={s.searchWrap}>
          <div style={s.searchBox} onClick={() => setShowSearch(true)}>
            <SearchIconSvg color="#aaa" />
            <div style={s.searchInputFake}>Search for food...</div>
          </div>
          <div style={s.vegToggle} onClick={openVegModal}>
            <div style={s.vegLabel}>VEG</div>
            <div style={{ ...s.vegSwitch, background: vegMode ? '#27ae60' : '#555' }}><div style={{ ...s.vegDot, left: vegMode ? '14px' : '2px' }} /></div>
          </div>
        </div>
      </div>

      {foodTopBanners.length > 0 && (
        <div style={s.bigBannerWrap}>
          {renderBannerCarousel(foodTopBanners, activeBanner)}
          {foodTopBanners.length > 1 && <div style={s.bannerDots}>{foodTopBanners.map((_, i) => <div key={i} style={{ ...s.dot, background: i === activeBanner ? '#ff6b00' : '#ddd', width: i === activeBanner ? '20px' : '6px' }} onClick={() => setActiveBanner(i)} />)}</div>}
        </div>
      )}

      <div style={s.whiteSection}>
        <div style={s.section}>
          <div style={s.sectionTitle}>What's on your mind?</div>
          <div style={s.categories}>
            {categories.map(cat => (
              <div key={cat.name} style={s.category} onClick={() => filterByCategory(cat.name)}>
                <div style={{ ...s.catCircle, border: activeCategory === cat.name ? '2.5px solid #ff6b00' : '2.5px solid transparent' }}>
                  <img src={cat.img} alt={cat.name} style={s.catImg} onError={e => { e.target.outerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px;background:#f5f5f5;">${cat.emoji}</div>`; }} />
                </div>
                <div style={{ ...s.catName, color: activeCategory === cat.name ? '#ff6b00' : '#444', fontWeight: activeCategory === cat.name ? '700' : '500' }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </div>

        {foodMiddleBanners.length > 0 && (
          <div style={{ padding: '10px 16px' }}>
            {renderBannerCarousel(foodMiddleBanners, activeMiddleBanner)}
            {foodMiddleBanners.length > 1 && <div style={s.bannerDots}>{foodMiddleBanners.map((_, i) => <div key={i} style={{ ...s.dot, background: i === activeMiddleBanner ? '#ff6b00' : '#ddd', width: i === activeMiddleBanner ? '18px' : '6px' }} onClick={() => setActiveMiddleBanner(i)} />)}</div>}
          </div>
        )}

        <div style={s.section}>
          <div style={s.sectionTitle}>More on ZEPPO</div>
          <div style={s.moreGrid}>
            {moreOnZeppo.map(m => (
              <div key={m.title} style={{ ...s.moreTile, background: m.bg }} onClick={m.action}><div style={s.moreEmoji}>{m.emoji}</div><div style={s.moreTitle}>{m.title}</div><div style={s.moreSub}>{m.sub}</div></div>
            ))}
          </div>
        </div>

        {recentOrders.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionRow}><div style={s.sectionTitle}>📦 Recent Orders</div><div style={s.seeAll} onClick={() => navigate('/track')}>See all →</div></div>
            <div style={s.hScroll}>
              {recentOrders.map(order => (
                <div key={order.id} style={s.orderCard} onClick={() => navigate('/track')}>
                  <div style={s.orderRestName}>{order.restaurant_name}</div>
                  <div style={s.orderItemsText}>{(() => { try { return JSON.parse(order.items).slice(0, 2).map(i => i.name).join(', '); } catch { return ''; } })()}</div>
                  <div style={s.orderFooter}><span style={{ ...s.orderBadge, background: statusColors[order.status] || '#888' }}>{order.status}</span><span style={s.orderAmt}>₹{order.total}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionRow}><div style={s.sectionTitle}>{activeCategory === 'All' ? '🔥 Trending dishes near you' : `🍽️ ${activeCategory}`}</div><div style={s.seeAll}>{filteredItems.length} items</div></div>
            <div style={s.hScroll}>
              {filteredItems.slice(0, 15).map((item, i) => (
                <div key={i} style={s.foodCard} onClick={() => navigate(`/order/${item.restaurant_id}`)}>
                  <div style={s.foodImgBox}>
                    {item.image ? <img src={item.image} alt={item.name} style={s.foodImg} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                    <div style={{ ...s.foodEmojiBox, display: item.image ? 'none' : 'flex' }}>{item.restaurant_emoji || '🍽️'}</div>
                    <div style={s.addBtn}>+</div>
                  </div>
                  <div style={s.foodInfo}>
                    <div style={s.vegDotBadge(isVeg(item))} />
                    <div style={s.foodName}>{item.name}</div>
                    <div style={s.foodRestName}>{item.restaurant_name}</div>
                    <div style={s.foodPriceRow}>{item.original_price ? (<><span style={s.foodPriceOld}>₹{item.original_price}</span><span style={s.foodPrice}>₹{item.price}</span></>) : <span style={s.foodPrice}>₹{item.price}</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={s.priceFilters}>{['₹99 & under', '₹100 - ₹149', 'Rated 4.0+'].map(f => <div key={f} style={s.priceChip}>{f}</div>)}</div>

        <div style={s.section}>
          <div style={s.sectionRow}><div style={s.sectionTitle}>🏪 Top {displayedRestaurants.length} restaurants to explore</div></div>
          <div style={s.sectionSub}>Featured Restaurants</div>
          {displayedRestaurants.length === 0 ? (
            <div style={s.noRest}><div style={{ fontSize: '50px', marginBottom: '10px' }}>😔</div><p style={{ color: '#888' }}>No stores yet!</p></div>
          ) : (
            displayedRestaurants.map(r => (
              <div key={r.id} style={{ ...s.restCard, opacity: r.is_open === 0 ? 0.6 : 1 }} onClick={() => navigate(`/order/${r.id}`)}>
                <div style={s.restCardInner}>
                  <div style={s.restThumb}>
                    {r.image ? <img src={r.image} alt={r.name} style={s.restThumbImg} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                    <div style={{ ...s.restThumbEmoji, display: r.image ? 'none' : 'flex' }}>{r.emoji || '🍽️'}</div>
                    {r.is_open === 0 && <div style={s.closedBadge}>CLOSED</div>}
                    <div style={s.offerBadge}>ITEMS AT ₹99</div>
                  </div>
                  <div style={s.restInfoSide}>
                    <div style={s.restName}>{r.name}</div>
                    <div style={s.restMetaRow}><span style={s.ratingBadge}>⭐ {r.rating}</span><span style={s.metaDot}>•</span><span style={s.timeText}>30-40 min</span></div>
                    <div style={s.restCatText}>{r.category}</div>
                    {r.description && <div style={s.restDesc}>{r.description}</div>}
                    <div style={s.restAddr}>📍 {r.address}</div>
                    <div style={s.freeDelivery}>🎉 Free delivery</div>
                  </div>
                  <div style={s.heartBtn}>🤍</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={s.partnerCard}>
          <div><div style={s.partnerTitle}>🛵 Become a Delivery Partner!</div><div style={s.partnerSub}>Work near home • Earn daily</div></div>
          <button style={s.partnerBtn} onClick={() => navigate('/delivery-signup')}>Apply</button>
        </div>
      </div>

      <BottomNav navigate={navigate} active="home" cartCount={cartCount} />
    </div>
  );
}

function BottomNav({ navigate, active, cartCount, onHome }) {
  return (
    <div style={s.bottomNav}>
      <div style={{ ...s.navItem, color: active === 'home' ? '#ff6b00' : '#888' }} onClick={() => onHome ? onHome() : navigate('/')}><span style={s.navIcon}>🏠</span><span>Home</span></div>
      <div style={{ ...s.navItem, color: active === 'stores' ? '#ff6b00' : '#888' }} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
      <div style={{ ...s.navItem, color: active === 'cart' ? '#ff6b00' : '#888', position: 'relative' }} onClick={() => navigate('/cart')}><span style={s.navIcon}>🛒</span><span>Cart</span>{cartCount > 0 && <span style={s.navCartBadge}>{cartCount}</span>}</div>
      <div style={{ ...s.navItem, color: active === 'orders' ? '#ff6b00' : '#888' }} onClick={() => navigate('/track')}><span style={s.navIcon}>📦</span><span>Orders</span></div>
      <div style={{ ...s.navItem, color: active === 'profile' ? '#ff6b00' : '#888' }} onClick={() => navigate('/profile')}><span style={s.navIcon}>👤</span><span>Profile</span></div>
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#1a0a0f', paddingBottom: '70px' },
  topBrandWrap: { position: 'relative', overflow: 'hidden', paddingBottom: '15px' },
  topBrandBg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  topBrandOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,10,15,0.65) 0%, rgba(26,10,15,0.8) 60%, #1a0a0f 100%)', zIndex: 1 },
  soundToggleBtn: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', width: '28px', height: '28px', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  header: { padding: '50px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 },
  headerLeft: { cursor: 'pointer', flex: 1 },
  locationRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  locationName: { fontSize: '18px', fontWeight: '700', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.6)' },
  locationArrow: { fontSize: '18px', color: 'white' },
  locationSub: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  adminBtn: { background: '#ff6b00', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  menuBtn: { display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', justifyContent: 'center', alignItems: 'center' },
  menuLine: { width: '18px', height: '2px', background: 'white', borderRadius: '2px' },
  tabs: { display: 'flex', margin: '0 16px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', padding: '4px', position: 'relative', zIndex: 2 },
  tab: { flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRadius: '25px' },
  tabActive: { background: 'rgba(255,255,255,0.15)' },
  tabLabel: { fontSize: '11px', fontWeight: '600', textShadow: '0 1px 3px rgba(0,0,0,0.5)' },
  searchWrap: { margin: '0 16px 0', display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', zIndex: 2 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '12px', padding: '12px 15px', cursor: 'pointer' },
  searchInputFake: { flex: 1, fontSize: '14px', color: '#999' },
  vegToggle: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer' },
  vegLabel: { fontSize: '10px', fontWeight: '700', color: '#333' },
  vegSwitch: { width: '32px', height: '18px', borderRadius: '9px', position: 'relative', transition: '0.3s' },
  vegDot: { position: 'absolute', width: '14px', height: '14px', background: 'white', borderRadius: '50%', top: '2px', transition: '0.3s' },
  vegDotBadge: (veg) => ({ width: '13px', height: '13px', border: `1.5px solid ${veg ? '#27ae60' : '#e74c3c'}`, borderRadius: '3px', position: 'relative', marginBottom: '4px', display: 'inline-block' }),

  vegModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 800 },
  vegModalBox: { background: 'white', width: '100%', maxWidth: '480px', borderRadius: '20px 20px 0 0', padding: '24px' },
  vegModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' },
  vegModalTitle: { fontSize: '22px', fontWeight: '800', color: '#222', lineHeight: '1.25' },
  vegModalDivider: { height: '1px', background: '#eee', marginBottom: '16px' },
  vegModalOption: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' },
  vegModalOptionText: { fontSize: '16px', color: '#222' },
  radioOuterGreen: { width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioInnerGreen: { width: '12px', height: '12px', borderRadius: '50%', background: '#27ae60' },
  vegModalBtn: { width: '100%', background: '#27ae60', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '18px' },

  searchPage: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'white' },
  searchTopBar: { display: 'flex', alignItems: 'center', gap: '10px', padding: '50px 16px 15px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: 'white', zIndex: 10 },
  searchBackBtn: { background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', flexShrink: 0 },
  searchInputWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', borderRadius: '12px', padding: '12px 15px' },
  searchTopInput: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '15px', color: '#222' },
  searchBody: { padding: '18px 16px' },
  searchSectionLabel: { fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '15px' },
  searchCatGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  searchCatCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  searchCatImg: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' },
  searchCatName: { fontSize: '11px', color: '#444', textAlign: 'center' },
  searchResultsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  searchResultCard: { display: 'flex', background: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  searchResultImg: { width: '80px', height: '80px', background: 'linear-gradient(135deg,#ff6b00,#e05a00)', flexShrink: 0, overflow: 'hidden' },
  searchResultName: { fontSize: '14px', fontWeight: '700', color: '#222' },
  searchResultRest: { fontSize: '12px', color: '#888', margin: '3px 0' },
  searchResultPrice: { fontSize: '13px', fontWeight: '700', color: '#ff6b00' },

  bigBannerWrap: { margin: '0 16px 5px' },
  bigBanner: { borderRadius: '18px', overflow: 'hidden', marginBottom: '10px', minHeight: '160px', position: 'relative', background: '#1a1a2e' },
  bannerSlide: { position: 'relative', minHeight: '160px', animation: 'fadeBanner 0.4s ease' },
  bannerMedia: { width: '100%', height: '160px', objectFit: 'cover', display: 'block' },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.6))' },
  bannerTextBox: { position: 'absolute', inset: 0, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' },
  bigBannerTag: { fontSize: '10px', color: 'rgba(255,255,255,0.85)', letterSpacing: '2px', marginBottom: '6px', fontWeight: '700' },
  bigBannerTitle: { fontSize: '21px', fontWeight: '800', color: 'white', marginBottom: '4px', lineHeight: '1.2', textShadow: '0 2px 8px rgba(0,0,0,0.4)' },
  bigBannerSub: { fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px' },
  bigBannerBtn: { background: 'white', color: '#333', padding: '8px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', width: 'fit-content', cursor: 'pointer' },
  bannerDots: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '5px' },
  dot: { height: '6px', borderRadius: '3px', cursor: 'pointer', transition: '0.3s' },

  whiteSection: { background: '#f7f7f7', borderRadius: '20px 20px 0 0', marginTop: '10px', minHeight: '60vh' },
  section: { padding: '20px 16px 5px' },
  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#222' },
  sectionSub: { fontSize: '13px', color: '#888', marginBottom: '15px' },
  seeAll: { fontSize: '13px', color: '#ff6b00', fontWeight: '600', cursor: 'pointer' },
  categories: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
  category: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer', minWidth: '68px' },
  catCircle: { width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: '0.2s' },
  catImg: { width: '100%', height: '100%', objectFit: 'cover' },
  catName: { fontSize: '11px', textAlign: 'center', transition: '0.2s' },

  moreGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' },
  moreTile: { borderRadius: '14px', padding: '14px 8px', textAlign: 'center', cursor: 'pointer', color: 'white' },
  moreEmoji: { fontSize: '24px', marginBottom: '6px' },
  moreTitle: { fontSize: '11px', fontWeight: '700', lineHeight: '1.2' },
  moreSub: { fontSize: '9px', opacity: 0.8, marginTop: '2px' },

  hScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', paddingTop: '10px', scrollbarWidth: 'none' },
  orderCard: { background: 'white', borderRadius: '12px', padding: '14px', minWidth: '180px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', cursor: 'pointer', flexShrink: 0 },
  orderRestName: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '5px' },
  orderItemsText: { fontSize: '12px', color: '#888', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderBadge: { color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' },
  orderAmt: { fontSize: '13px', fontWeight: '700', color: '#ff6b00' },
  foodCard: { background: 'white', borderRadius: '14px', overflow: 'hidden', minWidth: '150px', flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.08)', cursor: 'pointer', border: '1px solid #f0f0f0' },
  foodImgBox: { height: '110px', background: 'linear-gradient(135deg, #ff6b00, #e05a00)', position: 'relative', overflow: 'hidden' },
  foodImg: { width: '100%', height: '100%', objectFit: 'cover' },
  foodEmojiBox: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px' },
  addBtn: { position: 'absolute', bottom: '8px', right: '8px', background: 'white', color: '#ff6b00', width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
  foodInfo: { padding: '10px' },
  foodName: { fontSize: '13px', fontWeight: '700', color: '#222', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '125px' },
  foodRestName: { fontSize: '11px', color: '#888', marginBottom: '5px' },
  foodPriceRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  foodPriceOld: { fontSize: '11px', color: '#aaa', textDecoration: 'line-through' },
  foodPrice: { fontSize: '13px', fontWeight: '700', color: '#222', background: '#ffd700', padding: '1px 6px', borderRadius: '4px' },
  priceFilters: { display: 'flex', gap: '8px', padding: '15px 16px 5px', overflowX: 'auto', scrollbarWidth: 'none' },
  priceChip: { background: 'white', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', flexShrink: 0 },
  noRest: { textAlign: 'center', padding: '40px 20px' },
  restCard: { background: 'white', borderRadius: '16px', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', cursor: 'pointer' },
  restCardInner: { display: 'flex', gap: '12px', padding: '12px', position: 'relative' },
  restThumb: { width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg, #ff6b00, #e05a00)' },
  restThumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  restThumbEmoji: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  closedBadge: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700' },
  offerBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '9px', fontWeight: '700', padding: '4px 6px', textAlign: 'center' },
  restInfoSide: { flex: 1 },
  restName: { fontSize: '16px', fontWeight: '700', color: '#222', marginBottom: '5px' },
  restMetaRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  ratingBadge: { background: '#27ae60', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' },
  metaDot: { color: '#ddd' },
  timeText: { fontSize: '12px', color: '#666' },
  restCatText: { fontSize: '12px', color: '#888', marginBottom: '3px' },
  restDesc: { fontSize: '11px', color: '#aaa', marginBottom: '3px', fontStyle: 'italic' },
  restAddr: { fontSize: '11px', color: '#aaa', marginBottom: '3px' },
  freeDelivery: { fontSize: '11px', color: '#ff6b00', fontWeight: '600' },
  heartBtn: { position: 'absolute', top: '10px', right: '10px', fontSize: '18px', cursor: 'pointer' },
  partnerCard: { margin: '10px 16px 20px', background: 'white', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  partnerTitle: { fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  partnerSub: { fontSize: '12px', color: '#888' },
  partnerBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', fontSize: '11px', position: 'relative' },
  navIcon: { fontSize: '22px' },
  navCartBadge: { position: 'absolute', top: '2px', right: '18px', background: '#27ae60', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },

  dineoutCard: { background: 'white', borderRadius: '14px', padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  dineoutCardImgBox: { width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg,#ff6b00,#e05a00)' },
  dineoutCardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  dineoutCardEmoji: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' },
  dineoutBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '9px', fontWeight: '700', padding: '3px', textAlign: 'center' },
  bookNowText: { fontSize: '12px', color: '#ff6b00', fontWeight: '700', marginTop: '6px' },

  stayCard: { background: 'white', borderRadius: '14px', padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  stayImgBox: { width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg,#1a1a6e,#0d0d4a)' },
  stayImg: { width: '100%', height: '100%', objectFit: 'cover' },
  stayImgFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' },
  stayTypeBadge: { position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  amenityChip: { fontSize: '10px', background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px' },
  stayPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  stayPrice: { fontSize: '15px', fontWeight: '800', color: '#222' },

  bookModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  bookModalBox: { background: 'white', borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '360px', textAlign: 'center' },
  callBtn: { display: 'block', background: '#27ae60', color: 'white', padding: '13px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', marginBottom: '10px' },
  closeBookBtn: { width: '100%', padding: '12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '12px', fontSize: '14px', cursor: 'pointer' },

  stayBookBox: { background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '380px' },
  smallLabel: { display: 'block', fontSize: '12px', color: '#888', marginBottom: '5px', fontWeight: '600' },
  stayBookBtn: { width: '100%', background: '#ff6b00', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', margin: '10px 0' },
};
