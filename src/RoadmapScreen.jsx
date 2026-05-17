import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { DiffChip, Chip } from './shared';
import { SEMESTERS, STATUSES, YEAR_LABELS, SEM_LABELS } from './semesters';

const DOT_COLORS = {
  'av-purple':'#8b5cf6','av-pink':'#ec4899','av-mint':'#14b8a6',
  'av-sky':'#0ea5e9','av-amber':'#f59e0b','av-coral':'#ef4444',
};

function loadLevel(credits) {
  if (credits === 0)  return null;
  if (credits <= 14)  return { color: '#16a34a', bg: '#dcfce7', label: 'עומס קל' };
  if (credits <= 20)  return { color: '#d97706', bg: '#fef3c7', label: 'עומס סביר' };
  return               { color: '#dc2626', bg: '#fee2e2', label: 'עומס כבד' };
}

/* ── single course card inside a semester column ── */
const CourseCard = ({ course, currentSem, onRemove, onMove, onStatus }) => {
  const [open, setOpen] = useState(false);
  const status = STATUSES.find(s => s.id === (course.status || 'planned')) ?? STATUSES[0];
  const dot    = DOT_COLORS[course.color] ?? '#22c55e';

  return (
    <div style={{ position: 'relative', margin: '0 8px 6px', padding: '9px 10px', borderRadius: 10,
      background: 'white', border: `1px solid ${status.color}30`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--fg-strong)', lineHeight: 1.35 }}>{course.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{course.code} · {course.credits} נ"ז</div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-muted)', padding: '2px 3px', borderRadius: 4, lineHeight: 1, flexShrink: 0 }}>
          <Icon name="dots" size={13} />
        </button>
      </div>

      <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, padding: '2px 8px', borderRadius: 5, background: status.bg, color: status.color }}>
          {status.label}
        </span>
        <DiffChip d={course.diff} />
      </div>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'absolute', insetInlineEnd: 6, top: '100%', marginTop: 4, zIndex: 20,
          background: 'white', border: '1px solid var(--border-subtle)', borderRadius: 12,
          boxShadow: '0 8px 28px rgba(0,0,0,0.14)', padding: 6, minWidth: 170,
        }}>
          <MenuLabel>שנה סטטוס</MenuLabel>
          {STATUSES.map(s => (
            <MenuBtn key={s.id} color={s.color} active={course.status === s.id}
              onClick={() => { onStatus(s.id); setOpen(false); }}>
              {s.label}
            </MenuBtn>
          ))}
          <Divider />
          <MenuLabel>העבר לסמסטר</MenuLabel>
          {SEMESTERS.filter(s => s.id !== currentSem).map(s => (
            <MenuBtn key={s.id} onClick={() => { onMove(s.id); setOpen(false); }}>
              {s.label}
            </MenuBtn>
          ))}
          <Divider />
          <MenuBtn color="#dc2626" onClick={() => { onRemove(); setOpen(false); }}>הסר מהתואר</MenuBtn>
        </div>
      )}
    </div>
  );
};

const MenuLabel = ({ children }) => (
  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px 2px' }}>{children}</div>
);
const MenuBtn = ({ children, onClick, color, active }) => (
  <button onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '7px 10px', border: 0, borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: color || 'var(--fg-default)', background: active ? '#f8fafc' : 'none' }}>
    {children}
  </button>
);
const Divider = () => <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />;

/* ── course picker modal ── */
const CATS = [
  { key: 'all', label: 'הכל' }, { key: 'cs', label: 'מדעי המחשב' },
  { key: 'math', label: 'מתמטיקה' }, { key: 'biz', label: 'עסקים/משפט' }, { key: 'other', label: 'אחר' },
];

