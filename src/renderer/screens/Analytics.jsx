import React, { useState, useEffect, useRef, useMemo } from 'react';

const LEVEL_TITLES = [
  "Shrimp 🦐", "Minnow 🐟", "Salmon 🐠", "Dolphin 🐬", "Shark 🦈",
  "Whale 🐋", "Posture Ninja 🥷", "Spine God 🧘", "Ergonomic Legend 🏆", "PosturePal Master 👑"
];
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];

const GOOD_SCORE = 70; // score at/above which posture counts as "good"

const ISSUE_LABELS = {
  headForward: 'Head Forward',
  headDown: 'Head Down',
  headTilt: 'Head Tilt',
  shoulders: 'Slouched Shoulders',
  distance: 'Screen Distance'
};

// Each recorded score point represents a 30-second slice of tracked time.
const SLICE_SECONDS = 30;

// Aggregates detailed posture metrics from a set of sessions.
function computeDetailed(scopedSessions) {
  const points = [];
  let xpEarned = 0;

  scopedSessions.forEach(s => {
    xpEarned += s.xpEarned || 0;
    (s.scores || []).forEach(pt => points.push(pt));
  });

  points.sort((a, b) => a.timestamp - b.timestamp);

  const totalPoints = points.length;
  const goodPoints = points.filter(pt => pt.score >= GOOD_SCORE).length;
  const consistency = totalPoints > 0 ? Math.round((goodPoints / totalPoints) * 100) : 0;
  const activeMinutes = Math.round((totalPoints * SLICE_SECONDS) / 60);

  // Longest run of consecutive good-posture slices.
  let longestStreak = 0;
  let currentStreak = 0;
  points.forEach(pt => {
    if (pt.score >= GOOD_SCORE) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });
  const longestStreakMin = Math.round((longestStreak * SLICE_SECONDS) / 60);

  // Tally which posture issue showed up most often.
  const issueCounts = {};
  points.forEach(pt => {
    (pt.issues || []).forEach(key => {
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    });
  });
  let topIssue = null;
  let topIssueCount = 0;
  Object.entries(issueCounts).forEach(([key, count]) => {
    if (count > topIssueCount) {
      topIssue = key;
      topIssueCount = count;
    }
  });

  return {
    consistency,
    activeMinutes,
    longestStreakMin,
    xpEarned,
    topIssue: topIssue ? (ISSUE_LABELS[topIssue] || topIssue) : 'None 🎉',
    issueCounts,
    sessionCount: scopedSessions.length
  };
}

