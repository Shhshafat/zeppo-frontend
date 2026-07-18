import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Location() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const locations = [
    'Ander Hama', 'Bramri', 'Bumhama', 'Drug Mulla', 'Rakhe Muchwari',
    'Rudbugh', 'Shat Muqam', 'Ashkan Pora', 'Authratoo', 'Bader Kal',
    'Badkoot Machipora', 'Bahader Pora', 'Bakhiakhar', 'Buderher', 'Cher Mandi',
    'Choti Pora', 'Chougal', 'Dudi Pora', 'Geeri Pora', 'Gori Akhar',
    'Harni Pora', 'Jager Pora', 'Kandi Khass', 'Kargam', 'Kawari',
    'Keegam', 'Khan Pora', 'Khirman Talakchand', 'Kulangam', 'Lachi Pora',
    'Magam', 'Maidan Chogul', 'Marat Gam', 'Nabedzeb', 'Nagra Nar',
    'Neeli Pora', 'Nut Noosa', 'Pahaldaji', 'Pal Pora', 'Pazwal Pora',
    'Rakh Shelhal', 'Shadipora', 'Shelhal', 'Shog Pora', 'Siraj Pora',
    'Sodal', 'Tirch', 'Tulwari', 'Tumpora', 'Tutigund',
    'Vodh Pora', 'Wadi Pora', 'Wagat', 'Wargi Pora', 'Wari Pora',
    'Waripora Gonipora', 'Waskura', 'Water Khani', 'Amroohi', 'Badwan',
    'Bagbela', 'Bahadurkoot', 'Bijaldara', 'Chamkote', 'Chani Pora Bala',
    'Chanipora Payeen', 'Chatkedi', 'Chiterkoot', 'Dhani', 'Dildar',
    'Draged', 'Dringla', 'Ghasla', 'Gomal', 'Gundi Gojran',
    'Gundi Shat', 'Gund Sayeedan', 'Hajinar', 'Hajithra', 'Hundwal',
    'Ibkoot', 'Jabdi', 'Kadhama', 'Kandi', 'Khawerpara',
    'Kohanagabra', 'Nawagabra', 'Nechyan', 'Panj Taran', 'Pinglaharidal',
    'Pir Punjwa', 'Prada', 'Purnai', 'Shamsipora', 'Sudhpora',
    'Taad', 'Tanghdar', 'Teetwal', 'Turban Seemari', 'Bitchwal',
    'Bogna', 'Bore', 'Keran', 'Mundiyan', 'Patran',
    'Aalosa', 'Bat Pora', 'Bundnamble', 'Chowkibal', 'Dard Hari Khar Gund',
    'Dard Pora', 'Dardsun Reshigund', 'Farkin', 'Gazriyal', 'Gund Zona Reshi',
    'Kachama', 'Kralpora', 'Lone Hari', 'Melyal', 'Panzgam',
    'Rashan Pora', 'Rawath Pora', 'Salamatwari', 'Shuloora', 'Sonti Pora',
    'Warsun', 'Alachi Zab', 'Awoora', 'Balli Pora', 'Batapora Haihama',
    'Bater Gam', 'Bober Nagh', 'Bohi Pora', 'Check Kalilone', 'Cher Koote',
    'Dedi Koote', 'Dudwan', 'Gotingo', 'Gulgam', 'Gund Gushi',
    'Gund Jahangir', 'Gundsanah Haihama', 'Gushi', 'Hakcher Pora', 'Halmath Pora',
    'Hat Mulla', 'Kari Hama', 'Khumriyal', 'Lashdath', 'Madmadow Kalarooch',
    'Manigah', 'Moori Kalaroose', 'Mugal Pora', 'Nagri Malpora', 'Ogbal',
    'Parray Pora', 'Pazi Pora', 'Push Wari', 'Qasba Haihama', 'Qasba Kalaroose',
    'Sarkuli Kalaroose', 'Shumriyal', 'Sulkoote', 'Tikker', 'Warapora',
    'Zangli Kashera', 'Charligund', 'Daramwari', 'Darpora', 'Gagal',
    'Khurhama', 'Krusan', 'Kuligam', 'Lal Pora', 'Maidan Pora',
    'Muqam Lolab', 'Rednagh', 'Saiwan', 'Siver Thandipora', 'Takya Khurhama',
    'Warnow', 'Audoora', 'Banday', 'Bata Gund', 'Batapora',
    'Bunagam', 'Chontipora', 'Darbalbala', 'Darbal Payeen', 'Drungso Shahnagri',
    'Dudkul', 'Guloora', 'Gund Razak', 'Hangah', 'Hanjishart',
    'Haril', 'Hari Pora', 'Hydermari', 'Jehama', 'Kachri',
    'Khanubabagund', 'Khudi', 'Kohru', 'Kultoora', 'Lach',
    'Lahikote', 'Mawar', 'Monabal', 'Nowgam', 'Pohrupeth',
    'Pringroo', 'Qalamabad', 'Sanzipora', 'Shanoo', 'Shartgund Payeen',
    'Shat Gund Bala', 'Sheikh Pora', 'Shilthara', 'Siphanyaroo', 'Suddergund',
    'Teerna Tantraygund', 'Udi Pora', 'Ujroo', 'Wahi Pora', 'Walarama',
    'Wara Pora', 'Wihama', 'Yaroo', 'Yunsoo', 'Chandigam',
    'Diver Anderbugh', 'Doni Wari', 'Dorchwani', 'Gungbug', 'Hayat Pora',
    'Kanthpora', 'Muqam Shareefdar', 'Potushai', 'Rakh Gund Mancher', 'Sogam',
    'Surigam', 'Tangcheck', 'Teki Pora', 'Thandoosa', 'Wavoora',
    'Chonti Wari', 'Dapal', 'Dudi', 'Har During', 'Machil',
    'Misri Behak', 'Ananwan', 'Ash Pora', 'Badh Bugh', 'Badrah',
    'Bair Gund', 'Bicherwari', 'Check Puran', 'Deedar Pora', 'Gana Pora',
    'Gund Chubutra', 'Gund Kamal', 'Hajin', 'Ham Pora', 'Harveth',
    'Kachlo Qazipora', 'Khai Pora', 'Khana Gund', 'Khawar Wara', 'Kral Gund',
    'Kral Pora', 'Kunil', 'Lalboug', 'Loki Pora', 'Mal Bagh',
    'Mandi Gam', 'Mangwal Pora', 'Muqam Hindwand Pora', 'Muqam Rajwar', 'Nehama',
    'Pala Pora', 'Pandith Pora', 'Panzwal Pora', 'Rasri Pora', 'Rawal Pora',
    'Renan', 'Reshi Pora', 'Ringpath', 'Safal Pora', 'Sahi Pora',
    'Shehil Pora', 'Super Nagama', 'Thukar Pora', 'Utingroo', 'Wajhama',
    'Wangam', 'Amar Garah', 'Banger Gund', 'Cham Pora', 'Check Bakshi',
    'Cher Kote', 'Cher Pawa', 'Dahama', 'Daril', 'Dolatpora',
    'Doli Pora', 'Gundelashah', 'Gunde Mumin', 'Hafrada', 'Hangni Koot',
    'Hurdoona', 'Kali Pora', 'Kinyal', 'Kukroosa', 'Lilam',
    'Manz Gam', 'Pach Kote', 'Pader Gund', 'Qalmonah', 'Shaher Kote',
    'Sochal Yari', 'Sun Mulla', 'Tarath Pora', 'Tumina', 'Vilgam',
    'Waisa Kawnar', 'Wavri Pora', 'Gofa Bal', 'Gugloosa', 'Hanji Pora',
    'Hayan', 'Herri', 'Hundi', 'Jumgand', 'Kenthawalli',
    'Kunan', 'Laderwan', 'Marhama', 'Posh Pora', 'Trehgam',
    'Zirhama', 'Ahgam', 'Bowanwatsar', 'Changmula', 'Dogripora',
    'Khahipora', 'Krumhoora', 'Lacham Pora', 'Laribal', 'Nechama',
    'Rajpora', 'Ratnipora', 'Sarmarg', 'Satkoji', 'Shartigam',
    'Sultan Pora', 'Turkpora', 'Waddar Bala', 'Waddar Payeen', 'Yamlar',
    'Zachal Dara', 'Zafarkhani',
    // Extra main areas
    'Kupwara Town', 'Handwara', 'Lolab', 'Karnah', 'Langate',
    'Drugmulla', 'Sogam', 'Zachaldara', 'Tangdar',
  ];

  const filtered = locations.filter(l =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  const selectLocation = (name) => {
    localStorage.setItem('location', name);
    localStorage.setItem('locationSub', 'Kupwara, J&K');
    navigate('/');
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>‹</button>
        <span style={s.headerTitle}>Select Location</span>
      </div>

      <div style={s.searchBox}>
        <span>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Search your village or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        {search && <span style={s.clearBtn} onClick={() => setSearch('')}>✕</span>}
      </div>

      <div style={s.currentLocation} onClick={() => selectLocation('Current Location')}>
        <div style={{ fontSize: '24px' }}>📍</div>
        <div>
          <div style={s.currentTitle}>Use current location</div>
          <div style={s.currentSub}>Detect my location automatically</div>
        </div>
      </div>

      <div style={s.listTitle}>
        {search ? `${filtered.length} results found` : `367 villages in Kupwara District`}
      </div>

      {filtered.length === 0 ? (
        <div style={s.noResult}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
          <p style={{ color: '#888' }}>No village found</p>
        </div>
      ) : (
        filtered.map((loc, i) => (
          <div key={i} style={s.locationItem} onClick={() => selectLocation(loc)}>
            <div style={s.locIconBox}>📌</div>
            <div style={{ flex: 1 }}>
              <div style={s.locName}>{loc}</div>
              <div style={s.locSub}>Kupwara, Jammu & Kashmir</div>
            </div>
            <span style={s.locArrow}>›</span>
          </div>
        ))
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'white' },
  header: { padding: '50px 16px 15px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', background: 'white', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#333', lineHeight: 1 },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#222' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 16px', background: '#f5f5f5', borderRadius: '14px', padding: '13px 16px', border: '1.5px solid #efefef' },
  searchInput: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '15px', color: '#222' },
  clearBtn: { fontSize: '14px', color: '#aaa', cursor: 'pointer', padding: '2px 6px' },
  currentLocation: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', margin: '0 16px 15px', background: '#fff3e0', borderRadius: '14px', cursor: 'pointer', border: '1.5px solid #ff6b00' },
  currentTitle: { fontSize: '15px', fontWeight: '700', color: '#ff6b00' },
  currentSub: { fontSize: '13px', color: '#888', marginTop: '2px' },
  listTitle: { fontSize: '12px', fontWeight: '700', color: '#aaa', padding: '5px 16px 10px', textTransform: 'uppercase', letterSpacing: '1px' },
  noResult: { textAlign: 'center', padding: '40px 20px', color: '#888' },
  locationItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' },
  locIconBox: { fontSize: '18px', width: '36px', height: '36px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  locName: { fontSize: '15px', fontWeight: '600', color: '#222' },
  locSub: { fontSize: '12px', color: '#888', marginTop: '2px' },
  locArrow: { fontSize: '20px', color: '#ccc' },
};
