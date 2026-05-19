import { useState } from 'react';
import Icon from './Icon';
import { StatCard } from './shared';

const SEMESTERS = [
  { value: 'y1s1', label: 'שנה א׳ סמסטר א׳' },
  { value: 'y1s2', label: 'שנה א׳ סמסטר ב׳' },
  { value: 'y2s1', label: 'שנה ב׳ סמסטר א׳' },
  { value: 'y2s2', label: 'שנה ב׳ סמסטר ב׳' },
  { value: 'y3s1', label: 'שנה ג׳ סמסטר א׳' },
  { value: 'y3s2', label: 'שנה ג׳ סמסטר ב׳' },
  { value: 'y4s1', label: 'שנה ד׳ סמסטר א׳' },
  { value: 'y4s2', label: 'שנה ד׳ סמסטר ב׳' },
];

const AddGradeModal = ({ open, onClose, onAdd, courses = [] }) => {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits]       = useState('');
  const [grade, setGrade]           = useState('');
  const [semester, setSemester]     = useState('y1s1');
  const [status, setStatus]         = useState('completed');
  const [err, setErr]               = useState('');

  const reset = () => { setCourseCode(''); setCourseName(''); setCredits(''); setGrade(''); setSemester('y1s1'); setStatus('completed'); setErr(''); };

  const pickCourse = (c) => {
    setCourseCode(c.code);
    setCourseName(c.name);
    setCredits(String(c.credits ?? ''));
    setSemester(c.semester ?? 'y1s1');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!courseCode.trim()) { setErr('נא להזין קוד קורס'); return; }
    if (!courseName.trim()) { setErr('נא להזין שם קורס'); return; }
    const cr = Number(credits);
    if (!cr || cr < 1) { setErr('נא להזין מספר נקודות זכות תקין'); return; }
    if (status === 'completed') {
      const g = Number(grade);
      if (!grade || g < 0 || g > 100) { setErr('נא להזין ציון בין 0 ל-100'); return; }
    }
    onAdd({
      course_code: courseCode.trim(),
      course_name: courseName.trim(),
      credits: cr,
      grade: status === 'completed' ? Number(grade) : null,
      semester,
      status,
    });
    handleClose();
  };

  if (!open) return null;
  return (
    <div className="scrim" onClick={handleClose}>
      <div className="modal" style={{ width: 520, alignSelf: 'flex-start', marginTop: '8vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">הוסף ציון</h2>
          <button className="btn-icon" onClick={handleClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pick from enrolled courses */}
          {courses.length > 0 && (
            <div className="field">
              <label>בחר מהקורסים שלך</label>
              <select className="input" value="" onChange={e => { const c = courses.find(x => x.code === e.target.value); if (c) pickCourse(c); }}>
                <option value="">— בחר קורס —</option>
                {courses.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            <div className="field">
              <label>קוד קורס</label>
              <input className="input" placeholder="CS101" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
            </div>
            <div className="field">
              <label>שם הקורס</label>
              <input className="input" placeholder="מבוא לתכנות" value={courseName} onChange={e => setCourseName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="field">
              <label>נקודות זכות</label>
              <input className="input" type="number" min="1" max="10" placeholder="3" value={credits} onChange={e => setCredits(e.target.value)} />
            </div>
            <div className="field">
              <label>סמסטר</label>
              <select className="input" value={semester} onChange={e => setSemester(e.target.value)}>
                {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>סטטוס</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="completed">הושלם</option>
                <option value="in-progress">בתהליך</option>
              </select>
            </div>
          </div>

          {status === 'completed' && (
            <div className="field">
              <label>ציון סופי (0–100)</label>
              <input className="input" type="number" min="0" max="100" placeholder="85" value={grade} onChange={e => setGrade(e.target.value)} />
            </div>
          )}

          {err && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#dc2626', padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>{err}</div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={handleClose}>ביטול</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Icon name="plus" size={14} /> שמור ציון
          </button>
        </div>
      </div>
    </div>
  );
};

const gradeColor = (g) => g >= 90 ? '#15803d' : g >= 80 ? 'var(--fg-strong)' : g >= 70 ? '#b45309' : '#b91c1c';

export const GradesScreen = ({ grades = [], courses = [], onNavigate, onAddGrade }) => {
  const [addOpen, setAddOpen] = useState(false);

  const completed   = grades.filter(g => g.status === 'completed');
  const inProgress  = grades.filter(g => g.status === 'in-progress');

  const calcAvg = (entries) => {
    const w   = entries.reduce((s, g) => s + (g.credits ?? 0), 0);
    const sum = entries.reduce((s, g) => s + (g.credits ?? 0) * (g.grade ?? 0), 0);
    return w ? sum / w : 0;
  };

  const currentAvg = calcAvg(completed);
  const fmt = (n) => n.toFixed(1);

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>ציונים</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>גליון הציונים האישי שלך</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Icon name="plus" size={15} /> הוסף ציון
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <StatCard label="ממוצע מצטבר" value={fmt(currentAvg).split('.')[0]} unit={'.' + fmt(currentAvg).split('.')[1]} trend={`${completed.length} קורסים`} />
        <StatCard label="נקודות זכות" value={String(completed.reduce((s, g) => s + (g.credits ?? 0), 0))} unit="נ״ז" trend="הושלמו" />
        <StatCard label="קורסים בתהליך" value={String(inProgress.length)} unit="" trend={inProgress.length ? inProgress.map(g => g.course_code).join(', ') : 'אין כרגע'} />
      </div>

      {/* Completed grades table */}
      <div className="card padded">
        <div className="section-head">
          <div>
            <h2>קורסים שהושלמו</h2>
            <div className="sub">{completed.length} קורסים · {completed.reduce((s, g) => s + (g.credits ?? 0), 0)} נ"ז</div>
          </div>
        </div>
        {completed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            אין עדיין ציונים · לחץ "הוסף ציון" כדי להתחיל
          </div>
        ) : (
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
                <tr key={g.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{g.course_code}</td>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>{g.course_name}</td>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)' }}>{g.semester}</td>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-default)' }}>{g.credits}</td>
                  <td style={{ padding: '12px 0', textAlign: 'end', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: gradeColor(g.grade), fontVariantNumeric: 'tabular-nums' }}>{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="card padded">
          <div className="section-head">
            <div>
              <h2>קורסים בתהליך</h2>
              <div className="sub">{inProgress.length} קורסים פעילים</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
            <thead>
              <tr style={{ textAlign: 'start', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '8px 0', fontWeight: 700 }}>קוד</th>
                <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'start' }}>שם הקורס</th>
                <th style={{ padding: '8px 0', fontWeight: 700 }}>סמסטר</th>
                <th style={{ padding: '8px 0', fontWeight: 700, textAlign: 'end' }}>נ"ז</th>
              </tr>
            </thead>
            <tbody>
              {inProgress.map(g => (
                <tr key={g.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{g.course_code}</td>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>{g.course_name}</td>
                  <td style={{ padding: '12px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)' }}>{g.semester}</td>
                  <td style={{ padding: '12px 0', textAlign: 'end', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-muted)' }}>{g.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* What-if CTA */}
      <div className="card padded" style={{ background: 'linear-gradient(135deg, #f0fdf4, #f7fee7)', borderColor: '#bbf7d0', cursor: 'pointer' }}
        onClick={() => onNavigate?.('whatif')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #a3e635, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <Icon name="flask" size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#14532d' }}>סימולטור What-if</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534', marginTop: 2 }}>
                שנה ציונים תיאורטיים ובדוק כיצד זה משפיע על הממוצע המצטבר שלך
              </div>
            </div>
          </div>
          <Icon name="arrow-left" size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
        </div>
      </div>

      <AddGradeModal open={addOpen} onClose={() => setAddOpen(false)} courses={courses} onAdd={async (g) => {
        try { await onAddGrade(g); }
        catch {}
      }} />
    </div>
  );
};
