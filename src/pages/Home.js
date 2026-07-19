import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const NONVEG_KEYWORDS = ['chicken', 'mutton', 'egg', 'fish', 'meat', 'prawn', 'beef', 'lamb', 'keema'];

export default function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('food');
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [vegMode, setVegMode] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [showSearch, setShowSearch] = useState(false);

  const role = localStorage.getItem('role');
  const location = localStorage.getItem('location') || 'Kupwara';
  const locationSub = localStorage.getItem('locationSub') || 'Jammu & Kashmir';
  const token = localStorage.getItem('token');

  const isVeg = (item) => !NONVEG_KEYWORDS.some(k =>
    (item.name || '').toLowerCase().includes(k) || (item.category || '').toLowerCase().includes(k)
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [restRes, orderRes, bannerRes] = await Promise.all([
        API.get('/api/restaurants'),
        API.get('/api/my-orders', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/api/banners'),
      ]);

      const rests = restRes.data;
      setRestaurants(rests);
      setRecentOrders(orderRes.data.slice(0, 3));
      setBanners(bannerRes.data.length > 0 ? bannerRes.data : [
        { id: 1, title: 'ZEPPO REWARDS', subtitle: 'Free delivery on first order!', button_text: 'ORDER NOW' },
        { id: 2, title: 'DISHES FROM ₹49', subtitle: 'Price Crash!', button_text: 'ORDER NOW' },
        { id: 3, title: 'FOOD IN 30 MINS', subtitle: 'Fast delivery guaranteed', button_text: 'ORDER NOW' },
      ]);

      const allItems = [];
      for (const r of rests) {
        try {
          const menuRes = await API.get(`/api/menu/${r.id}`);
          menuRes.data.forEach(item => allItems.push({
            ...item,
            restaurant_name: r.name,
            restaurant_id: r.id,
            restaurant_emoji: r.emoji,
          }));
        } catch(e) {}
      }
      setMenuItems(allItems);
      setFilteredItems(allItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, [token, loadData, navigate]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    let items = menuItems;
    if (search) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase()) ||
        i.restaurant_name.toLowerCase().includes(search.toLowerCase())
      );
    } else if (activeCategory !== 'All') {
      items = items.filter(i => i.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (vegMode) items = items.filter(isVeg);
    setFilteredItems(items);
  }, [vegMode, menuItems]);

  const handleSearch = (q) => {
    setSearch(q);
    setActiveCategory('All');
    setShowSearch(!!q);
    let items = menuItems;
    if (q) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        i.category.toLowerCase().includes(q.toLowerCase()) ||
        i.restaurant_name.toLowerCase().includes(q.toLowerCase())
      );
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

  const displayedRestaurants = vegMode
    ? restaurants.filter(r => menuItems.some(i => i.restaurant_id === r.id && isVeg(i)))
    : restaurants;

  const statusColors = {
    pending: '#f39c12', confirmed: '#3498db',
    preparing: '#9b59b6', on_the_way: '#e67e22', delivered: '#27ae60'
  };

  const bannerColors = [
    ['#6B1B3A', '#4A0F2A'],
    ['#1a1a6e', '#0d0d4a'],
    ['#1B4332', '#0a2a1e'],
  ];

  const categories = [
    { emoji: '🍽️', name: 'All' },
    { emoji: '🍚', name: 'Biryani' },
    { emoji: '🍲', name: 'Gravy' },
    { emoji: '🔥', name: 'Tandoori' },
    { emoji: '🍢', name: 'Tikka' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🥤', name: 'Drinks' },
    { emoji: '🍗', name: 'Fast Food' },
    { emoji: '🍰', name: 'Desserts' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a0a0f', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '60px' }}>⚡</div>
      <div style={{ color: '#ff6b00', fontWeight: '700', fontSize: '20px', letterSpacing: '3px' }}>ZEPPO</div>
      <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
    </div>
  );

  if (activeTab === 'dineout') {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerLeft} onClick={() => navigate('/location')}>
            <div style={s.locationRow}>
              <span style={s.locationName}>{location}</span>
              <span style={s.locationArrow}>›</span>
            </div>
            <div style={s.locationSub}>{locationSub}</div>
          </div>
        </div>
        <div style={s.tabs}>
          {[{ key: 'food', emoji: '🍔', label: 'Food' }, { key: 'dineout', emoji: '🍽️', label: 'Dineout' }].map(tab => (
            <div key={tab.key} style={{ ...s.tab, ...(activeTab === tab.key ? s.tabActive : {}) }} onClick={() => setActiveTab(tab.key)}>
              <span style={s.tabEmoji}>{tab.emoji}</span>
              <span style={{ ...s.tabLabel, color: activeTab === tab.key ? 'white' : '#888' }}>{tab.label}</span>
            </div>
          ))}
        </div>
        <div style={s.dineoutBox}>
          <div style={{ fontSize: '70px', marginBottom: '15px' }}>🍽️</div>
          <h2 style={s.dineoutTitle}>Dineout Coming Soon!</h2>
          <p style={s.dineoutText}>Book tables at your favorite Kupwara restaurants — launching soon on ZEPPO 🎉</p>
          <button style={s.dineoutBtn} onClick={() => setActiveTab('food')}>Back to Food →</button>
        </div>
        <div style={s.bottomNav}>
          <div style={{ ...s.navItem, color: '#ff6b00' }} onClick={() => setActiveTab('food')}>
            <span style={s.navIcon}>🏠</span><span>Home</span>
          </div>
          <div style={s.navItem} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
          <div style={s.navItem} onClick={() => navigate('/track')}><span style={s.navIcon}>📦</span><span>Orders</span></div>
          <div style={s.navItem} onClick={() => navigate('/profile')}><span style={s.navIcon}>👤</span><span>Profile</span></div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>

      <div style={s.header}>
        <div style={s.headerLeft} onClick={() => navigate('/location')}>
          <div style={s.locationRow}>
            <span style={s.locationName}>{location.length > 18 ? location.slice(0, 18) + '...' : location}</span>
            <span style={s.locationArrow}>›</span>
          </div>
          <div style={s.locationSub}>{locationSub.length > 30 ? locationSub.slice(0, 30) + '...' : locationSub}</div>
        </div>
        <div style={s.headerRight}>
          {role === 'admin' && <div style={s.adminBtn} onClick={() => navigate('/admin')}>Admin</div>}
          <div style={s.menuBtn} onClick={() => navigate('/profile')}>
            <div style={s.menuLine} />
            <div style={s.menuLine} />
            <div style={s.menuLine} />
          </div>
        </div>
      </div>

      <div style={s.tabs}>
        {[{ key: 'food', emoji: '🍔', label: 'Food' }, { key: 'dineout', emoji: '🍽️', label: 'Dineout' }].map(tab => (
          <div key={tab.key} style={{ ...s.tab, ...(activeTab === tab.key ? s.tabActive : {}) }} onClick={() => setActiveTab(tab.key)}>
            <span style={s.tabEmoji}>{tab.emoji}</span>
            <span style={{ ...s.tabLabel, color: activeTab === tab.key ? 'white' : '#888' }}>{tab.label}</span>
          </div>
        ))}
      </div>

      <div style={s.searchWrap}>
        <div style={s.searchBox}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search for food..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && <span style={s.clearSearchBtn} onClick={() => handleSearch('')}>✕</span>}
        </div>
        <div style={s.vegToggle} onClick={() => setVegMode(!vegMode)}>
          <div style={s.vegLabel}>VEG</div>
          <div style={{ ...s.vegSwitch, background: vegMode ? '#27ae60' : '#555' }}>
            <div style={{ ...s.vegDot, left: vegMode ? '14px' : '2px' }} />
          </div>
        </div>
      </div>

      {showSearch && (
        <div style={s.searchResults}>
          <div style={s.searchResultsHeader}>
            <div style={s.searchResultsTitle}>
              🔍 Results for "{search}" — {filteredItems.length} items
            </div>
            <div style={s.closeSearch} onClick={() => handleSearch('')}>✕ Close</div>
          </div>
          {filteredItems.length === 0 ? (
            <div style={s.noResult}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>😔</div>
              <p style={{ color: '#888' }}>No food found for "{search}"</p>
            </div>
          ) : (
            <div style={s.searchGrid}>
              {filteredItems.map((item, i) => (
                <div key={i} style={s.searchFoodCard} onClick={() => navigate(`/order/${item.restaurant_id}`)}>
                  <div style={s.searchFoodImg}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ fontSize: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {item.restaurant_emoji || '🍽️'}
                      </div>
                    )}
                  </div>
                  <div style={s.searchFoodInfo}>
                    <div style={s.vegDotBadge(isVeg(item))} />
                    <div style={s.searchFoodName}>{item.name}</div>
                    <div style={s.searchFoodRest}>{item.restaurant_name}</div>
                    <div style={s.searchFoodPrice}>₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={s.searchStoresTitle}>🏪 All Stores</div>
          {displayedRestaurants.map(r => (
            <div key={r.id} style={s.searchStoreCard}
              onClick={() => navigate(`/order/${r.id}`)}>
              <div style={s.searchStoreThumb}>
                {r.image ? (
                  <img src={r.image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{r.emoji || '🍽️'}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.searchStoreName}>{r.name}</div>
                <div style={s.searchStoreMeta}>⭐ {r.rating} • 30-40 min • {r.category}</div>
                <div style={{ fontSize: '11px', color: '#ff6b00', fontWeight: '600' }}>🎉 Free delivery</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showSearch && (
        <>
          <div style={s.bigBannerWrap}>
            <div style={{ ...s.bigBanner, background: `linear-gradient(135deg, ${bannerColors[activeBanner % bannerColors.length][0]}, ${bannerColors[activeBanner % bannerColors.length][1]})` }}>
              <div style={s.bigBannerContent}>
                <div style={s.bigBannerTag}>⚡ EXCLUSIVE</div>
                <div style={s.bigBannerTitle}>{banners[activeBanner]?.title}</div>
                <div style={s.bigBannerSub}>{banners[activeBanner]?.subtitle}</div>
                <div style={s.bigBannerBtn}>{banners[activeBanner]?.button_text || 'ORDER NOW'}</div>
              </div>
              <div style={s.bigBannerEmoji}>🎟️</div>
            </div>
            <div style={s.miniBanners}>
              <div style={{ ...s.miniBanner, background: 'linear-gradient(135deg, #6B1B3A, #4A0F2A)' }}>
                <div style={s.miniBannerBadge}>PRICE CRASH</div>
                <div style={s.miniBannerTitle}>Dishes From ₹49</div>
                <div style={s.miniBannerSub}>💥 Limited Time</div>
              </div>
              <div style={{ ...s.miniBanner, background: 'linear-gradient(135deg, #1a1a6e, #0d0d4a)' }}>
                <div style={s.miniBannerBadge}>99 STORE</div>
                <div style={s.miniBannerTitle}>Meals At ₹99</div>
                <div style={s.miniBannerSub}>🎉 Free Delivery</div>
              </div>
              <div style={{ ...s.miniBanner, background: 'linear-gradient(135deg, #1B4332, #0a2a1e)' }}>
                <div style={s.miniBannerBadge}>BOLT</div>
                <div style={s.miniBannerTitle}>Food In 30 Min</div>
                <div style={s.miniBannerSub}>⚡ Fast Delivery</div>
              </div>
            </div>
            <div style={s.bannerDots}>
              {banners.map((_, i) => (
                <div key={i} style={{ ...s.dot, background: i === activeBanner ? '#ff6b00' : 'rgba(255,255,255,0.3)', width: i === activeBanner ? '20px' : '6px' }} onClick={() => setActiveBanner(i)} />
              ))}
            </div>
          </div>

          <div style={s.whiteSection}>

            <div style={s.section}>
              <div style={s.sectionTitle}>What's on your mind?</div>
              <div style={s.categories}>
                {categories.map(cat => (
                  <div key={cat.name} style={s.category} onClick={() => filterByCategory(cat.name)}>
                    <div style={{ ...s.catCircle, border: activeCategory === cat.name ? '2.5px solid #ff6b00' : '2.5px solid transparent', background: activeCategory === cat.name ? 'linear-gradient(135deg, #fff3e0, #ffe0cc)' : 'linear-gradient(135deg, #f9f9f9, #f0f0f0)', boxShadow: activeCategory === cat.name ? '0 4px 12px rgba(255,107,0,0.25)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                      {cat.emoji}
                    </div>
                    <div style={{ ...s.catName, color: activeCategory === cat.name ? '#ff6b00' : '#444', fontWeight: activeCategory === cat.name ? '700' : '500' }}>{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {recentOrders.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionRow}>
                  <div style={s.sectionTitle}>📦 Recent Orders</div>
                  <div style={s.seeAll} onClick={() => navigate('/track')}>See all →</div>
                </div>
                <div style={s.hScroll}>
                  {recentOrders.map(order => (
                    <div key={order.id} style={s.orderCard} onClick={() => navigate('/track')}>
                      <div style={s.orderRestName}>{order.restaurant_name}</div>
                      <div style={s.orderItemsText}>
                        {(() => { try { return JSON.parse(order.items).slice(0, 2).map(i => i.name).join(', '); } catch { return ''; } })()}
                      </div>
                      <div style={s.orderFooter}>
                        <span style={{ ...s.orderBadge, background: statusColors[order.status] || '#888' }}>{order.status}</span>
                        <span style={s.orderAmt}>₹{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredItems.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionRow}>
                  <div style={s.sectionTitle}>
                    {activeCategory === 'All' ? '🔥 Trending dishes near you' : `🍽️ ${activeCategory}`}
                  </div>
                  <div style={s.seeAll}>{filteredItems.length} items</div>
                </div>
                <div style={s.hScroll}>
                  {filteredItems.slice(0, 15).map((item, i) => (
                    <div key={i} style={s.foodCard} onClick={() => navigate(`/order/${item.restaurant_id}`)}>
                      <div style={s.foodImgBox}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={s.foodImg}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div style={{ ...s.foodEmojiBox, display: item.image ? 'none' : 'flex' }}>
                          {item.restaurant_emoji || '🍽️'}
                        </div>
                        <div style={s.addBtn}>+</div>
                      </div>
                      <div style={s.foodInfo}>
                        <div style={s.vegDotBadge(isVeg(item))} />
                        <div style={s.foodName}>{item.name}</div>
                        <div style={s.foodRestName}>{item.restaurant_name}</div>
                        <div style={s.foodPriceRow}>
                          {item.original_price ? (
                            <>
                              <span style={s.foodPriceOld}>₹{item.original_price}</span>
                              <span style={s.foodPrice}>₹{item.price}</span>
                            </>
                          ) : (
                            <span style={s.foodPrice}>₹{item.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={s.priceFilters}>
              {['₹99 & under', '₹100 - ₹149', 'Rated 4.0+'].map(f => (
                <div key={f} style={s.priceChip}>{f}</div>
              ))}
            </div>

            <div style={s.section}>
              <div style={s.sectionRow}>
                <div style={s.sectionTitle}>🏪 Top {displayedRestaurants.length} restaurants to explore</div>
              </div>
              <div style={s.sectionSub}>Featured Restaurants</div>
              {displayedRestaurants.length === 0 ? (
                <div style={s.noRest}>
                  <div style={{ fontSize: '50px', marginBottom: '10px' }}>😔</div>
                  <p style={{ color: '#888' }}>No stores yet!</p>
                </div>
              ) : (
                displayedRestaurants.map(r => (
                  <div key={r.id} style={{ ...s.restCard, opacity: r.is_open === 0 ? 0.6 : 1 }}
                    onClick={() => navigate(`/order/${r.id}`)}>
                    <div style={s.restCardInner}>
                      <div style={s.restThumb}>
                        {r.image ? (
                          <img src={r.image} alt={r.name} style={s.restThumbImg}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div style={{ ...s.restThumbEmoji, display: r.image ? 'none' : 'flex' }}>{r.emoji || '🍽️'}</div>
                        {r.is_open === 0 && <div style={s.closedBadge}>CLOSED</div>}
                        <div style={s.offerBadge}>ITEMS AT ₹99</div>
                      </div>
                      <div style={s.restInfoSide}>
                        <div style={s.restName}>{r.name}</div>
                        <div style={s.restMetaRow}>
                          <span style={s.ratingBadge}>⭐ {r.rating}</span>
                          <span style={s.metaDot}>•</span>
                          <span style={s.timeText}>30-40 min</span>
                        </div>
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
              <div>
                <div style={s.partnerTitle}>🛵 Become a Delivery Partner!</div>
                <div style={s.partnerSub}>Work near home • Earn daily</div>
              </div>
              <button style={s.partnerBtn} onClick={() => navigate('/delivery-signup')}>Apply</button>
            </div>

          </div>
        </>
      )}

      <div style={s.bottomNav}>
        <div style={{ ...s.navItem, color: activeNav === 'home' ? '#ff6b00' : '#888' }}
          onClick={() => { setActiveNav('home'); setShowSearch(false); setSearch(''); setVegMode(false); setFilteredItems(menuItems); }}>
          <span style={s.navIcon}>🏠</span>
          <span>Home</span>
        </div>
        <div style={{ ...s.navItem, color: activeNav === 'stores' ? '#ff6b00' : '#888' }}
          onClick={() => { setActiveNav('stores'); navigate('/stores'); }}>
          <span style={s.navIcon}>🏪</span>
          <span>Stores</span>
        </div>
        <div style={{ ...s.navItem, color: activeNav === 'orders' ? '#ff6b00' : '#888' }}
          onClick={() => { setActiveNav('orders'); navigate('/track'); }}>
          <span style={s.navIcon}>📦</span>
          <span>Orders</span>
        </div>
        <div style={{ ...s.navItem, color: activeNav === 'profile' ? '#ff6b00' : '#888' }}
          onClick={() => { setActiveNav('profile'); navigate('/profile'); }}>
          <span style={s.navIcon}>👤</span>
          <span>Profile</span>
        </div>
      </div>

    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#1a0a0f', paddingBottom: '70px' },
  header: { padding: '50px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { cursor: 'pointer', flex: 1 },
  locationRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  locationName: { fontSize: '18px', fontWeight: '700', color: 'white' },
  locationArrow: { fontSize: '18px', color: 'white' },
  locationSub: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  adminBtn: { background: '#ff6b00', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  menuBtn: { display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', justifyContent: 'center', alignItems: 'center' },
  menuLine: { width: '18px', height: '2px', background: 'white', borderRadius: '2px' },
  tabs: { display: 'flex', margin: '0 16px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', padding: '4px' },
  tab: { flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderRadius: '25px' },
  tabActive: { background: 'rgba(255,255,255,0.15)' },
  tabEmoji: { fontSize: '20px' },
  tabLabel: { fontSize: '12px', fontWeight: '600' },
  searchWrap: { margin: '0 16px 15px', display: 'flex', gap: '10px', alignItems: 'center' },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '12px', padding: '12px 15px' },
  searchIcon: { fontSize: '15px', color: '#aaa', flexShrink: 0 },
  searchInput: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14px', color: '#222' },
  clearSearchBtn: { fontSize: '13px', color: '#aaa', cursor: 'pointer' },
  vegToggle: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer' },
  vegLabel: { fontSize: '10px', fontWeight: '700', color: '#333' },
  vegSwitch: { width: '32px', height: '18px', borderRadius: '9px', position: 'relative', transition: '0.3s' },
  vegDot: { position: 'absolute', width: '14px', height: '14px', background: 'white', borderRadius: '50%', top: '2px', transition: '0.3s' },
  vegDotBadge: (veg) => ({ width: '13px', height: '13px', border: `1.5px solid ${veg ? '#27ae60' : '#e74c3c'}`, borderRadius: '3px', position: 'relative', marginBottom: '4px', display: 'inline-block' }),

  dineoutBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 30px', background: '#f7f7f7', borderRadius: '20px 20px 0 0', marginTop: '10px', minHeight: '60vh' },
  dineoutTitle: { fontSize: '22px', fontWeight: '800', color: '#222', marginBottom: '10px' },
  dineoutText: { fontSize: '14px', color: '#888', lineHeight: '1.6', marginBottom: '25px' },
  dineoutBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '13px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },

  searchResults: { background: '#f7f7f7', minHeight: '100vh', padding: '15px 16px' },
  searchResultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  searchResultsTitle: { fontSize: '14px', fontWeight: '700', color: '#222' },
  closeSearch: { fontSize: '13px', color: '#ff6b00', fontWeight: '600', cursor: 'pointer' },
  noResult: { textAlign: 'center', padding: '30px 0' },
  searchGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  searchFoodCard: { background: 'white', borderRadius: '12px', display: 'flex', gap: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', cursor: 'pointer' },
  searchFoodImg: { width: '80px', height: '80px', background: 'linear-gradient(135deg, #ff6b00, #e05a00)', flexShrink: 0, overflow: 'hidden' },
  searchFoodInfo: { padding: '12px 12px 12px 0', flex: 1 },
  searchFoodName: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '3px' },
  searchFoodRest: { fontSize: '12px', color: '#888', marginBottom: '5px' },
  searchFoodPrice: { fontSize: '14px', fontWeight: '700', color: '#ff6b00' },
  searchStoresTitle: { fontSize: '16px', fontWeight: '700', color: '#222', marginBottom: '12px', marginTop: '5px' },
  searchStoreCard: { background: 'white', borderRadius: '12px', display: 'flex', gap: '12px', padding: '12px', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', cursor: 'pointer', alignItems: 'center' },
  searchStoreThumb: { width: '60px', height: '60px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff6b00, #e05a00)', flexShrink: 0, overflow: 'hidden' },
  searchStoreName: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  searchStoreMeta: { fontSize: '12px', color: '#888', marginBottom: '3px' },

  bigBannerWrap: { margin: '0 16px 5px' },
  bigBanner: { borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', minHeight: '130px' },
  bigBannerContent: {},
  bigBannerTag: { fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' },
  bigBannerTitle: { fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '4px', lineHeight: '1.2' },
  bigBannerSub: { fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' },
  bigBannerBtn: { background: 'white', color: '#333', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block', cursor: 'pointer' },
  bigBannerEmoji: { fontSize: '60px' },
  miniBanners: { display: 'flex', gap: '8px', marginBottom: '10px' },
  miniBanner: { flex: 1, borderRadius: '12px', padding: '12px 10px', minHeight: '80px', position: 'relative', overflow: 'hidden' },
  miniBannerBadge: { fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '6px' },
  miniBannerTitle: { fontSize: '12px', fontWeight: '700', color: 'white', marginBottom: '4px' },
  miniBannerSub: { fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  bannerDots: { display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '5px' },
  dot: { height: '6px', borderRadius: '3px', cursor: 'pointer', transition: '0.3s' },

  whiteSection: { background: '#f7f7f7', borderRadius: '20px 20px 0 0', marginTop: '10px', minHeight: '60vh' },
  section: { padding: '20px 16px 5px' },
  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#222' },
  sectionSub: { fontSize: '13px', color: '#888', marginBottom: '15px' },
  seeAll: { fontSize: '13px', color: '#ff6b00', fontWeight: '600', cursor: 'pointer' },
  storeCount: { fontSize: '13px', color: '#888' },
  categories: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
  category: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', cursor: 'pointer', minWidth: '62px' },
  catCircle: { width: '62px', height: '62px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', transition: '0.2s' },
  catName: { fontSize: '11px', textAlign: 'center', transition: '0.2s' },
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
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: '#888', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
};
