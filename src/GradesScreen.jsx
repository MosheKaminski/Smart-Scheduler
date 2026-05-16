import { useState } from 'react';
import Icon from './Icon';
import { StatCard } from './shared';
import { GRADES } from './data';

export const GradesScreen = () => {
  const [whatif, setWhatif] = useState({ 'CS-2010': 88, 'CS-3050': 85 });

  const completed = GRADES.filter(g => g.status === 'completed');
  const inProgress = GRADES.filter(g => g.status === 'in-progress');

  const calcAvg = (entries) => {
    const w = entries.reduce((s, g) => s + g.credits, 0);
    const sum = entries.reduce((s, g) => s + g.credits * g.grade, 0);
    return w ? (sum / w) : 0;
  };
  const currentAvg = calcAvg(completed);
  const projected = calcAvg([...completed, ...inProgress.map(g => ({ ...g, grade: whatif[g.code] || 80 }))]);

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>ציונים &amp; What-if</h1>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>גליון הציונים שלך + סימולציה של ממוצע עתידי</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 14 }}>
        <StatCard label="ממוצע נוכחי" value={currentAvg.toFixed(1).split('.')[0]} unit={'.' + currentAvg.toFixed(1).split('.')[1]} trend="↑ 1.2 מהסמסטר הקודם" />
        <StatCard label="ממוצע מתוכנן (What-if)" value={projected.toFixed(1).split('.')[0]} unit={'.' + projected.toFixed(1).split('.')[1]} trend={projected > currentAvg ? `↑ ${(projected - currentAvg).toFixed(1)} צפוי` : `↓ ${(currentAvg - projected).toFixed(1)}`} trendKind={projected > currentAvg ? 'up' : 'down'} />
        <div className="card padded">
          <div className="t-overline">מגמת ממוצע · עם הקרנת What-if</div>
          <svg viewBox="0 0 400 80" style={{ width: '100%', height: 80, marginTop: 8 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22c55e" stopOpacity="0.32" />
                <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 55 L 70 50 L 140 40 L 210 32 L 280 28 L 280 80 L 0 80 Z" fill="url(#gfill)" />
            <path d="M 0 55 L 70 50 L 140 40 L 210 32 L 280 28" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 280 28 L 350 22 L 400 18" fill="none" stroke="#84cc16" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
            <circle cx="280" cy="28" r="4" fill="#22c55e" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="18" r="4" fill="#84cc16" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="card padded">
        <div className="section-head">
          <div>
            <h2>קורסים שהושלמו</h2>
            <div className="sub">{completed.length} קורסים · {completed.reduce((s, g) => s + g.credits, 0)} נ"ז</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ textAlign: 'start', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '8px 0', fontWeight: 700 }}>קוד</th>
              <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'start' }}>שם הקורס</th>
              <th style={{ padding: '8px 0', fontWeight: 700 }}>סמסטר</th>
              <th style={{ padding: '8px 0', fontWeight: 700 }}>נ"ז</th>
              <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'end' }}>ציון</th>
            </tr>
          </thead>
          <tbody>
            {completed.map(g => (
              <tr key={g.code} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{g.code}</td>
                <td style={{ padding: '12px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>{g.name}</td>
                <td style={{ padding: '12px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)' }}>{g.semester}</td>
                <td style={{ padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-default)' }}>{g.credits}</td>
                <td style={{ padding: '12px 0', textAlign: 'end', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: g.grade >= 90 ? '#15803d' : g.grade >= 80 ? 'var(--fg-strong)' : '#b45309', fontVariantNumeric: 'tabular-nums' }}>{g.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card padded">
        <div className="section-head">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="flask" size={20} style={{ color: '#a3e635' }} /> סימולטור What-if</h2>
            <div className="sub">הזן ציונים תיאורטיים לקורסים שאתה לומד כעת ובדוק את הממוצע הצפוי</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {inProgress.map(g => (
            <div key={g.code} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1.5fr 80px', alignItems: 'center', gap: 16, padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{g.code}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{g.name}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{g.credits} נ"ז</div>
              <input type="range" min="60" max="100" value={whatif[g.code] || 80} onChange={e => setWhatif({ ...whatif, [g.code]: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#22c55e' }} />
              <input type="number" min="60" max="100" value={whatif[g.code] || 80} onChange={e => setWhatif({ ...whatif, [g.code]: parseInt(e.target.value) || 0 })} className="input" style={{ width: 64, padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
