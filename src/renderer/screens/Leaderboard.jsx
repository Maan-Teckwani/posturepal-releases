import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const LEVEL_TITLES = [
  "Shrimp 🦐", "Minnow 🐟", "Salmon 🐠", "Dolphin 🐬", "Shark 🦈",
  "Whale 🐋", "Posture Ninja 🥷", "Spine God 🧘", "Ergonomic Legend 🏆", "PosturePal Master 👑"
];

const ADJECTIVES = ['swift', 'calm', 'brave', 'epic', 'lazy', 'smart', 'cool', 'chill'];
const NOUNS = ['barnacle', 'anchovy', 'kraken', 'turtle', 'seal', 'orca', 'squid', 'crab'];

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    let intervalId;

    const initAndFetch = async () => {
      try {
        let username = '';
        if (window.api) {
          username = await window.api.getData('username');
          if (!username) {
            const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
            const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
            username = `${adj}_${noun}_${Math.floor(Math.random() * 1000)}`;
            await window.api.setData('username', username);
          }
          setCurrentUser(username);

          const xpData = await window.api.getXP();
          
          await supabase.from('leaderboard').upsert({
            username,
            xp: xpData.total,
            level: xpData.level,
            updated_at: new Date().toISOString()
          }, { onConflict: 'username' });
        }

        const fetchLeaderboard = async () => {
          const { data, fetchError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('xp', { ascending: false })
            .limit(20);

          if (fetchError) throw fetchError;
          setUsers(data || []);
          setLoading(false);
        };

        await fetchLeaderboard();
        intervalId = setInterval(fetchLeaderboard, 60000);
      } catch (err) {
        console.error("Supabase error:", err);
        setError("Offline mode");
        setLoading(false);
      }
    };

    initAndFetch();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '30px', color: 'white', textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#61dafb' }}>Connecting to Leaderboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '30px', color: 'white', textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#f44336' }}>{error}</h2>
        <p>Could not connect to the global leaderboard.</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: '30px', color: 'white', textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#61dafb' }}>Leaderboard is empty!</h2>
        <p>Start tracking your posture to claim the #1 spot.</p>
      </div>
    );
  }

  const topXP = users[0].xp || 1;

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ color: '#61dafb', marginBottom: '20px' }}>Global Leaderboard</h2>
      
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
        {users.map((user, index) => {
          const isMe = user.username === currentUser;
          const levelIndex = Math.max(0, Math.min(user.level - 1, LEVEL_TITLES.length - 1));
          const title = LEVEL_TITLES[levelIndex];

          let rankColor = '#aaa';
          if (index === 0) rankColor = '#ffd700'; // gold
          else if (index === 1) rankColor = '#c0c0c0'; // silver
          else if (index === 2) rankColor = '#cd7f32'; // bronze

          return (
            <div key={user.id} style={{ 
              display: 'flex', alignItems: 'center', padding: '15px 20px', 
              backgroundColor: isMe ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
              borderBottom: '1px solid #333'
            }}>
              <div style={{ width: '40px', fontWeight: 'bold', fontSize: '18px', color: rankColor }}>
                #{index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {user.username} {isMe && <span style={{ fontSize: '10px', backgroundColor: '#2196f3', padding: '2px 6px', borderRadius: '10px' }}>YOU</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                  Lvl {user.level} — {title}
                </div>
              </div>
              <div style={{ width: '150px', textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{user.xp} XP</div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(user.xp / topXP) * 100}%`, height: '100%', backgroundColor: rankColor === '#aaa' ? '#4caf50' : rankColor }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
