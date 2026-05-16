import Icon from './Icon';
import { DIFF_CLASS, DIFF_DOT, DIFF_LABEL } from './data';

export const Chip = ({ kind = 'neutral', children, ...rest }) => (
  <span className={`chip chip-${kind}`} {...rest}>{children}</span>
);

export const DiffChip = ({ d }) => (
  <span className={`chip ${DIFF_CLASS[d]}`}>
    <span className="dot" style={{ background: DIFF_DOT[d] }} />
    {DIFF_LABEL[d]}
  </span>
);

export const StatCard = ({ label, value, unit, trend, trendKind = 'up' }) => (
  <div className="card padded" style={{ minWidth: 0 }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-muted)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--fg-strong)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
      {value}{unit && <small style={{ fontSize: '0.45em', color: 'var(--fg-muted)', fontWeight: 700, marginInlineStart: 6 }}>{unit}</small>}
    </div>
    {trend && (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 999,
        background: trendKind === 'up' ? 'var(--mint-50)' : trendKind === 'down' ? 'var(--coral-50)' : 'var(--neutral-100)',
        color: trendKind === 'up' ? 'var(--mint-700)' : trendKind === 'down' ? 'var(--coral-700)' : 'var(--neutral-700)' }}>
        {trend}
      </div>
    )}
  </div>
);