const Analytics = () => {
  const [tab, setTab] = useState('today'); // today, week, month
  const [sessions, setSessions] = useState([]);
  const [xpData, setXpData] = useState({ total: 0, level: 1 });
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      if (window.api) {
        const s = await window.api.getSessions();
        setSessions(s || []);
        const xp = await window.api.getXP();
        setXpData(xp || { total: 0, level: 1 });
      }
    };
    loadData();
  }, []);

  // Keep the "Your Progress" card live while this page is open.
  useEffect(() => {
    if (window.api && window.api.onXPUpdate) {
      window.api.onXPUpdate((xp) => {
        if (xp) setXpData(xp);
      });
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (sessions.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    const now = new Date();
    
    if (tab === 'today') {
      const todaySessions = sessions.filter(s => {
        const d = new Date(s.startTime);
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      let hourlyData = new Array(24).fill(0);
      let hourlyCounts = new Array(24).fill(0);

      todaySessions.forEach(session => {
        session.scores.forEach(pt => {
          const hr = new Date(pt.timestamp).getHours();
          hourlyData[hr] += pt.score;
          hourlyCounts[hr] += 1;
        });
      });

      const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
      const data = hourlyData.map((sum, i) => hourlyCounts[i] > 0 ? Math.round(sum / hourlyCounts[i]) : null);

      chartRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Avg Score',
            data,
            borderColor: '#4caf50',
            tension: 0.3,
            spanGaps: true
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { min: 0, max: 100 } }
        }
      });
    } else if (tab === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekSessions = sessions.filter(s => new Date(s.startTime) > weekAgo);
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let dailyScores = {};
      
      for(let i=6; i>=0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dailyScores[d.toDateString()] = { sum: 0, count: 0, label: days[d.getDay()] };
      }

      weekSessions.forEach(session => {
        const dStr = new Date(session.startTime).toDateString();
        if (dailyScores[dStr]) {
          session.scores.forEach(pt => {
            dailyScores[dStr].sum += pt.score;
            dailyScores[dStr].count += 1;
          });
        }
      });

      const labels = Object.values(dailyScores).map(d => d.label);
      const data = Object.values(dailyScores).map(d => d.count > 0 ? Math.round(d.sum / d.count) : 0);
      const colors = data.map(score => score >= 70 ? '#4caf50' : score >= 40 ? '#ff9800' : '#f44336');

      chartRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Daily Avg',
            data,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { min: 0, max: 100 } }
        }
      });
    }

  }, [tab, sessions]);

  const renderTodayStats = () => {
    const now = new Date();
    const todaySessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    let goodSecs = 0;
    let alerts = 0;
    let totalScore = 0;
    let scoreCount = 0;

    todaySessions.forEach(s => {
      goodSecs += s.goodSeconds;
      alerts += s.alertsFired;
      s.scores.forEach(pt => {
        totalScore += pt.score;
        scoreCount += 1;
      });
    });

    const avg = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const hrs = Math.floor(goodSecs / 3600);
    const mins = Math.floor((goodSecs % 3600) / 60);

    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={cardTitle}>Good posture</div>
          <div style={cardVal}>{hrs}h {mins}m</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Alerts today</div>
          <div style={cardVal}>{alerts}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Avg score</div>
          <div style={{ ...cardVal, color: avg >= 70 ? '#4caf50' : '#f44336' }}>{avg}</div>
        </div>
      </div>
    );
  };

  const renderWeekStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter(s => new Date(s.startTime) > weekAgo);
    
    let dailyAverages = {};
    weekSessions.forEach(s => {
      const dStr = new Date(s.startTime).toDateString();
      if (!dailyAverages[dStr]) dailyAverages[dStr] = { sum: 0, count: 0 };
      s.scores.forEach(pt => {
        dailyAverages[dStr].sum += pt.score;
        dailyAverages[dStr].count += 1;
      });
    });

    let max = 0;
    let min = 100;
    let totalSum = 0;
    let totalCount = 0;

    Object.values(dailyAverages).forEach(d => {
      if (d.count > 0) {
        const avg = Math.round(d.sum / d.count);
        if (avg > max) max = avg;
        if (avg < min) min = avg;
        totalSum += d.sum;
        totalCount += d.count;
      }
    });
    if (min === 100 && totalCount === 0) min = 0;

    const weeklyAvg = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;

    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={cardTitle}>Best day</div>
          <div style={cardVal}>{max}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Worst day</div>
          <div style={cardVal}>{min}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}>Weekly avg</div>
          <div style={cardVal}>{weeklyAvg}</div>
        </div>
      </div>
    );
  };

  const renderMonthStats = () => {
    const now = new Date();
    const monthSessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    let daysTracked = new Set();
    monthSessions.forEach(s => daysTracked.add(new Date(s.startTime).getDate()));

    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={cardTitle}>Days tracked this month</div>
          <div style={cardVal}>{daysTracked.size}</div>
        </div>
      </div>
    );
  };

  const renderMonthCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let dailyData = {};
    const monthSessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    monthSessions.forEach(s => {
      const date = new Date(s.startTime).getDate();
      if (!dailyData[date]) dailyData[date] = { sum: 0, count: 0, goodSecs: 0 };
      dailyData[date].goodSecs += s.goodSeconds;
      s.scores.forEach(pt => {
        dailyData[date].sum += pt.score;
        dailyData[date].count += 1;
      });
    });

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} style={calCellEmpty}></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = dailyData[i];
      let bg = '#333';
      let title = `Day ${i}: No data`;
      if (d && d.count > 0) {
        const avg = Math.round(d.sum / d.count);
        bg = avg >= 70 ? '#4caf50' : avg >= 40 ? '#ff9800' : '#f44336';
        title = `Day ${i}: Avg ${avg}, ${Math.floor(d.goodSecs/60)}m good posture`;
      }
      cells.push(
        <div key={i} title={title} style={{...calCell, backgroundColor: bg}}>
          {i}
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '20px' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={calHeader}>{d}</div>)}
        {cells}
      </div>
    );
  };

  const getScopedSessions = (scope) => {
    const now = new Date();
    if (scope === 'today') {
      return sessions.filter(s => {
        const d = new Date(s.startTime);
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (scope === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessions.filter(s => new Date(s.startTime) > weekAgo);
    }
    return sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  // Recomputing detailed metrics walks every session's full score history,
  // which is the heaviest work on this screen. Memoize on (tab, sessions) so
  // re-renders caused by XP updates or chart redraws don't pay that cost.
  const detailedMetrics = useMemo(
    () => computeDetailed(getScopedSessions(tab)),
    [tab, sessions]
  );

  const renderDetailedMetrics = () => {
    const d = detailedMetrics;
    const activeH = Math.floor(d.activeMinutes / 60);
    const activeM = d.activeMinutes % 60;

    const metrics = [
      { title: 'Active time', value: activeH > 0 ? `${activeH}h ${activeM}m` : `${activeM}m` },
      { title: 'Posture consistency', value: `${d.consistency}%`, color: d.consistency >= 70 ? '#4caf50' : d.consistency >= 40 ? '#ff9800' : '#f44336' },
      { title: 'Longest good streak', value: d.longestStreakMin > 0 ? `${d.longestStreakMin}m` : '—' },
      { title: 'XP earned', value: d.xpEarned },
      { title: 'Most common issue', value: d.topIssue, small: true },
      { title: 'Sessions', value: d.sessionCount }
    ];

    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '28px', marginBottom: '15px' }}>Detailed Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {metrics.map(m => (
            <div key={m.title} style={cardStyle}>
              <div style={cardTitle}>{m.title}</div>
              <div style={{ ...cardVal, fontSize: m.small ? '20px' : '32px', color: m.color || 'var(--black)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const levelIndex = Math.max(0, Math.min(xpData.level - 1, LEVEL_TITLES.length - 1));
  const currentTitle = LEVEL_TITLES[levelIndex];
  const nextThreshold = XP_THRESHOLDS[levelIndex + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];

  return (
    <div style={{ padding: '30px', color: 'var(--black)', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', marginBottom: '30px', margin: '0 0 20px 0' }}>Analytics</h2>
      
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h3>No data yet.</h3>
          <p>Start a session to see your analytics!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setTab('today')} className="neo-btn" style={tab === 'today' ? activeTabBtn : tabBtn}>TODAY</button>
            <button onClick={() => setTab('week')} className="neo-btn" style={tab === 'week' ? activeTabBtn : tabBtn}>WEEK</button>
            <button onClick={() => setTab('month')} className="neo-btn" style={tab === 'month' ? activeTabBtn : tabBtn}>MONTH</button>
          </div>

          {tab === 'today' && renderTodayStats()}
          {tab === 'week' && renderWeekStats()}
          {tab === 'month' && renderMonthStats()}

          {tab !== 'month' && (
            <div style={{ backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', height: '300px', marginBottom: '30px' }}>
              <canvas ref={canvasRef}></canvas>
            </div>
          )}

          {tab === 'month' && (
            <div style={{ backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', marginBottom: '30px' }}>
              {renderMonthCalendar()}
            </div>
          )}

          {renderDetailedMetrics()}
        </>
      )}

      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '36px', borderTop: 'var(--border)', paddingTop: '20px', marginTop: '20px', marginBottom: '20px' }}>Your Progress</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--accent)', border: 'var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
          <span style={{ fontSize: '12px' }}>LVL</span>
          <span style={{ fontSize: '32px', fontFamily: "'Instrument Serif', serif" }}>{xpData.level}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{currentTitle}</div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--cream)', border: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (xpData.total / nextThreshold) * 100)}%`, height: '100%', backgroundColor: 'var(--black)' }}></div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '5px', fontWeight: 'bold' }}>
            {xpData.total} / {nextThreshold} XP to Level {xpData.level + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const tabBtn = { backgroundColor: 'var(--white)', color: 'var(--black)' };
const activeTabBtn = { backgroundColor: 'var(--accent)', color: 'var(--black)' };
const cardStyle = { flex: 1, backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', padding: '15px', textAlign: 'center' };
const cardTitle = { fontSize: '14px', color: 'var(--muted)', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' };
const cardVal = { fontSize: '32px', fontFamily: "'Instrument Serif', serif" };
const calHeader = { textAlign: 'center', fontSize: '12px', color: 'var(--muted)', paddingBottom: '10px', fontWeight: 'bold' };
const calCell = { aspectRatio: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'var(--border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', color: 'var(--black)' };
const calCellEmpty = { ...calCell, border: 'none', backgroundColor: 'transparent' };

export default Analytics;
