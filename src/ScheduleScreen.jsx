import { useState } from 'react';
import Icon from './Icon';
import { DAYS, HOURS } from './data';

export const ScheduleScreen = ({ courses, setCourses, onCoursePick }) => {
  const [semester, setSemester] = useState('spring');

  const grid = {};
  for (const c of courses) {
    for (let h = c.start; h < c.end; h++) {
      grid[`${c.day}-${h}`] = c;
    }
  }

  const categoryStyle = (cat) => ({
    cs:   { bg: 'linear-gradient(135deg, #f0fdf4, #ecfccb)', border: '#bbf7d0' },
    math: { bg: 'linear-gradient(135deg, #f0fdfa, #eff6ff)', border: '#ccfbf1' },
    biz:  { bg: 'linear-gradient(135deg, #fffbeb, #fef2f2)', border: '#fef3c7' },
  })[cat] || { bg: 'white', border: 'var(--border-subtle)' };

  const removeCourse = (code) => setCourses(courses.filter(c => c.code !== code));

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>מערכת השעות</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>{courses.length} קורסים · {courses.reduce((s, c) => s + c.credits, 0)} נ"ז · {courses.some(c => c.conflict) ? '⚠ התנגשות אחת' : 'אין התנגשויות'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="tabs">
            <button className={`tab ${semester === 'fall' ? 'active' : ''}`} onClick={() => setSemester('fall')}>סתיו '25</button>
            <button className={`tab ${semester === 'spring' ? 'active' : ''}`} onClick={() => setSemester('spring')}>אביב '26</button>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ boxShadow: 'var(--shadow-xs)' }}><Icon name="download" size={14} /> ייצא ל-iCal</button>
          <button className="btn btn-primary btn-sm" onClick={() => onCoursePick && onCoursePick()}><Icon name="plus" size={14} /> הוסף קורס</button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)', gap: 6 }}>
          <div />
          {DAYS.map(d => (
            <div key={d.key} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.label}</div>
          ))}
          {HOURS.map(h => (
            <div key={h} style={{ display: 'contents' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6 }}>
                {String(h).padStart(2, '0')}:00
              </div>
              {DAYS.map(d => {
                const c = grid[`${d.key}-${h}`];
                if (c && c.start !== h) return <div key={d.key} />;
                if (!c) return <div key={d.key} style={{ height: 56, borderRadius: 10, border: '1px dashed var(--border-subtle)', background: 'transparent' }} />;
                const span = c.end - c.start;
                const cs = categoryStyle(c.category);
                return (
                  <div key={d.key} style={{
                    gridRow: `span ${span}`,
                    height: 56 * span + 6 * (span - 1),
                    borderRadius: 12, padding: '10px 12px',
                    background: c.conflict ? '#fef2f2' : cs.bg,
                    border: c.conflict ? '1.5px solid #ef4444' : `1px solid ${cs.border}`,
                    position: 'relative', cursor: 'pointer',
                  }} onClick={() => onCoursePick && onCoursePick(c)}>
                    {c.conflict && <span style={{ position: 'absolute', top: -8, insetInlineEnd: -6, background: '#ef4444', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 9, padding: '3px 7px', borderRadius: 999, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>התנגשות</span>}
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', lineHeight: 1.2 }}>{c.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 4 }}>{c.code} · חדר {c.room}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-default)', marginTop: 2 }}>{c.lecturer}</div>
                    <button onClick={(e) => { e.stopPropagation(); removeCourse(c.code); }} style={{ position: 'absolute', top: 6, insetInlineStart: 6, background: 'rgba(255,255,255,0.7)', border: 0, borderRadius: 8, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fg-muted)' }}><Icon name="x" size={12} /></button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {courses.some(c => c.conflict) && (
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, background: '#fef2f2', borderColor: '#fee2e2' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#b91c1c' }}>התנגשות שעות זוהתה</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#7f1d1d', marginTop: 2 }}>'בסיסי נתונים' חופף ל'דיני חוזים' ביום שני 12:00–14:00</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ boxShadow: 'var(--shadow-xs)' }}>הצע פתרון</button>
        </div>
      )}
    </div>
  );
};
