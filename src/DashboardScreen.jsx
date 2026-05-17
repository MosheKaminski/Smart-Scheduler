import Icon from './Icon';
import { Chip, DiffChip, StatCard } from './shared';

const TodayClass = ({ c, isNow }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: '1px solid var(--border-subtle)' }}>
    <div style={{ width: 56, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: isNow ? 'var(--brand)' : 'var(--fg-muted)', fontWeight: 700 }}>
      {String(c.start).padStart(2, '0')}:00
    </div>
    <div style={{ width: 4, height: 36, borderRadius: 2, background: isNow ? 'var(--brand)' : 'var(--border-subtle)' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{c.name}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{c.lecturer} · חדר {c.room}</div>
    </div>
    {isNow && <Chip kind="brand">עכשיו</Chip>}
  </div>
);

export const DashboardScreen = ({ courses, student, recommendations, onNavigate }) => {
  const todayCourses = (courses ?? []).filter(c => c.day === 'mon').sort((a, b) => a.start - b.start);
  const firstName = student?.name?.split(' ')[0] ?? 'סטודנט';
  const gpa = student?.gpa ?? 0;
  const credits = student?.credits ?? 0;

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card padded" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #65a30d 100%)', color: 'white', border: 0, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>שלום, {firstName}</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: '6px 0 8px' }}>{todayCourses.length} שיעורים היום.</h1>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-sm" style={{ background: 'white', color: 'var(--brand-press)', boxShadow: '0 2px 0 0 rgba(0,0,0,0.18)' }} onClick={() => onNavigate('schedule')}>פתח מערכת שעות</button>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.18)', color: 'white', boxShadow: 'none' }} onClick={() => onNavigate('recommend')}>+ הוסף קורס</button>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 88, lineHeight: 1, opacity: 0.18 }}>{credits}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="ממוצע מצטבר" value={String(gpa).split('.')[0]} unit={'.' + (String(gpa).split('.')[1] || '0')} trend="↑ 1.2 מהסמסטר הקודם" />
        <StatCard label='נ"ז שהושלמו' value={String(credits)} unit={`/${student?.credits_required ?? 120}`} trend={`${Math.round(credits / (student?.credits_required ?? 120) * 100)}% מהתואר`} trendKind="flat" />
        <StatCard label="עומס סמסטר" value={String(courses?.length ?? 0)} unit="/8" trend="⚠ בדוק קורסים קשים" trendKind="down" />
        <StatCard label="דירוג ממוצע" value="4.4" unit="★" trend="ממרצים שדירגת" trendKind="flat" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div className="card padded">
          <div className="section-head">
            <div>
              <h2>היום · יום שני</h2>
              <div className="sub">{todayCourses.length} שיעורים</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ boxShadow: 'none' }} onClick={() => onNavigate('schedule')}>ראה הכל ←</button>
          </div>
          <div style={{ marginTop: -8 }}>
            {todayCourses.map((c, i) => <TodayClass key={c.code} c={c} isNow={i === 0} />)}
          </div>
        </div>

        <div className="card padded">
          <div className="section-head">
            <div>
              <h2>מגמת ממוצע</h2>
              <div className="sub">8 סמסטרים אחרונים</div>
            </div>
            <Chip kind="brand"><Icon name="trending-up" size={12} /> ↑ 1.2</Chip>
          </div>
          <svg viewBox="0 0 400 130" preserveAspectRatio="none" style={{ width: '100%', height: 130 }}>
            <defs>
              <linearGradient id="dg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#22c55e" stopOpacity="0.32" />
                <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 90 L 50 85 L 100 92 L 150 70 L 200 64 L 250 50 L 300 40 L 350 32 L 400 22 L 400 130 L 0 130 Z" fill="url(#dg1)" />
            <path d="M 0 90 L 50 85 L 100 92 L 150 70 L 200 64 L 250 50 L 300 40 L 350 32 L 400 22" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x, i) => (
              <circle key={i} cx={x} cy={[90, 85, 92, 70, 64, 50, 40, 32, 22][i]} r="3.5" fill="white" stroke="#22c55e" strokeWidth="2" />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 6 }}>
            <span>'21א</span><span>'22א</span><span>'22ב</span><span>'23א</span><span>'23ב</span><span>'24א</span><span>'24ב</span><span>'25א</span><span>'25ב</span>
          </div>
        </div>
      </div>

      <div className="card padded">
        <div className="section-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #84cc16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Icon name="sparkles" size={18} />
            </div>
            <div>
              <h2>סטודנטים כמוך אהבו</h2>
              <div className="sub">המלצות חכמות לסמסטר הבא</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ boxShadow: 'none' }} onClick={() => onNavigate('recommend')}>ראה את כל ההמלצות ←</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {(recommendations ?? []).map(r => (
            <div key={r.code} className="card tight" style={{ background: 'var(--neutral-50)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600 }}>{r.code}</div>
                <Chip kind="accent">★ {r.rating}</Chip>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)', margin: '6px 0 10px' }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.45, marginBottom: 10 }}>{r.why}</div>
              <DiffChip d={r.diff} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
