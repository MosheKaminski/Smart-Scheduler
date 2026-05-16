import Icon from './Icon';
import { Chip, DiffChip } from './shared';
import { RECOMMENDED } from './data';

export const RecommendScreen = ({ onCoursePick }) => {
  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #22c55e, #a3e635)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Icon name="sparkles" size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>המלצות בשבילך</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>לפי הקורסים שלקחת, ההעדפות שלך וסטודנטים דומים</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {RECOMMENDED.map(r => (
          <div key={r.code} className="card padded" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => onCoursePick && onCoursePick(r)}>
            <div style={{ position: 'absolute', insetInline: 0, top: 0, height: 4, background: 'linear-gradient(90deg, #22c55e, #a3e635)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', fontWeight: 700 }}>{r.code}</div>
              <Chip kind="accent">★ {r.rating}</Chip>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-strong)', margin: '8px 0 12px', letterSpacing: '-0.01em' }}>{r.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)', lineHeight: 1.55, marginBottom: 14 }}>{r.why}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
              <DiffChip d={r.diff} />
              <button className="btn btn-primary btn-sm"><Icon name="plus" size={12} /> הוסף</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card padded">
        <div className="section-head">
          <div>
            <h2>סטודנטים דומים לך אהבו גם...</h2>
            <div className="sub">מבוסס על 124 סטודנטים שלקחו את אותם 3 קורסי קדם שלך</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { code: 'CS-3700', name: 'תורת המשחקים', diff: 'hard', pct: '76%' },
            { code: 'STAT-2010', name: 'הסתברות וסטטיסטיקה', diff: 'medium', pct: '68%' },
            { code: 'CS-4200', name: 'ראייה ממוחשבת', diff: 'brutal', pct: '52%' },
            { code: 'PHIL-1010', name: 'מבוא לפילוסופיה', diff: 'easy', pct: '44%' },
          ].map(r => (
            <div key={r.code} style={{ padding: 14, background: 'var(--neutral-50)', borderRadius: 12, cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{r.code}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', margin: '4px 0 8px' }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <DiffChip d={r.diff} />
                <Chip kind="brand">{r.pct} המליצו</Chip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
