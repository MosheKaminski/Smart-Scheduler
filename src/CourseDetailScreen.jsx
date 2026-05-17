import Icon from './Icon';
import { Chip, DiffChip } from './shared';

const DAYS_HE = { sun:'ראשון', mon:'שני', tue:'שלישי', wed:'רביעי', thu:'חמישי', fri:'שישי' };
const CAT_LABELS = { cs:'מדעי המחשב', math:'מתמטיקה', biz:'עסקים / משפט', other:'אחר' };
const DOT_COLORS = {
  'av-purple':'#8b5cf6','av-pink':'#ec4899','av-mint':'#14b8a6',
  'av-sky':'#0ea5e9','av-amber':'#f59e0b','av-coral':'#ef4444',
};

export const CourseDetailScreen = ({ course, onBack }) => {
  if (!course) return null;

  const startH = course.start_hour ?? course.start;
  const endH   = course.end_hour   ?? course.end;
  const dotColor = DOT_COLORS[course.color] ?? '#22c55e';

  const stats = [
    course.credits    != null && ['נקודות זכות', `${course.credits} נ"ז`],
    course.enrolled   != null && ['סטודנטים רשומים', course.enrolled],
    course.rating     != null && course.rating > 0 && ['דירוג ממוצע', `★ ${course.rating}`],
    CAT_LABELS[course.category] && ['קטגוריה', CAT_LABELS[course.category]],
  ].filter(Boolean);

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', boxShadow: 'none' }} onClick={onBack}>
        <Icon name="arrow-right" size={14} /> חזור
      </button>

      {/* Header card */}
      <div className="card padded" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', insetInline: 0, top: 0, height: 4, background: dotColor }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 700 }}>
              {course.code}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, margin: '4px 0 10px', color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>
              {course.name}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <DiffChip d={course.diff} />
              {course.rating > 0 && <Chip kind="brand">★ {course.rating}</Chip>}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {stats.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 22 }}>
            {stats.map(([label, val]) => (
              <div key={label} style={{ padding: 14, background: 'var(--neutral-50)', borderRadius: 12 }}>
                <div className="t-overline">{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginTop: 4, color: 'var(--fg-strong)' }}>{val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule + lecturer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Schedule */}
        <div className="card padded">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="calendar" size={16} /> מועד ומיקום
          </h2>
          {course.day ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="יום" value={`יום ${DAYS_HE[course.day] ?? course.day}`} />
              {startH != null && endH != null && (
                <Row label="שעות" value={`${String(startH).padStart(2,'0')}:00 – ${String(endH).padStart(2,'0')}:00`} />
              )}
              {course.room && <Row label="חדר" value={course.room} />}
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>לא הוגדר מועד</div>
          )}
        </div>

        {/* Lecturer */}
        <div className="card padded">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="user" size={16} /> מרצה
          </h2>
          {course.lecturer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--brand-press)', flexShrink: 0 }}>
                {course.lecturer[0]}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>
                {course.lecturer}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>לא הוגדר מרצה</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>{value}</span>
  </div>
);
