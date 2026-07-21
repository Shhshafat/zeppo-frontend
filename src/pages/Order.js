import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../App';
import API from '../api';

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, cartCount, cartTotal } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState({});
  const [vegMode, setVegMode] = useState(false);
  const [portionModal, setPortionModal] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [showRatings, setShowRatings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const restRes = await API.get('/api/restaurants');
      const rest = restRes.data.find(r => r.id == id);
      setRestaurant(rest);
      const menuRes = await API.get(`/api/menu/${id}`);
      const cats = {};
      menuRes.data.forEach(item => {
        if (!cats[item.category]) cats[item.category] = [];
        cats[item.category].push(item);
      });
      setCategories(cats);
      const ratingsRes = await API.get(`/api/ratings/${id}`);
      setRatings(ratingsRes.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const isVeg = (item) => item.is_veg === 1 || item.is_veg === undefined;
  const getPortions = (item) => {
    try { return item.portions ? JSON.parse(item.portions) : []; } catch { return []; }
  };

  const handleAddClick = (item) => {
    const portions = getPortions(item);
    if (portions.length > 0) {
      setPortionModal(item);
      setSelectedPortion(0);
    } else {
      doAdd(item, item.name, item.price);
    }
  };

  const doAdd = (item, label, price) => {
    addToCart(restaurant.id, restaurant.name, restaurant.emoji, item, label, price);
    setAddedToast(label);
    setTimeout(() => setAddedToast(null), 1800);
  };

  const confirmPortionAdd = () => {
    const portions = getPortions(portionModal);
    const p = portions[selectedPortion];
    doAdd(portionModal, `${portionModal.name} (${p.name})`, p.price);
    setPortionModal(null);
  };

  const cartQtyFor = (itemId) => {
    if (cart.restaurantId !== restaurant?.id) return 0;
    return cart.items.filter(c => c.id === itemId).reduce((s, c) => s + c.qty, 0);
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : restaurant?.rating;

  const filteredCategories = {};
  Object.entries(categories).forEach(([cat, items]) => {
    const filtered = vegMode ? items.filter(isVeg) : items;
    if (filtered.length > 0) filteredCategories[cat] = filtered;
  });

  const isCurrentRestaurantCart = cart.restaurantId === restaurant?.id;
  const displayCount = isCurrentRestaurantCart ? cartCount : 0;
  const displayTotal = isCurrentRestaurantCart ? cartTotal : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fff', flexDirection: 'column', gap: '18px' }}>
      <style>{`@keyframes zeppoSpin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: '#ff6b00', fontWeight: '800', fontSize: '20px', letterSpacing: '3px' }}>ZEPPO</div>
      <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,107,0,0.15)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'zeppoSpin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={s.container}>
      <style>{`
        @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpCartBar { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes slideDownToast { from { transform: translate(-50%, -60px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {/* Added-to-cart toast */}
      {addedToast && (
        <div style={s.toast}>
          <span style={{ fontSize: '16px' }}>✅</span>
          <span>{addedToast} added to cart!</span>
        </div>
      )}

      {/* Portion Selector Modal */}
      {portionModal && (
        <div style={s.modalOverlay} onClick={() => setPortionModal(null)}>
          <div style={s.portionSheet} onClick={e => e.stopPropagation()}>
            <div style={s.portionHeader}>
              <div style={s.vegSquare(portionModal.is_veg !== 0)} />
              <div style={s.portionTitle}>{portionModal.name}</div>
              <span style={s.closeX} onClick={() => setPortionModal(null)}>✕</span>
            </div>
            <div style={s.portionSub}>Select any 1</div>
            {getPortions(portionModal).map((p, i) => (
              <div key={i} style={s.portionOption} onClick={() => setSelectedPortion(i)}>
                <div style={s.radioOuter}>{selectedPortion === i && <div style={s.radioInner} />}</div>
                <div style={{ flex: 1, fontSize: '15px', color: '#222' }}>{p.name}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>₹{p.price}</div>
              </div>
            ))}
            <button style={s.portionAddBtn} onClick={confirmPortionAdd}>
              Add Item | ₹{getPortions(portionModal)[selectedPortion]?.price}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.restName}>{restaurant?.emoji} {restaurant?.name}</div>
          <div style={s.restMeta}>{restaurant?.category} • {restaurant?.address}</div>
        </div>
        <button style={s.cartIconBtn} onClick={() => navigate('/cart')}>
          🛒 {cartCount > 0 && <span style={s.cartIconBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* Rating Bar */}
      <div style={s.ratingBar} onClick={() => setShowRatings(!showRatings)}>
        <div style={s.ratingLeft}>
          <span style={s.ratingBadge}>⭐ {avgRating}</span>
          <span style={s.ratingCount}>{ratings.length} ratings</span>
        </div>
        <span style={s.ratingArrow}>{showRatings ? '▲' : '▼'} Reviews</span>
      </div>

      {showRatings && (
        <div style={s.reviewsBox}>
          {ratings.length === 0 ? (
            <p style={s.noReview}>No reviews yet — be the first!</p>
          ) : (
            ratings.slice(0, 5).map((r, i) => (
              <div key={i} style={s.reviewItem}>
                <div style={s.reviewHeader}>
                  <span style={s.reviewName}>{r.user_name || 'User'}</span>
                  <span>{'⭐'.repeat(r.rating)}</span>
                </div>
                {r.review && <p style={s.reviewText}>{r.review}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Veg toggle bar */}
      <div style={s.vegBar}>
        <div style={s.vegLabel}>VEG ONLY</div>
        <div style={{ ...s.vegSwitch, background: vegMode ? '#27ae60' : '#ccc' }} onClick={() => setVegMode(!vegMode)}>
          <div style={{ ...s.vegDot, left: vegMode ? '18px' : '2px' }} />
        </div>
      </div>

      {/* Cart from different restaurant warning */}
      {cart.restaurantId && cart.restaurantId !== restaurant?.id && cart.items.length > 0 && (
        <div style={s.warningBar}>
          🛒 You have items from <strong>{cart.restaurantName}</strong> in cart. Adding here will ask to clear it.
        </div>
      )}

      {/* Menu */}
      <div style={s.menuSection}>
        {Object.keys(filteredCategories).length === 0 ? (
          <div style={s.noMenu}>{vegMode ? 'No veg items available 🥲' : 'Menu coming soon! 🍽️'}</div>
        ) : (
          Object.entries(filteredCategories).map(([cat, items]) => (
            <div key={cat}>
              <div style={s.categoryTitle}>{cat} <span style={s.categoryCount}>({items.length})</span></div>
              {items.map(item => {
                const portions = getPortions(item);
                const qtyInCart = cartQtyFor(item.id);
                return (
                  <div key={item.id} style={s.menuItem}>
                    <div style={s.itemLeft}>
                      <div style={s.vegSquare(item.is_veg !== 0)} />
                      <div style={s.itemName}>{item.name}</div>
                      <div style={s.itemPriceRow}>
                        {item.original_price ? (
                          <>
                            <span style={s.itemPriceOld}>₹{item.original_price}</span>
                            <span style={s.itemPrice}>₹{portions.length > 0 ? portions[0].price : item.price}</span>
                          </>
                        ) : (
                          <span style={s.itemPrice}>{portions.length > 0 ? `₹${portions[0].price} onwards` : `₹${item.price}`}</span>
                        )}
                      </div>
                      {item.description && <div style={s.itemDesc}>{item.description}</div>}
                      {qtyInCart > 0 && <div style={s.itemInCartBadge}>{qtyInCart} in cart</div>}
                    </div>
                    <div style={s.itemRight}>
                      <div style={s.itemImgBox}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={s.itemImg} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={s.itemEmoji}>🍽️</div>
                        )}
                        <button style={s.addBtn} onClick={() => handleAddClick(item)}>
                          {portions.length > 0 ? 'ADD ▾' : (qtyInCart > 0 ? `✓ ${qtyInCart}` : 'ADD')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Floating cart bar */}
      {displayCount > 0 && (
        <div style={s.floatingCartBar} onClick={() => navigate('/cart')}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>{displayCount} item{displayCount > 1 ? 's' : ''}</div>
            <div style={{ fontSize: '17px', fontWeight: '800' }}>₹{displayTotal}</div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View Cart <span style={{ fontSize: '18px' }}>→</span>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#fff', paddingBottom: '90px' },
  header: { background: '#ff6b00', color: 'white', padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '15px' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', flexShrink: 0 },
  restName: { fontSize: '18px', fontWeight: '700' },
  restMeta: { fontSize: '13px', opacity: '0.9', marginTop: '3px' },
  cartIconBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', position: 'relative', flexShrink: 0 },
  cartIconBadge: { position: 'absolute', top: '-4px', right: '-4px', background: '#27ae60', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', border: '2px solid #ff6b00' },
  ratingBar: { background: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  ratingLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  ratingBadge: { background: '#27ae60', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' },
  ratingCount: { fontSize: '13px', color: '#888' },
  ratingArrow: { fontSize: '13px', color: '#ff6b00', fontWeight: '600' },
  reviewsBox: { background: 'white', padding: '15px 16px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0' },
  noReview: { color: '#888', fontSize: '14px', textAlign: 'center' },
  reviewItem: { padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  reviewName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  reviewText: { fontSize: '13px', color: '#666', lineHeight: '1.5' },

  vegBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'white', borderBottom: '8px solid #f5f5f5' },
  vegLabel: { fontSize: '13px', fontWeight: '700', color: '#333' },
  vegSwitch: { width: '38px', height: '20px', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' },
  vegDot: { position: 'absolute', width: '16px', height: '16px', background: 'white', borderRadius: '50%', top: '2px', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },

  warningBar: { background: '#fff3e0', color: '#e65100', fontSize: '12.5px', padding: '10px 16px', borderBottom: '1px solid #ffe0b2' },

  menuSection: { padding: '0 16px' },
  categoryTitle: { fontSize: '16px', fontWeight: '700', color: '#222', margin: '18px 0 4px', display: 'flex', alignItems: 'baseline', gap: '6px' },
  categoryCount: { fontSize: '13px', color: '#888', fontWeight: '400' },
  menuItem: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '16px 0', borderBottom: '1px solid #f0f0f0' },
  itemLeft: { flex: 1, minWidth: 0 },
  vegSquare: (veg) => ({ width: '14px', height: '14px', border: `1.5px solid ${veg ? '#0f8a1e' : '#b1000f'}`, borderRadius: '3px', position: 'relative', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  itemName: { fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' },
  itemPriceRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  itemPrice: { fontSize: '14px', fontWeight: '600', color: '#222' },
  itemPriceOld: { fontSize: '13px', color: '#aaa', textDecoration: 'line-through' },
  itemDesc: { fontSize: '12.5px', color: '#888', lineHeight: '1.4', marginBottom: '4px' },
  itemInCartBadge: { fontSize: '11px', color: '#ff6b00', fontWeight: '700', marginTop: '4px' },
  itemRight: { flexShrink: 0 },
  itemImgBox: { width: '110px', height: '100px', borderRadius: '12px', position: 'relative', overflow: 'visible', background: '#f5f5f5' },
  itemImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' },
  itemEmoji: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', borderRadius: '12px', background: '#f5f5f5' },
  addBtn: { position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'white', color: '#ff6b00', border: '1px solid #e0e0e0', padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' },
  noMenu: { textAlign: 'center', color: '#aaa', padding: '40px', fontSize: '16px' },

  toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: 'white', padding: '12px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', animation: 'slideDownToast 0.3s ease', maxWidth: '90%' },

  floatingCartBar: { position: 'fixed', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '448px', background: '#27ae60', color: 'white', borderRadius: '14px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 200, animation: 'slideUpCartBar 0.35s cubic-bezier(0.32, 0.72, 0, 1)' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500, animation: 'fadeInOverlay 0.2s ease' },
  portionSheet: { background: 'white', width: '100%', maxWidth: '480px', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '70vh', overflowY: 'auto', animation: 'slideUpSheet 0.3s cubic-bezier(0.32, 0.72, 0, 1)' },
  portionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  portionTitle: { fontSize: '16px', fontWeight: '700', color: '#222', flex: 1 },
  closeX: { fontSize: '16px', color: '#888', cursor: 'pointer', padding: '4px' },
  portionSub: { fontSize: '12px', color: '#888', marginBottom: '14px' },
  portionOption: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' },
  radioOuter: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioInner: { width: '10px', height: '10px', borderRadius: '50%', background: '#ff6b00' },
  portionAddBtn: { width: '100%', background: '#27ae60', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '16px' },
};
