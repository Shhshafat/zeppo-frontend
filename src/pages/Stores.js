import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Stores() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await API.get('/api/restaurants');
      setRestaurants(res.data);
      setFiltered(res.data);

      const allItems = [];
      for (const r of res.data) {
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
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (q) => {
    setSearch(q);
    setFiltered(!q ? restaurants : restaurants.filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.category.toLowerCase().includes(q.toLowerCase())
    ));
    setFilteredItems(!q ? menuItems : menuItems.filter(i =>
      i.name.toLowerCase().includes(q.toLowerCase()) ||
      i.category.toLowerCase().includes(q.toLowerCase())
    ));
  };

  const filterByType = (type) => {
    setActiveFilter(type);
    setSearch('');
    setFiltered(type === 'All' ? restaurants : restaurants.filter(r =>
      r.category.toLowerCase().includes(type.toLowerCase())
    ));
    setFilteredItems(type === 'All' ? menuItems : menuItems.filter(i =>
      i.category.toLowerCase().includes(type.toLowerCase())
    ));
  };

  const cuisines = [
    { emoji: '🍽️', name: 'All' },
    { emoji: '🍕', name: 'Pizzas' },
    { emoji: '🥛', name: 'Lassi' },
    { emoji: '🍚', name: 'Biryani' },
    { emoji: '🥟', name: 'Samosa' },
    { emoji: '🍗', name: 'Tandoori' },
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🥤', name: 'Drinks' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5', flexDirection: 'column', gap: '18px' }}>
      <style>{`@keyframes zeppoSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#ff6b00', fontWeight: '800', fontSize: '20px', letterSpacing: '3px' }}>ZEPPO</div>
      <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,107,0,0.15)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'zeppoSpin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.searchBox}>
          <span>🔍</span>
          <input style={s.searchInput} placeholder="Search stores or dishes..."
            value={search} onChange={e => handleSearch(e.target.value)} />
          {search && <span style={{ cursor: 'pointer', color: '#aaa' }} onClick={() => handleSearch('')}>✕</span>}
        </div>
      </div>

      {/* Top Banner */}
      <div style={s.topBanner}>
        <div style={s.bannerLeft}>
          <div style={s.bannerTitle}>🏪 ZEPPO Store</div>
          <div style={s.bannerSub}>Meals at ₹99 + Free Delivery</div>
        </div>
        <div style={s.bannerRight}>
          <div style={s.bannerEmojis}>🍔🍚</div>
          <div style={s.bannerDrink}>🥤</div>
        </div>
      </div>

      {/* Popular Cuisines */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Popular Cuisines</div>
        <div style={s.cuisines}>
          {cuisines.map(c => (
            <div key={c.name} style={s.cuisineItem} onClick={() => filterByType(c.name)}>
              <div style={{ ...s.cuisineCircle, border: activeFilter === c.name ? '2px solid #ff6b00' : '2px solid transparent' }}>
                <span style={{ fontSize: '30px' }}>{c.emoji}</span>
              </div>
              <div style={{ ...s.cuisineName, color: activeFilter === c.name ? '#ff6b00' : '#333', fontWeight: activeFilter === c.name ? '700' : '400' }}>{c.name}</div>
              {activeFilter === c.name && <div style={s.cuisineCheck}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Trending Dishes */}
      {filteredItems.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>
            {activeFilter === 'All' ? 'Trending dishes near you' : `${activeFilter} dishes`}
          </div>
          <div style={s.dishesScroll}>
            {filteredItems.slice(0, 10).map((item, i) => (
              <div key={i} style={s.dishCard} onClick={() => navigate(`/order/${item.restaurant_id}`)}>
                <div style={s.dishImgBox}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={s.dishImg}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div style={{ ...s.dishEmoji, display: item.image ? 'none' : 'flex' }}>
                    {item.restaurant_emoji || '🍽️'}
                  </div>
                  <div style={s.dishAddBtn}>+</div>
                </div>
                <div style={s.dishVeg}>🟢</div>
                <div style={s.dishName}>{item.name}</div>
                <div style={s.dishMeta}>
                  {item.original_price ? (
                    <>
                      <span style={s.dishPriceOld}>₹{item.original_price}</span>
                      <span style={s.dishPrice}>₹{item.price}</span>
                    </>
                  ) : (
                    <span style={s.dishPrice}>₹{item.price}</span>
                  )}
                </div>
                <div style={s.dishRestName}>{item.restaurant_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Filters */}
      <div style={s.priceFilters}>
        {['₹99 & under', '₹100 - ₹149', 'Veg/Non-Veg'].map(f => (
          <div key={f} style={{ ...s.priceFilter, background: priceFilter === f ? '#ff6b00' : 'white', color: priceFilter === f ? 'white' : '#333' }}
            onClick={() => setPriceFilter(priceFilter === f ? '' : f)}>
            {f} {f === 'Veg/Non-Veg' ? '▾' : ''}
          </div>
        ))}
      </div>

      {/* Restaurants */}
      <div style={s.section}>
        <div style={s.sectionRow}>
          <div style={s.sectionTitle}>Top {filtered.length} restaurants to explore</div>
        </div>
        <div style={s.sectionSub}>Featured Restaurants</div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>😔</div>
            <p style={{ color: '#888' }}>No stores found</p>
            <button style={s.clearBtn} onClick={() => { handleSearch(''); filterByType('All'); }}>Show all</button>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} style={{ ...s.restCard, opacity: r.is_open === 0 ? 0.6 : 1 }}
              onClick={() => navigate(`/order/${r.id}`)}>
              <div style={s.restImgBox}>
                {r.image ? (
                  <img src={r.image} alt={r.name} style={s.restImg}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <div style={{ ...s.restEmoji, display: r.image ? 'none' : 'flex' }}>{r.emoji || '🍽️'}</div>
                {r.is_open === 0 && <div style={s.closedOverlay}>CLOSED</div>}
                <div style={s.heartBtn}>🤍</div>
                <div style={s.offerTag}>Items at ₹99</div>
              </div>
              <div style={s.restInfo}>
                <div style={s.restName}>{r.name}</div>
                <div style={s.restMeta}>
                  <span style={s.ratingBadge}>⭐ {r.rating}</span>
                  <span style={s.dot}>•</span>
                  <span style={s.timeText}>30-40 min</span>
                </div>
                <div style={s.restCat}>{r.category}</div>
                {r.description && <div style={s.restDesc}>{r.description}</div>}
                <div style={s.restAddr}>📍 {r.address}</div>
                <div style={s.freeText}>🎉 Free delivery</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div style={s.bottomNav}>
        <div style={s.navItem} onClick={() => navigate('/')}>
          <span style={s.navIcon}>🏠</span><span>Home</span>
        </div>
        <div style={{ ...s.navItem, color: '#ff6b00' }}>
          <span style={s.navIcon}>🏪</span><span>Stores</span>
        </div>
        <div style={s.navItem} onClick={() => navigate('/track')}>
          <span style={s.navIcon}>📦</span><span>Orders</span>
        </div>
        <div style={s.navItem} onClick={() => navigate('/profile')}>
          <span style={s.navIcon}>👤</span><span>Profile</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', paddingBottom: '70px' },
  header: { background: 'white', padding: '50px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', flexShrink: 0 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '10px', padding: '10px 14px' },
  searchInput: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '14px', color: '#333' },
  topBanner: { background: 'linear-gradient(135deg, #1a6eb5, #2196F3)', margin: '0', padding: '20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '120px' },
  bannerLeft: {},
  bannerTitle: { fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' },
  bannerSub: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-block' },
  bannerRight: { position: 'relative' },
  bannerEmojis: { fontSize: '50px' },
  bannerDrink: { fontSize: '30px', position: 'absolute', bottom: '-10px', right: '-10px' },
  section: { padding: '20px 16px 10px', background: 'white', marginBottom: '8px' },
  sectionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#222', marginBottom: '15px' },
  sectionSub: { fontSize: '13px', color: '#888', marginBottom: '15px', marginTop: '-10px' },
  cuisines: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' },
  cuisineItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', minWidth: '65px', position: 'relative' },
  cuisineCircle: { width: '70px', height: '70px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cuisineName: { fontSize: '12px', color: '#333', textAlign: 'center' },
  cuisineCheck: { position: 'absolute', top: '2px', right: '2px', background: '#ff6b00', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' },
  dishesScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' },
  dishCard: { background: 'white', borderRadius: '12px', minWidth: '150px', flexShrink: 0, border: '1px solid #f0f0f0', cursor: 'pointer', overflow: 'hidden' },
  dishImgBox: { height: '120px', background: 'linear-gradient(135deg, #ff6b00, #e05a00)', position: 'relative', overflow: 'hidden' },
  dishImg: { width: '100%', height: '100%', objectFit: 'cover' },
  dishEmoji: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px' },
  dishAddBtn: { position: 'absolute', bottom: '8px', right: '8px', background: 'white', color: '#ff6b00', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
  dishVeg: { padding: '6px 8px 2px', fontSize: '12px' },
  dishName: { padding: '0 8px', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' },
  dishMeta: { padding: '0 8px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  dishPriceOld: { fontSize: '12px', color: '#aaa', textDecoration: 'line-through' },
  dishPrice: { fontSize: '14px', fontWeight: '700', color: '#222', background: '#ffd700', padding: '1px 6px', borderRadius: '4px' },
  dishRestName: { padding: '0 8px 10px', fontSize: '11px', color: '#888' },
  priceFilters: { display: 'flex', gap: '8px', padding: '12px 16px', background: 'white', borderBottom: '1px solid #f0f0f0', overflowX: 'auto', scrollbarWidth: 'none' },
  priceFilter: { padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e0e0e0', whiteSpace: 'nowrap', flexShrink: 0 },
  restCard: { background: 'white', borderRadius: '0', marginBottom: '0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', display: 'flex', gap: '12px', padding: '15px 0' },
  restImgBox: { width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg, #ff6b00, #e05a00)' },
  restImg: { width: '100%', height: '100%', objectFit: 'cover' },
  restEmoji: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px' },
  closedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' },
  heartBtn: { position: 'absolute', top: '8px', right: '8px', fontSize: '16px', cursor: 'pointer' },
  offerTag: { position: 'absolute', bottom: '8px', left: '0', right: '0', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '4px 6px', textAlign: 'center' },
  restInfo: { flex: 1, paddingRight: '10px' },
  restName: { fontSize: '16px', fontWeight: '700', color: '#222', marginBottom: '5px' },
  restMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  ratingBadge: { background: '#27ae60', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' },
  dot: { color: '#ddd' },
  timeText: { fontSize: '12px', color: '#666' },
  restCat: { fontSize: '13px', color: '#888', marginBottom: '3px' },
  restDesc: { fontSize: '11px', color: '#aaa', marginBottom: '3px' },
  restAddr: { fontSize: '11px', color: '#aaa', marginBottom: '3px' },
  freeText: { fontSize: '11px', color: '#ff6b00', fontWeight: '600' },
  clearBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', marginTop: '10px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: '#888', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
};