const CoursePickerModal = ({ open, semesterId, semesterLabel, allCourses, enrolledCodes, onEnroll, onNewCourse, onClose }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(''); setCat('all'); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);

  if (!open) return null;

  const available = (allCourses ?? []).filter(c => {
    if (enrolledCodes?.has(c.code)) return false;
    if (cat !== 'all' && c.category !== cat) return false;
    if (q.trim()) {
      const n = q.toLowerCase();
      return (c.name || '').toLowerCase().includes(n) || (c.code || '').toLowerCase().includes(n) || (c.lecturer || '').toLowerCase().includes(n);
    }
    return true;
  });

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 560, marginTop: '5vh', alignSelf: 'flex-start', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        <div className="modal-head">
          <div>
            <h2 className="modal-title">הוסף קורס לסמסטר</h2>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{semesterLabel}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {/* Search + new course */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="search" size={15} style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
            <input ref={inputRef} className="input" style={{ paddingInlineEnd: 34, width: '100%' }}
              placeholder="חפש קורס, קוד, מרצה..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onNewCourse(semesterId); }}>
            <Icon name="plus" size={13} /> קורס חדש
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={cat === c.key ? 'chip chip-brand' : 'chip chip-outline'}
              style={{ cursor: 'pointer', padding: '4px 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Course list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {available.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>
              {q.trim() ? `לא נמצאו קורסים עבור "${q}"` : 'כל הקורסים כבר נרשמת אליהם'}
            </div>
          ) : available.map((c, i) => (
            <div key={c.code} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              transition: 'background 100ms',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{c.code}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                  {c.lecturer && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{c.lecturer}</span>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{c.credits} נ"ז</span>
                </div>
              </div>
              <DiffChip d={c.diff} />
              <button className="btn btn-primary btn-sm" onClick={() => onEnroll(c, semesterId)}>
                + הרשם
              </button>
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{available.length} קורסים זמינים</span>
          <button className="btn btn-secondary" onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
};

/* ── main screen ── */
export const RoadmapScreen = ({ courses = [], student, allCourses = [], enrolledCodes, onAddCourse, onEnrollExisting, onRemoveCourse, onUpdateEnrollment }) => {
  const [pickerSem, setPickerSem] = useState(null); // null = closed, string = semesterId

  const creditsRequired = student?.credits_required ?? 120;

  const bySemester = Object.fromEntries(SEMESTERS.map(s => [s.id, []]));
  courses.forEach(c => {
    const sid = c.semester || 'y1s1';
    (bySemester[sid] ?? bySemester['y1s1']).push(c);
  });

  const completedCredits = courses.filter(c => c.status === 'done').reduce((s, c) => s + (c.credits || 0), 0);
  const plannedCredits   = courses.reduce((s, c) => s + (c.credits || 0), 0);
  const pct = Math.min(100, Math.round(completedCredits / creditsRequired * 100));

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>מפת התואר</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            {courses.length} קורסים מתוכננים · {completedCredits}/{creditsRequired} נ"ז הושלמו
          </div>
        </div>

        {/* Status legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {STATUSES.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Degree progress bar */}
      <div className="card padded" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>התקדמות לתואר</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--brand-press)', fontWeight: 700 }}>{pct}%</div>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: 'var(--neutral-200)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', insetInlineStart: 0, top: 0, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #22c55e, #84cc16)', width: `${pct}%`, transition: 'width 700ms ease' }} />
          {plannedCredits > completedCredits && (
            <div style={{ position: 'absolute', insetInlineStart: `${pct}%`, top: 0, height: '100%', background: '#bbf7d060', width: `${Math.min(100 - pct, Math.round((plannedCredits - completedCredits) / creditsRequired * 100))}%`, transition: 'all 700ms ease' }} />
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>{completedCredits} נ"ז הושלמו</span>
          <span>{plannedCredits} נ"ז מתוכנן</span>
          <span>{creditsRequired} נ"ז נדרש לתואר</span>
        </div>
      </div>

      {/* Semester columns — grouped by year */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth: 1100 }}>
          {[1, 2, 3].map(year => {
            const yearSems = SEMESTERS.filter(s => s.year === year);
            return (
              <div key={year} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--fg-strong)', marginBottom: 10, paddingInlineStart: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {YEAR_LABELS[year]}
                  <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 400 }}>
                    {yearSems.flatMap(s => bySemester[s.id]).reduce((t, c) => t + (c.credits || 0), 0)} נ"ז שנתי
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {yearSems.map(sem => {
                    const semCourses = bySemester[sem.id] || [];
                    const semCredits = semCourses.reduce((s, c) => s + (c.credits || 0), 0);
                    const load = loadLevel(semCredits);
                    return (
                      <div key={sem.id} className="card" style={{ overflow: 'hidden', borderTop: `3px solid ${load?.color ?? 'var(--border-subtle)'}` }}>
                        {/* Column header */}
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{SEM_LABELS[sem.sem]}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{semCourses.length} קורסים · {semCredits} נ"ז</div>
                          </div>
                          {load && (
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, padding: '3px 9px', borderRadius: 6, background: load.bg, color: load.color }}>
                              {load.label}
                            </span>
                          )}
                        </div>

                        {/* Course cards */}
                        <div style={{ padding: '8px 0', minHeight: 60 }}>
                          {semCourses.length === 0 ? (
                            <div style={{ padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>אין קורסים מתוכננים</div>
                          ) : semCourses.map(c => (
                            <CourseCard key={c.code} course={c} currentSem={sem.id}
                              onRemove={() => onRemoveCourse(c.code)}
                              onMove={newSem => onUpdateEnrollment(c.code, { semester: newSem })}
                              onStatus={status => onUpdateEnrollment(c.code, { status })}
                            />
                          ))}
                        </div>

                        {/* Add button */}
                        <button onClick={() => setPickerSem(sem.id)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          width: 'calc(100% - 16px)', margin: '0 8px 10px', padding: '8px 0',
                          border: '1.5px dashed var(--border-subtle)', borderRadius: 9,
                          background: 'transparent', cursor: 'pointer',
                          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--fg-muted)',
                          transition: 'all 150ms',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--fg-muted)'; }}>
                          <Icon name="plus" size={13} /> הוסף קורס
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CoursePickerModal
        open={pickerSem !== null}
        semesterId={pickerSem}
        semesterLabel={SEMESTERS.find(s => s.id === pickerSem)?.label ?? ''}
        allCourses={allCourses}
        enrolledCodes={enrolledCodes}
        onEnroll={(course, semId) => { onEnrollExisting(course, semId); setPickerSem(null); }}
        onNewCourse={(semId) => { setPickerSem(null); onAddCourse(semId); }}
        onClose={() => setPickerSem(null)}
      />

      {/* Year summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[1, 2, 3].map(year => {
          const yearCourses = courses.filter(c => {
            const sem = SEMESTERS.find(s => s.id === (c.semester || 'y1s1'));
            return sem?.year === year;
          });
          const total = yearCourses.reduce((s, c) => s + (c.credits || 0), 0);
          const done  = yearCourses.filter(c => c.status === 'done').reduce((s, c) => s + (c.credits || 0), 0);
          const active = yearCourses.filter(c => c.status === 'active').length;
          return (
            <div key={year} className="card padded" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{YEAR_LABELS[year]}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--fg-strong)' }}>{total}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>נ"ז מתוכנן</div>
              {total > 0 && (
                <>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--neutral-200)', overflow: 'hidden', marginTop: 10 }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'var(--brand)', width: `${Math.round(done / total * 100)}%` }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>
                    {done} הושלמו{active > 0 ? ` · ${active} בלימוד` : ''}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
