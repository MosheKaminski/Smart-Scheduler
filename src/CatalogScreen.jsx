import { useState, useEffect } from 'react';
import Icon from './Icon';
import { Chip, DiffChip } from './shared';
import { upsertLecturer, deleteLecturer } from './db';

/* ─── helpers ─── */
const DAYS_HE = { sun:'ראשון', mon:'שני', tue:'שלישי', wed:'רביעי', thu:'חמישי', fri:'שישי' };
const HOURS    = [8,9,10,11,12,13,14,15,16,17,18,19];
const DIFFS    = [['easy','קל'],['medium','בינוני'],['hard','קשה'],['brutal','רצחני']];
const CATS     = [['cs','מדעי המחשב'],['math','מתמטיקה'],['biz','עסקים/משפט'],['other','אחר']];
const CAT_PREFIX = { cs:'CS', math:'MATH', biz:'BIZ', other:'GEN' };

function genCode(category, existingCodes) {
  const prefix = CAT_PREFIX[category] || 'GEN';
  const nums = (existingCodes || [])
    .filter(c => c.startsWith(prefix + '-'))
    .map(c => parseInt(c.split('-')[1]))
    .filter(n => !isNaN(n));
  const base = nums.length ? Math.max(...nums) + 10 : 1010;
  return `${prefix}-${Math.ceil(base / 10) * 10}`;
}

function lecturerFullName(l) {
  return l.title ? `${l.title} ${l.name}` : l.name;
}

