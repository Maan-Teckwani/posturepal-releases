import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { syncLeaderboard } from '../leaderboardSync';

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
    if (!supabase) {
      setError('Leaderboard unavailable');
      setLoading(false);
      return;
    }

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

          await syncLeaderboard();
        }

        const fetchLeaderboard = async () => {
          const { data, error: fetchError } = await supabase
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
        console.error('Supabase error:', err);
        setError('Offline mode');
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
      <div style={{ padding: '30px', color: 'var(--black)', textAlign: 'center', marginTop: '100px', fontFamily: "'Space Grotesk', sans-serif" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px' }}>Connecting to Leaderboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '30px', color: 'var(--black)', textAlign: 'center', marginTop: '100px', fontFamily: "'Space Grotesk', sans-serif" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px' }}>{error}</h2>
        <p style={{ fontWeight: 'bold' }}>The global leaderboard requires an internet connection.</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: '30px', color: 'var(--black)', textAlign: 'center', marginTop: '100px', fontFamily: "'Space Grotesk', sans-serif" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px' }}>Leaderboard is empty!</h2>
        <p style={{ fontWeight: 'bold' }}>Start tracking your posture to claim the #1 spot.</p>
      </div>
    );
  }

  const topXP = users[0].xp || 1;

  return (
    <div style={{ padding: '30px', color: 'var(--black)', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', marginBottom: '30px', margin: '0 0 20px 0' }}>Global Leaderboard</h2>

      <div style={{ backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        {users.map((user, index) => {
          const isMe = user.username === currentUser;
          const levelIndex = Math.max(0, Math.min(user.level - 1, LEVEL_TITLES.length - 1));
          const title = LEVEL_TITLES[levelIndex];

          let rankColor = 'var(--black)';
          if (index === 0) rankColor = '#ffd700';
          else if (index === 1) rankColor = '#c0c0c0';
          else if (index === 2) rankColor = '#cd7f32';

          return (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', padding: '15px 20px',
              backgroundColor: isMe ? 'var(--accent)' : 'transparent',
              borderBottom: index === users.length - 1 ? 'none' : 'var(--border)'
            }}>
              <div style={{ width: '50px', fontWeight: 'bold', fontSize: '24px', fontFamily: "'Instrument Serif', serif", color: rankColor }}>
                #{index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {user.username} {isMe && <span style={{ fontSize: '10px', backgroundColor: 'var(--black)', color: 'var(--white)', padding: '2px 6px', border: '1px solid var(--black)' }}>YOU</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontWeight: 'bold' }}>
                  LVL {user.level} — {title}
                </div>
              </div>
              <div style={{ width: '150px', textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '24px', fontFamily: "'Instrument Serif', serif" }}>{user.xp} XP</div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--cream)', border: '1px solid var(--black)', marginTop: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(user.xp / topXP) * 100}%`, height: '100%', backgroundColor: 'var(--black)' }}></div>
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
