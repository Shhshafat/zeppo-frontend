import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useCart } from '../App';
import API from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const { darkMode, toggleDark } = useTheme();
  const { cartCount } = useCart();
  const name = localStorage.getItem('name') || 'User';
  const role = localStorage.getItem('role') || 'user';
  const [page, setPage] = useState('main');
  const [vegMode, setVegMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState([{ id: 1, type: 'Home', address: 'Kupwara Town, J&K' }]);
  const [editName, setEditName] = useState(name);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketSending, setTicketSending] = useState(false);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const submitTicket = async () => {
    if (!ticketSubject || !ticketMsg) { alert('Subject aur message dono bharo!'); return; }
    setTicketSending(true);
    try {
      const token = localStorage.getItem('token');
      await API.post('/api/tickets', {
        name, phone: editPhone || '', email: editEmail || '',
        subject: ticketSubject, message: ticketMsg
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setTicketSubject(''); setTicketMsg(''); setTicketSent(true);
    } catch (e) {
      alert('Error submitting ticket. Please try again.');
    }
    setTicketSending(false);
  };

  const MenuItem = ({ icon, label, value, onClick, red, toggle, toggleVal, onToggle }) => (
    <div style={s.menuItem} onClick={onClick}>
      <div style={s.menuLeft}>
        <span style={s.menuIcon}>{icon}</span>
        <span style={{ ...s.menuLabel, color: red ? '#e74c3c' : '#222' }}>{label}</span>
      </div>
      <div style={s.menuRight}>
        {value && <span style={s.menuVal}>{value}</span>}
        {toggle ? (
          <div style={{ ...s.toggle, background: toggleVal ? '#ff6b00' : '#ddd' }}
            onClick={e => { e.stopPropagation(); onToggle && onToggle(); }}>
            <div style={{ ...s.toggleDot, left: toggleVal ? '18px' : '2px' }} />
          </div>
        ) : <span style={s.arrow}>›</span>}
      </div>
    </div>
  );

  const SubPage = ({ title, children }) => (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setPage('main')}>←</button>
        <span style={s.headerTitle}>{title}</span>
      </div>
      <div style={{ padding: '15px' }}>{children}</div>
    </div>
  );

  const BottomNav = () => (
    <div style={s.bottomNav}>
      <div style={s.navItem} onClick={() => navigate('/')}><span style={s.navIcon}>🏠</span><span>Home</span></div>
      <div style={s.navItem} onClick={() => navigate('/stores')}><span style={s.navIcon}>🏪</span><span>Stores</span></div>
      <div style={{ ...s.navItem, position: 'relative' }} onClick={() => navigate('/cart')}>
        <span style={s.navIcon}>🛒</span><span>Cart</span>
        {cartCount > 0 && <span style={s.navCartBadge}>{cartCount}</span>}
      </div>
      <div style={s.navItem} onClick={() => navigate('/track')}><span style={s.navIcon}>📦</span><span>Orders</span></div>
      <div style={{ ...s.navItem, color: '#ff6b00' }}><span style={s.navIcon}>👤</span><span>Profile</span></div>
    </div>
  );

  if (page === 'edit') return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setPage('main')}>←</button>
        <span style={s.headerTitle}>Edit Profile</span>
        <button style={s.saveBtn} onClick={() => { localStorage.setItem('name', editName); setPage('main'); alert('✅ Profile updated!'); }}>Save</button>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={s.bigAvatar}>{editName[0]?.toUpperCase()}</div>
          <div style={{ color: '#ff6b00', fontSize: '14px', fontWeight: '600', marginTop: '8px', cursor: 'pointer' }}>Change Photo</div>
        </div>
        <label style={s.fieldLabel}>Full Name</label>
        <input style={s.fieldInput} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your full name" />
        <label style={s.fieldLabel}>Phone Number</label>
        <input style={s.fieldInput} value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" type="tel" />
        <label style={s.fieldLabel}>Email Address</label>
        <input style={s.fieldInput} value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="your@email.com" type="email" />
      </div>
    </div>
  );

  if (page === 'address') return (
    <SubPage title="📍 Address Book">
      {addresses.map(a => (
        <div key={a.id} style={s.infoCard}>
          <span style={{ fontSize: '22px' }}>{a.type === 'Home' ? '🏠' : '🏢'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: '#222', marginBottom: '3px' }}>{a.type}</div>
            <div style={{ color: '#888', fontSize: '13px' }}>{a.address}</div>
          </div>
          <span style={{ color: '#ff6b00', fontSize: '13px', cursor: 'pointer' }}>Edit</span>
        </div>
      ))}
      <input style={s.fieldInput} placeholder="Enter new address..." value={address} onChange={e => setAddress(e.target.value)} />
      <button style={s.orangeBtn} onClick={() => { if (address.trim()) { setAddresses([...addresses, { id: Date.now(), type: 'Other', address }]); setAddress(''); } }}>+ Add Address</button>
    </SubPage>
  );

  if (page === 'orders') return (
    <SubPage title="📦 Your Orders">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>📦</div>
        <p style={{ color: '#888', marginBottom: '20px' }}>View and track all your orders</p>
        <button style={s.orangeBtn} onClick={() => navigate('/track')}>Go to Order Tracking</button>
      </div>
    </SubPage>
  );

  if (page === 'payment') return (
    <SubPage title="💳 Payment Methods">
      <div style={s.infoCard}>
        <span style={{ fontSize: '22px' }}>💵</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#222' }}>Cash on Delivery</div>
          <div style={{ color: '#27ae60', fontSize: '13px' }}>✅ Active</div>
        </div>
      </div>
      <div style={s.infoCard}>
        <span style={{ fontSize: '22px' }}>📱</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#222' }}>UPI Payment</div>
          <div style={{ color: '#888', fontSize: '13px' }}>zeppo@upi</div>
        </div>
        <span style={{ color: '#27ae60', fontSize: '13px' }}>Active</span>
      </div>
      <div style={{ background: '#fff3e0', borderRadius: '12px', padding: '15px', marginTop: '10px' }}>
        <div style={{ fontWeight: '700', color: '#ff6b00', marginBottom: '5px' }}>💡 Coming Soon</div>
        <div style={{ color: '#888', fontSize: '13px' }}>Credit/Debit cards, Net Banking will be available soon!</div>
      </div>
    </SubPage>
  );

  if (page === 'refunds') return (
    <SubPage title="💰 My Refunds">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>💰</div>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '8px' }}>No Refunds Yet</div>
        <div style={{ color: '#888', fontSize: '14px' }}>Your refunds will appear here</div>
      </div>
    </SubPage>
  );

  if (page === 'zeppomoney') return (
    <SubPage title="🎟️ ZEPPO Money">
      <div style={{ background: '#fff3e0', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>💰</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#ff6b00', marginBottom: '5px' }}>₹0</div>
        <div style={{ color: '#888', fontSize: '14px' }}>Available Balance</div>
      </div>
      <div style={s.infoCard}>
        <span style={{ fontSize: '20px' }}>🎁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#222' }}>Earn ZEPPO Money</div>
          <div style={{ color: '#888', fontSize: '13px' }}>Refer friends and earn ₹50 each!</div>
        </div>
      </div>
      <div style={s.infoCard}>
        <span style={{ fontSize: '20px' }}>🎟️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#222' }}>Use Coupon: ZEPPO50</div>
          <div style={{ color: '#888', fontSize: '13px' }}>Get ₹50 off on first order!</div>
        </div>
      </div>
    </SubPage>
  );

  if (page === 'collections') return (
    <SubPage title="🎁 Your Collections">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎁</div>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '8px' }}>No Collections Yet</div>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Save your favorite restaurants here!</div>
        <button style={s.orangeBtn} onClick={() => navigate('/')}>Explore Restaurants</button>
      </div>
    </SubPage>
  );

  if (page === 'statements') return (
    <SubPage title="📊 Account Statements">
      <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '10px' }}>July 2026</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Total Orders</span>
          <span style={{ fontWeight: '600', color: '#222' }}>0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Total Spent</span>
          <span style={{ fontWeight: '600', color: '#222' }}>₹0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Savings</span>
          <span style={{ fontWeight: '600', color: '#27ae60' }}>₹0</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#888', fontSize: '14px' }}>
        No transactions yet — start ordering! 😋
      </div>
    </SubPage>
  );

  if (page === 'student') return (
    <SubPage title="🎓 Student Rewards">
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '15px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '5px' }}>Student Program</div>
        <div style={{ fontSize: '13px', opacity: '0.8', marginBottom: '15px' }}>Special discounts for students!</div>
        <div style={{ background: '#ff6b00', padding: '10px 20px', borderRadius: '20px', display: 'inline-block', fontSize: '14px', fontWeight: '700' }}>Coming Soon!</div>
      </div>
      <div style={s.infoCard}>
        <span style={{ fontSize: '20px' }}>✅</span>
        <div>
          <div style={{ fontWeight: '700', color: '#222' }}>10% Extra Discount</div>
          <div style={{ color: '#888', fontSize: '13px' }}>On all orders with student ID</div>
        </div>
      </div>
      <div style={s.infoCard}>
        <span style={{ fontSize: '20px' }}>✅</span>
        <div>
          <div style={{ fontWeight: '700', color: '#222' }}>Free Delivery</div>
          <div style={{ color: '#888', fontSize: '13px' }}>On orders above ₹100</div>
        </div>
      </div>
    </SubPage>
  );

  if (page === 'feedback') return (
    <SubPage title="👍 Your Feedback">
      {feedbackSent ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
          <h3 style={{ color: '#27ae60' }}>Thank you!</h3>
          <p style={{ color: '#888' }}>Your feedback helps us improve ZEPPO</p>
        </div>
      ) : (
        <>
          <p style={{ fontWeight: '600', marginBottom: '20px', color: '#222' }}>How was your experience with ZEPPO?</p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', justifyContent: 'center' }}>
            {[{ e: '😡', v: 1 }, { e: '😕', v: 2 }, { e: '😐', v: 3 }, { e: '😊', v: 4 }, { e: '😍', v: 5 }].map(({ e, v }) => (
              <div key={v} style={{ fontSize: '38px', cursor: 'pointer', opacity: feedbackRating === v ? 1 : 0.5, transform: feedbackRating === v ? 'scale(1.2)' : 'scale(1)', transition: '0.2s' }}
                onClick={() => setFeedbackRating(v)}>{e}</div>
            ))}
          </div>
          <textarea style={{ ...s.fieldInput, height: '120px', resize: 'none' }}
            placeholder="Tell us more..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
          <button style={s.orangeBtn} onClick={() => { if (feedbackRating) setFeedbackSent(true); else alert('Please select a rating!'); }}>Submit Feedback</button>
        </>
      )}
    </SubPage>
  );

  if (page === 'help') return (
    <SubPage title="🆘 Help & Support">
      {[
        { q: '🕐 How do I track my order?', a: 'Go to Orders tab → your order → track in real time!' },
        { q: '❌ How to cancel an order?', a: 'Cancel within 2 minutes of placing. Go to Orders → Cancel.' },
        { q: '💰 Refund policy?', a: 'Refunds processed within 5-7 business days to original payment.' },
        { q: '📞 Contact support?', a: 'Email: support@zeppo.in\nCall: +91-7006XXXXXX\nTime: 9AM - 9PM' },
        { q: '🛵 Become delivery partner?', a: 'Tap "Partner" on home page and fill the application form.' },
        { q: '🎟️ How to use coupon?', a: 'Enter coupon code ZEPPO50 in cart before placing order!' },
        { q: '📍 Change delivery location?', a: 'Tap on location name at top of home page to change.' },
      ].map((item, i) => (
        <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: '700', color: '#222', marginBottom: '8px' }}>{item.q}</div>
          <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{item.a}</div>
        </div>
      ))}

      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginTop: '15px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '10px' }}>📩 Raise a Ticket</div>
        {ticketSent ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div style={{ fontSize: '30px', marginBottom: '8px' }}>✅</div>
            <div style={{ color: '#27ae60', fontWeight: '600' }}>Ticket submitted! We'll get back to you soon.</div>
            <div style={{ color: '#ff6b00', fontSize: '13px', fontWeight: '600', marginTop: '12px', cursor: 'pointer' }} onClick={() => setTicketSent(false)}>Submit another ticket</div>
          </div>
        ) : (
          <>
            <input style={s.fieldInput} placeholder="Subject (e.g. Order not delivered)" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} />
            <textarea style={{ ...s.fieldInput, height: '90px', resize: 'none', marginTop: '10px' }} placeholder="Describe your issue..." value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} />
            <button style={{ ...s.orangeBtn, opacity: ticketSending ? 0.7 : 1 }} onClick={submitTicket} disabled={ticketSending}>
              {ticketSending ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </>
        )}
      </div>

      <div style={{ background: '#fff3e0', borderRadius: '12px', padding: '16px', marginTop: '10px', textAlign: 'center' }}>
        <div style={{ fontWeight: '700', color: '#ff6b00', marginBottom: '5px' }}>Still need help?</div>
        <div style={{ color: '#888', fontSize: '13px' }}>Contact us at support@zeppo.in</div>
      </div>
    </SubPage>
  );

  if (page === 'about') return (
    <SubPage title="ℹ️ About ZEPPO">
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ width: '100px', height: '100px', background: '#ff6b00', borderRadius: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
          <svg width="60" height="60" viewBox="0 0 100 100">
            <polygon points="58,10 38,52 54,52 42,90 72,48 54,48 65,10" fill="white" />
          </svg>
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#ff6b00', letterSpacing: '3px', marginBottom: '5px' }}>ZEPPO</h2>
        <p style={{ color: '#888' }}>Ghar tak, jhatpat!</p>
        <p style={{ color: '#aaa', fontSize: '13px' }}>Version 1.0.0</p>
      </div>
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '8px' }}>About Us</div>
        <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.7' }}>ZEPPO is Kupwara's first food delivery app. We connect local restaurants with customers for fast and reliable food delivery. Our mission is to bring your favorite meals to your doorstep — jhatpat!</div>
      </div>
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: '700', color: '#222', marginBottom: '8px' }}>Contact Us</div>
        <div style={{ color: '#666', fontSize: '14px', lineHeight: '2' }}>📧 support@zeppo.in<br />📞 +91-7006XXXXXX<br />📍 Kupwara, Jammu & Kashmir</div>
      </div>
    </SubPage>
  );

  if (page === 'settings') return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setPage('main')}>←</button>
        <span style={s.headerTitle}>⚙️ Settings</span>
      </div>
      <div style={{ padding: '10px 0' }}>
        <div style={s.menuSection}>
          <div style={s.sectionHead}><span style={s.sectionBar} /><span style={s.sectionTitle}>Preferences</span></div>
          <MenuItem icon="🥦" label="Veg Mode" value={vegMode ? 'On' : 'Off'} toggle toggleVal={vegMode} onToggle={() => setVegMode(!vegMode)} />
          <MenuItem icon="🌙" label="Dark Mode" value={darkMode ? 'On' : 'Off'} toggle toggleVal={darkMode} onToggle={toggleDark} />
          <MenuItem icon="🔔" label="Notifications" value={notifications ? 'On' : 'Off'} toggle toggleVal={notifications} onToggle={() => setNotifications(!notifications)} />
        </div>
        <div style={{ ...s.menuSection, marginTop: '10px' }}>
          <div style={s.sectionHead}><span style={s.sectionBar} /><span style={s.sectionTitle}>Account</span></div>
          <MenuItem icon="🌐" label="Language" value="English" onClick={() => {}} />
          <MenuItem icon="📱" label="App Version" value="1.0.0" onClick={() => {}} />
        </div>
        <div style={{ padding: '20px' }}>
          <button style={{ width: '100%', padding: '15px', background: 'transparent', color: '#e74c3c', border: '1.5px solid #e74c3c', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }} onClick={logout}>Log Out</button>
        </div>
      </div>
    </div>
  );

  // Main Profile
  return (
    <div style={s.container}>

      <div style={s.topHeader}>
        <button style={s.backBtn} onClick={() => navigate('/')}>←</button>
        <div style={s.topHeaderRight}>
          <span style={s.helpBtn} onClick={() => setPage('help')}>Help</span>
          <span style={s.menuDots}>⋮</span>
        </div>
      </div>

      <div style={s.profileTop}>
        <div style={s.profileName}>{name}</div>
        <div style={s.profilePhone}>+91 - 7006XXXXXX</div>
        <div style={s.profileEmail}>user@zeppo.in</div>
        <div style={s.editProfileBtn} onClick={() => setPage('edit')}>Edit profile ›</div>
      </div>

      <div style={s.premiumBanner} onClick={() => role === 'admin' ? navigate('/admin') : {}}>
        <div style={s.premiumLeft}>
          <div style={s.premiumIcon}>👑</div>
          <div style={{ flex: 1 }}>
            <div style={s.premiumTitle}>{role === 'admin' ? 'Admin Panel' : 'Join ZEPPO Premium'}</div>
            <div style={s.premiumSub}>Unlimited free deliveries, extra discounts & more!</div>
            <div style={s.premiumBtn}>{role === 'admin' ? 'Go to Panel →' : 'JOIN NOW'}</div>
          </div>
        </div>
        <span style={s.premiumArrow}>›</span>
      </div>

      <div style={s.quickActions}>
        {[
          { icon: '📍', label: 'Saved\nAddress', action: () => setPage('address') },
          { icon: '💳', label: 'Payment\nModes', action: () => setPage('payment') },
          { icon: '💰', label: 'My\nRefunds', action: () => setPage('refunds') },
          { icon: '🎟️', label: 'ZEPPO\nMoney', action: () => setPage('zeppomoney') },
        ].map(item => (
          <div key={item.label} style={s.quickItem} onClick={item.action}>
            <div style={s.quickIcon}>{item.icon}</div>
            <div style={s.quickLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={s.menuSection}>
        <MenuItem icon="📦" label="Your orders" onClick={() => setPage('orders')} />
        <MenuItem icon="📍" label="Address book" onClick={() => setPage('address')} />
        <MenuItem icon="🎁" label="Your collections" onClick={() => setPage('collections')} />
        <MenuItem icon="💳" label="Payment methods" onClick={() => setPage('payment')} />
        <MenuItem icon="📊" label="Account Statements" onClick={() => setPage('statements')} />
        <MenuItem icon="🎓" label="Student Rewards" onClick={() => setPage('student')} />
      </div>

      <div style={{ ...s.menuSection, marginTop: '8px' }}>
        <div style={s.sectionHead}><span style={s.sectionBar} /><span style={s.sectionTitle}>More</span></div>
        <MenuItem icon="👍" label="Your feedback" onClick={() => setPage('feedback')} />
        <MenuItem icon="ℹ️" label="About" onClick={() => setPage('about')} />
        <MenuItem icon="💬" label="Send feedback" onClick={() => setPage('feedback')} />
        <MenuItem icon="🆘" label="Help & Support" onClick={() => setPage('help')} />
        <MenuItem icon="⚙️" label="Settings" onClick={() => setPage('settings')} />
        {role === 'admin' && <MenuItem icon="👑" label="Admin Panel" onClick={() => navigate('/admin')} />}
        <MenuItem icon="🚪" label="Log out" red onClick={logout} />
      </div>

      <BottomNav />
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', paddingBottom: '70px' },
  topHeader: { background: '#fdf0e8', padding: '50px 16px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333' },
  topHeaderRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  helpBtn: { fontSize: '14px', color: '#ff6b00', fontWeight: '600', border: '1px solid #ff6b00', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer' },
  menuDots: { fontSize: '22px', color: '#333', cursor: 'pointer' },
  profileTop: { background: '#fdf0e8', padding: '10px 16px 25px' },
  profileName: { fontSize: '26px', fontWeight: '800', color: '#222', marginBottom: '5px' },
  profilePhone: { fontSize: '14px', color: '#666', marginBottom: '3px' },
  profileEmail: { fontSize: '14px', color: '#666', marginBottom: '8px' },
  editProfileBtn: { fontSize: '14px', color: '#ff6b00', fontWeight: '600', cursor: 'pointer' },
  premiumBanner: { background: 'white', margin: '10px 16px', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  premiumLeft: { display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 },
  premiumIcon: { fontSize: '24px' },
  premiumTitle: { fontSize: '15px', fontWeight: '700', color: '#222', marginBottom: '4px' },
  premiumSub: { fontSize: '13px', color: '#666', marginBottom: '8px', lineHeight: '1.4' },
  premiumBtn: { background: '#ff6b00', color: 'white', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block' },
  premiumArrow: { fontSize: '22px', color: '#ccc' },
  quickActions: { display: 'flex', background: 'white', margin: '8px 16px', borderRadius: '16px', padding: '15px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  quickItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px' },
  quickIcon: { width: '45px', height: '45px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  quickLabel: { fontSize: '11px', color: '#555', textAlign: 'center', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.3' },
  menuSection: { background: 'white', borderRadius: '16px', margin: '8px 16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sectionHead: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid #f5f5f5' },
  sectionBar: { width: '4px', height: '18px', background: '#ff6b00', borderRadius: '2px', display: 'inline-block' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#222' },
  menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 16px', borderBottom: '1px solid #f9f9f9', cursor: 'pointer' },
  menuLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  menuIcon: { fontSize: '20px', width: '26px', textAlign: 'center' },
  menuLabel: { fontSize: '15px', color: '#222' },
  menuRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  menuVal: { fontSize: '13px', color: '#aaa' },
  arrow: { fontSize: '20px', color: '#ccc' },
  toggle: { width: '40px', height: '22px', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 },
  toggleDot: { position: 'absolute', width: '18px', height: '18px', background: 'white', borderRadius: '50%', top: '2px', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  header: { background: 'white', padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#222', flex: 1 },
  saveBtn: { background: '#ff6b00', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  bigAvatar: { width: '90px', height: '90px', borderRadius: '50%', background: '#dce8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '700', color: '#3a7bd5', margin: '0 auto' },
  infoCard: { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  fieldLabel: { display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px', fontWeight: '600', marginTop: '15px' },
  fieldInput: { width: '100%', padding: '13px 15px', border: '1.5px solid #eee', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#222' },
  orangeBtn: { width: '100%', padding: '15px', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxSizing: 'border-box', marginTop: '10px' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' },
  navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 5px', cursor: 'pointer', color: '#888', fontSize: '11px' },
  navIcon: { fontSize: '22px' },
  navCartBadge: { position: 'absolute', top: '2px', right: '18px', background: '#27ae60', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
};