/* ─── Lecturers Management Modal ─── */
const LecturersModal = ({ open, onClose, lecturers, onRefresh }) => {
  const [name, setName]       = useState('');
  const [title, setTitle]     = useState('');
  const [email, setEmail]     = useState('');
  const [dept, setDept]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [err, setErr]         = useState('');

  if (!open) return null;

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setErr('');
    try {
      await upsertLecturer({ name: name.trim(), title: title.trim(), email: email.trim(), department: dept.trim() });
      setName(''); setTitle(''); setEmail(''); setDept('');
      await onRefresh();
    } catch (e) {
      setErr(e?.message || 'שגיאה בהוספת מרצה');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    setErr('');
    try { await deleteLecturer(id); await onRefresh(); }
    catch (e) { setErr(e?.message || 'שגיאה במחיקת מרצה'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 620, marginTop: '5vh', alignSelf: 'flex-start', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">ניהול מרצים</h2>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>{lecturers.length} מרצים במערכת</div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {/* Add new lecturer */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>הוספת מרצה חדש</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>תואר</label>
              <select className="input" value={title} onChange={e => setTitle(e.target.value)}>
                <option value="">ללא</option>
                <option>ד"ר</option>
                <option>פרופ</option>
                <option>עו"ד</option>
                <option>מר/גב׳</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>שם מלא *</label>
              <input className="input" placeholder="ישראל ישראלי" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>מחלקה</label>
              <input className="input" placeholder="מדעי המחשב" value={dept} onChange={e => setDept(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>אימייל</label>
              <input className="input" type="email" placeholder="name@university.ac.il" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" disabled={!name.trim() || saving} onClick={handleAdd}
            style={!name.trim() ? { opacity: 0.45, pointerEvents: 'none' } : {}}>
            <Icon name="plus" size={13} /> {saving ? 'שומר...' : 'הוסף מרצה'}
          </button>
          {err && <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontFamily: 'var(--font-body)', fontSize: 12, color: '#b91c1c' }}>{err}</div>}
        </div>

        {/* Lecturers list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {lecturers.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>אין מרצים עדיין</div>
          ) : lecturers.map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--brand-press)', flexShrink: 0 }}>
                {(l.name || '?')[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{lecturerFullName(l)}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                  {[l.department, l.email].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
                style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--fg-muted)' }}>
                {deleting === l.id ? '...' : 'מחק'}
              </button>
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Course Edit / Create Modal ─── */
const CourseModal = ({ open, onClose, course, allCodes, lecturers, onSave, isNew }) => {
  const [code, setCode]         = useState('');
  const [name, setName]         = useState('');
  const [credits, setCredits]   = useState(3);
  const [lecturerId, setLecturerId] = useState('');
  const [diff, setDiff]         = useState('medium');
  const [category, setCategory] = useState('cs');
  const [day, setDay]           = useState('mon');
  const [startH, setStartH]     = useState(10);
  const [endH, setEndH]         = useState(12);
  const [room, setRoom]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  useEffect(() => {
    if (!open) return;
    if (course) {
      setCode(course.code || '');
      setName(course.name || '');
      setCredits(course.credits || 3);
      setDiff(course.diff || 'medium');
      setCategory(course.category || 'cs');
      setDay(course.day || 'mon');
      setStartH(course.start_hour ?? course.start ?? 10);
      setEndH(course.end_hour ?? course.end ?? 12);
      setRoom(course.room || '');
      // try to match lecturer by name
      const found = lecturers.find(l => lecturerFullName(l) === course.lecturer);
      setLecturerId(found?.id || '');
    } else {
      setName(''); setCredits(3); setDiff('medium'); setLecturerId('');
      setDay('mon'); setStartH(10); setEndH(12); setRoom('');
      setCategory('cs');
      setCode(genCode('cs', allCodes));
    }
  }, [open, course]);

  // Auto-update code when category changes (only for new courses)
  useEffect(() => {
    if (open && isNew) setCode(genCode(category, allCodes));
  }, [category, open, isNew]);

  if (!open) return null;

  const selectedLecturer = lecturers.find(l => l.id === lecturerId);
  const lecturerName = selectedLecturer ? lecturerFullName(selectedLecturer) : '';

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setErr('');
    const COLORS = ['av-purple','av-pink','av-mint','av-sky','av-amber','av-coral'];
    try {
      await onSave({
        code: code.trim(),
        name: name.trim(),
        credits,
        lecturer: lecturerName,
        diff,
        category,
        rating: course?.rating ?? 0,
        enrolled: course?.enrolled ?? 0,
        day,
        start_hour: startH,
        end_hour: endH,
        room: room.trim(),
        color: course?.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      onClose();
    } catch (e) {
      setErr(e?.message || 'שגיאה בשמירת הקורס');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 580, marginTop: '4vh', alignSelf: 'flex-start' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">{isNew ? 'קורס חדש בקטלוג' : `עריכת קורס — ${course?.code}`}</h2>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
              {isNew ? 'הקורס יתווסף לקטלוג ויהיה זמין לרשמה' : 'שמור לעדכון פרטי הקורס'}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Course details */}
          <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>פרטי הקורס</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>קטגוריה</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>קוד קורס (אוטומטי)</label>
                <input className="input" value={code} readOnly
                  style={{ fontFamily: 'var(--font-mono)', background: 'var(--neutral-100)', color: 'var(--fg-muted)', cursor: 'not-allowed' }} />
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>שם הקורס *</label>
              <input className="input" placeholder="מבוא למדעי המחשב" value={name} onChange={e => setName(e.target.value)} autoFocus={isNew} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>מרצה</label>
                <select className="input" value={lecturerId} onChange={e => setLecturerId(e.target.value)}>
                  <option value="">— ללא מרצה —</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{lecturerFullName(l)}{l.department ? ` · ${l.department}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>נ"ז</label>
                <input className="input" type="number" min={1} max={8} value={credits} onChange={e => setCredits(+e.target.value)} />
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>רמת קושי</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DIFFS.map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setDiff(v)}
                    className={`chip ${diff === v ? 'chip-brand' : 'chip-outline'}`}
                    style={{ cursor: 'pointer', padding: '6px 14px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>מועד ומיקום</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>יום</label>
                <select className="input" value={day} onChange={e => setDay(e.target.value)}>
                  {Object.entries(DAYS_HE).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>שעת התחלה</label>
                <select className="input" value={startH} onChange={e => { setStartH(+e.target.value); if (+e.target.value >= endH) setEndH(+e.target.value + 2); }}>
                  {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>שעת סיום</label>
                <select className="input" value={endH} onChange={e => setEndH(+e.target.value)}>
                  {HOURS.filter(h => h > startH).map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>חדר</label>
                <input className="input" placeholder="301" value={room} onChange={e => setRoom(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          {err && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontFamily: 'var(--font-body)', fontSize: 12, color: '#b91c1c' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
            <button className="btn btn-primary" disabled={!name.trim() || saving}
              style={!name.trim() ? { opacity: 0.45, pointerEvents: 'none' } : {}}
              onClick={handleSave}>
              <Icon name="check" size={14} /> {saving ? 'שומר...' : isNew ? 'הוסף לקטלוג' : 'שמור שינויים'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Filter bar constants ─── */
const CAT_FILTERS = [
  { key:'all', label:'הכל' }, { key:'cs', label:'מדעי המחשב' },
  { key:'math', label:'מתמטיקה' }, { key:'biz', label:'עסקים/משפט' }, { key:'other', label:'אחר' },
];
const DIFF_FILTERS = [
  { key:'all', label:'כל הרמות' }, { key:'easy', label:'קל' },
  { key:'medium', label:'בינוני' }, { key:'hard', label:'קשה' }, { key:'brutal', label:'רצחני' },
];

/* ─── Main CatalogScreen ─── */
export const CatalogScreen = ({ allCourses = [], enrolledCodes = new Set(), lecturers = [], onEnroll, onSaveCourse, onRefreshLecturers }) => {
  const [q, setQ]                 = useState('');
  const [category, setCategory]   = useState('all');
  const [diff, setDiff]           = useState('all');
  const [editCourse, setEditCourse] = useState(null);  // null=closed, false=new, obj=edit
  const [lecturersOpen, setLecturersOpen] = useState(false);

  const filtered = allCourses.filter(c => {
    if (category !== 'all' && c.category !== category) return false;
    if (diff !== 'all' && c.diff !== diff) return false;
    if (q.trim()) {
      const n = q.toLowerCase();
      return (c.name||'').toLowerCase().includes(n) ||
             (c.code||'').toLowerCase().includes(n) ||
             (c.lecturer||'').toLowerCase().includes(n);
    }
    return true;
  });

  const allCodes = allCourses.map(c => c.code);

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>קטלוג קורסים</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            {filtered.length} קורסים · {enrolledCodes.size} רשום · לחץ על קורס לעריכה
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setLecturersOpen(true)}>
            <Icon name="users" size={14} /> ניהול מרצים ({lecturers.length})
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditCourse(false)}>
            <Icon name="plus" size={14} /> הוסף קורס חדש
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Icon name="search" size={15} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingInlineEnd: 36, width: '100%' }}
            placeholder="חפש קורס, קוד, מרצה..."
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="tabs" style={{ flexShrink: 0 }}>
          {CAT_FILTERS.map(c => (
            <button key={c.key} className={`tab ${category === c.key ? 'active' : ''}`} onClick={() => setCategory(c.key)}>{c.label}</button>
          ))}
        </div>
        <select className="input" style={{ width: 120, flexShrink: 0 }} value={diff} onChange={e => setDiff(e.target.value)}>
          {DIFF_FILTERS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
        </select>
      </div>

      {/* Course list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center', color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            לא נמצאו קורסים תואמים
          </div>
        ) : filtered.map((c, i) => {
          const isEnrolled = enrolledCodes.has(c.code);
          const dotColor = c.color?.includes('purple') ? '#8b5cf6' : c.color?.includes('pink') ? '#ec4899' :
                           c.color?.includes('mint')   ? '#14b8a6' : c.color?.includes('sky')  ? '#0ea5e9' :
                           c.color?.includes('amber')  ? '#f59e0b' : c.color?.includes('coral') ? '#ef4444' : '#22c55e';
          return (
            <div key={c.code} onClick={() => setEditCourse(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                background: isEnrolled ? 'var(--brand-soft)' : 'transparent',
                cursor: 'pointer', transition: 'background 120ms',
              }}
              onMouseEnter={e => { if (!isEnrolled) e.currentTarget.style.background = 'var(--neutral-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isEnrolled ? 'var(--brand-soft)' : 'transparent'; }}>

              <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{c.code}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>{c.name}</span>
                  {isEnrolled && <Chip kind="brand">רשום ✓</Chip>}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                  {c.lecturer && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{c.lecturer}</span>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{c.credits} נ"ז</span>
                  {c.day && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>יום {DAYS_HE[c.day]} {String(c.start_hour||c.start||0).padStart(2,'0')}:00–{String(c.end_hour||c.end||0).padStart(2,'0')}:00</span>}
                  {c.room && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>חדר {c.room}</span>}
                  {c.rating > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#b45309' }}>★ {c.rating}</span>}
                </div>
              </div>

              <DiffChip d={c.diff} />

              <button className={isEnrolled ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}
                style={{ flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); if (!isEnrolled) onEnroll(c); }}>
                {isEnrolled ? '✓ רשום' : <><Icon name="plus" size={12} /> הוסף לסמסטר</>}
              </button>

              <Icon name="edit" size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Course edit/create modal */}
      <CourseModal
        open={editCourse !== null}
        onClose={() => setEditCourse(null)}
        course={editCourse || null}
        isNew={editCourse === false}
        allCodes={allCodes}
        lecturers={lecturers}
        onSave={async (data) => { await onSaveCourse(data); setEditCourse(null); }}
      />

      {/* Lecturers modal */}
      <LecturersModal
        open={lecturersOpen}
        onClose={() => setLecturersOpen(false)}
        lecturers={lecturers}
        onRefresh={onRefreshLecturers}
      />
    </div>
  );
};
