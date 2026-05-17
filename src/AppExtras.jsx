import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import { Chip, DiffChip } from './shared';
import { DAYS, HOURS } from './data';
import { SEMESTERS, DEFAULT_SEMESTER } from './semesters';

export const ToastStack = ({ toasts, dismiss }) => (
  <div className="toast-stack">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.kind || ''}`} onClick={() => dismiss(t.id)} role="status">
        <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: t.kind === 'error' ? 'var(--coral-50)' : 'var(--brand-soft)',
          color: t.kind === 'error' ? 'var(--coral-700)' : 'var(--brand-press)' }}>
          <Icon name={t.kind === 'error' ? 'alert' : 'check-circle'} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {t.title && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>{t.title}</div>}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{t.body}</div>
        </div>
      </div>
    ))}
  </div>
);

export const popCelebration = (anchorRect, credits) => {
  if (document.documentElement.getAttribute('data-motion') === 'off') return;
  const x = anchorRect ? anchorRect.left + anchorRect.width / 2 : window.innerWidth / 2;
  const y = anchorRect ? anchorRect.top + anchorRect.height / 2 : window.innerHeight / 2;
  const pop = document.createElement('div');
  pop.className = 'credit-pop';
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.textContent = `+ ${credits} נ"ז`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1300);
  const colors = ['#22c55e', '#a3e635', '#14b8a6', '#fcd34d'];
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-chip';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = colors[i % colors.length];
    c.style.setProperty('--cx', (Math.random() * 280 - 140) + 'px');
    c.style.setProperty('--cy', (Math.random() * 180 + 80) + 'px');
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1500);
  }
};

const DEFAULT_NOTIFS = [
  { id: 'n1', icon: 'alert',      tone: 'hard',   title: 'התנגשות שעות',    body: '"בסיסי נתונים" חופף ל"דיני חוזים" ביום שני 12:00',         time: 'לפני 5 דק׳' },
  { id: 'n2', icon: 'sparkles',   tone: 'brand',  title: 'המלצה חדשה',     body: 'סטודנטים כמוך נרשמו ל"למידת מכונה — מבוא"',               time: 'לפני שעה' },
  { id: 'n3', icon: 'message',    tone: 'info',   title: 'תמר שלחה לך הודעה', body: '"נפגשים מחר ב-19:00 בקפטריה?"',                         time: 'אתמול' },
  { id: 'n4', icon: 'graduation', tone: 'accent', title: 'ציון פורסם',      body: '"מבני נתונים" — מבחן ביניים 88',                           time: '3 ימים' },
];

export const NotificationsPopover = ({ onClose, onNav }) => {
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div ref={ref} className="popover" style={{ top: 64, insetInlineEnd: 24 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--fg-strong)' }}>התראות</div>
        <div className="chip chip-brand">4 חדשות</div>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {DEFAULT_NOTIFS.map(n => (
          <div key={n.id} onClick={() => { onClose(); if (n.icon === 'alert') onNav('schedule'); else if (n.icon === 'sparkles') onNav('recommend'); else if (n.icon === 'graduation') onNav('grades'); else onNav('friends'); }}
            style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 120ms var(--ease-out)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-50)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: n.tone === 'hard' ? 'var(--coral-50)' : n.tone === 'info' ? 'var(--sky-50)' : n.tone === 'accent' ? 'var(--accent-soft)' : 'var(--brand-soft)',
              color: n.tone === 'hard' ? 'var(--coral-700)' : n.tone === 'info' ? 'var(--sky-700)' : n.tone === 'accent' ? 'var(--lime-700)' : 'var(--brand-press)' }}>
              <Icon name={n.icon} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>{n.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{n.body}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)', marginTop: 4 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 10, textAlign: 'center', background: 'var(--neutral-50)' }}>
        <button className="btn btn-ghost btn-sm" style={{ boxShadow: 'none' }}>סמן הכל כנקרא</button>
      </div>
    </div>
  );
};

export const CommandPalette = ({ open, onClose, onNav, onCoursePick, courses, recommendations = [], friends = [] }) => {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 60); } }, [open]);

  const items = useMemo(() => {
    const allCourses = [...courses, ...recommendations];
    const actions = [
      { kind: 'action', icon: 'calendar',   label: 'פתח מערכת שעות',        meta: 'G S', go: () => onNav('schedule') },
      { kind: 'action', icon: 'graduation', label: 'גליון ציונים',           meta: 'G G', go: () => onNav('grades') },
      { kind: 'action', icon: 'flask',      label: 'סימולטור What-if',       meta: 'G W', go: () => onNav('whatif') },
      { kind: 'action', icon: 'sparkles',   label: 'המלצות חכמות',           meta: 'G R', go: () => onNav('recommend') },
      { kind: 'action', icon: 'users',      label: 'חברים וקבוצות לימוד',    meta: 'G F', go: () => onNav('friends') },
      { kind: 'action', icon: 'database',   label: 'ארכיטקטורת DB · ERD',    meta: 'G D', go: () => onNav('erd') },
      { kind: 'action', icon: 'settings',   label: 'הגדרות',                 meta: '⌘ ,', go: () => onNav('settings') },
      { kind: 'action', icon: 'plus',       label: 'הוסף קורס לסמסטר',       meta: 'A',   go: () => { onClose(); window.appBus?.openAddCourse(); } },
    ];
    const courseItems = allCourses.map(c => ({ kind: 'course', icon: 'book', label: c.name, meta: c.code, go: () => onCoursePick(c) }));
    const friendItems = friends.map(f => ({ kind: 'friend', icon: 'users', label: f.name, meta: f.id, go: () => onNav('friends') }));
    const all = [...actions, ...courseItems, ...friendItems];
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter(it => (it.label + ' ' + it.meta).toLowerCase().includes(needle));
  }, [q, courses, onNav, onCoursePick, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      else if (e.key === 'Enter')     { e.preventDefault(); const it = items[active]; if (it) { it.go(); onClose(); } }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items, active, onClose]);

  useEffect(() => { setActive(0); }, [q]);

  if (!open) return null;

  const grouped = items.reduce((acc, it) => {
    const k = it.kind === 'action' ? 'פעולות' : it.kind === 'course' ? 'קורסים' : 'חברים';
    (acc[k] ||= []).push(it);
    return acc;
  }, {});
  const order = ['פעולות', 'קורסים', 'חברים'];
  let idx = -1;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal cmdk" onClick={e => e.stopPropagation()}>
        <div className="cmdk-search">
          <Icon name="search" size={20} style={{ color: 'var(--fg-muted)' }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="חפש קורסים, מרצים, חברים, פעולות..." />
          <span className="cmdk-kbd">ESC</span>
        </div>
        <div className="cmdk-list">
          {items.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>אין תוצאות עבור "{q}"</div>
          )}
          {order.map(g => grouped[g] && (
            <div key={g}>
              <div className="cmdk-section-label">{g}</div>
              {grouped[g].map(it => { idx++; const myIdx = idx; return (
                <div key={myIdx} className={`cmdk-item ${active === myIdx ? 'active' : ''}`}
                  onMouseEnter={() => setActive(myIdx)}
                  onClick={() => { it.go(); onClose(); }}>
                  <div className="cmdk-icon"><Icon name={it.icon} size={16} /></div>
                  <span>{it.label}</span>
                  <span className="cmdk-meta">{it.meta}</span>
                </div>
              ); })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AddCourseModal = ({ open, onClose, prefill, courses, onConfirm, defaultSemester }) => {
  const [code, setCode]         = useState('');
  const [name, setName]         = useState('');
  const [credits, setCredits]   = useState(3);
  const [lecturer, setLecturer] = useState('');
  const [diff, setDiff]         = useState('medium');
  const [category, setCategory] = useState('cs');
  const [day, setDay]           = useState('tue');
  const [start, setStart]       = useState(10);
  const [duration, setDuration] = useState(2);
  const [room, setRoom]         = useState('204');
  const [semester, setSemester] = useState(defaultSemester || DEFAULT_SEMESTER);

  useEffect(() => {
    if (!open) return;
    setSemester(defaultSemester || DEFAULT_SEMESTER);
    if (prefill) {
      setCode(prefill.code || '');
      setName(prefill.name || '');
      setCredits(prefill.credits || 3);
      setLecturer(prefill.lecturer || '');
      setDiff(prefill.diff || 'medium');
      setCategory(prefill.category || 'cs');
      setDay(prefill.day || 'tue');
      setStart(prefill.start || 10);
      setDuration((prefill.end || 12) - (prefill.start || 10));
      setRoom(prefill.room || '204');
    } else {
      setCode(''); setName(''); setCredits(3); setLecturer('');
      setDiff('medium'); setCategory('cs');
      setDay('tue'); setStart(10); setDuration(2); setRoom('204');
    }
  }, [open, prefill, defaultSemester]);

  if (!open) return null;

  const clashes = courses.filter(other => other.day === day && !(start + duration <= other.start || start >= other.end));
  const altSlots = [];
  if (clashes.length) {
    for (const d of DAYS.map(x => x.key)) {
      for (let h = 8; h <= 16; h++) {
        if (h + duration > 19) continue;
        const conflict = courses.some(o => o.day === d && !(h + duration <= o.start || h >= o.end));
        if (!conflict) altSlots.push({ day: d, start: h });
        if (altSlots.length >= 3) break;
      }
      if (altSlots.length >= 3) break;
    }
  }

  const canSubmit = name.trim() && code.trim() && clashes.length === 0;
  const COLORS = ['av-purple', 'av-pink', 'av-mint', 'av-sky', 'av-amber', 'av-coral'];

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 580, marginTop: '4vh', alignSelf: 'flex-start' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">הרשמה לקורס</h2>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>הוסף קורס למפת התואר שלך</div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Semester picker */}
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>סמסטר</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {SEMESTERS.map(s => (
                <button key={s.id} type="button" onClick={() => setSemester(s.id)}
                  className={semester === s.id ? 'chip chip-brand' : 'chip chip-outline'}
                  style={{ cursor: 'pointer', padding: '6px 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course details section */}
          <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>פרטי הקורס</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>קוד קורס</label>
                <input className="input" placeholder="CS-1010" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>שם הקורס</label>
                <input className="input" placeholder="מבוא למדעי המחשב" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>נ"ז</label>
                <input className="input" type="number" min={1} max={8} value={credits} onChange={e => setCredits(+e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>מרצה</label>
                <input className="input" placeholder='פרופ׳ כהן' value={lecturer} onChange={e => setLecturer(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>קטגוריה</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="cs">מדעי המחשב</option>
                  <option value="math">מתמטיקה</option>
                  <option value="biz">עסקים/משפט</option>
                  <option value="other">אחר</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>רמת קושי</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['easy','קל'], ['medium','בינוני'], ['hard','קשה'], ['brutal','רצחני']].map(([v, l]) => (
                  <button key={v} onClick={() => setDiff(v)} className={`chip ${diff === v ? 'chip-brand' : 'chip-outline'}`} style={{ cursor: 'pointer', padding: '6px 14px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule section */}
          <div style={{ background: 'var(--neutral-50)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>מועד השיעור</div>
            <div className="field" style={{ margin: 0 }}>
              <label>יום</label>
              <div className="tabs" style={{ width: 'fit-content' }}>
                {DAYS.map(d => (
                  <button key={d.key} className={`tab ${day === d.key ? 'active' : ''}`} onClick={() => setDay(d.key)}>{d.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>שעת התחלה</label>
                <select className="input" value={start} onChange={e => setStart(+e.target.value)}>
                  {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>משך</label>
                <select className="input" value={duration} onChange={e => setDuration(+e.target.value)}>
                  <option value={1}>שעה</option>
                  <option value={2}>שעתיים</option>
                  <option value={3}>3 שעות</option>
                  <option value={4}>4 שעות</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>חדר</label>
                <input className="input" value={room} onChange={e => setRoom(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Conflict check */}
          {clashes.length > 0 ? (
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--coral-50)', border: '1px solid var(--coral-100)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--coral-700)' }}>
                <Icon name="alert" size={18} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13 }}>התנגשות עם {clashes.length === 1 ? `"${clashes[0].name}"` : `${clashes.length} קורסים`}</div>
              </div>
              {altSlots.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--coral-700)', marginBottom: 8 }}>חלונות פנויים מומלצים:</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {altSlots.map((s, i) => (
                      <button key={i} className="chip chip-outline" style={{ cursor: 'pointer', padding: '6px 12px' }}
                        onClick={() => { setDay(s.day); setStart(s.start); }}>
                        {DAYS.find(d => d.key === s.day)?.label} · {String(s.start).padStart(2, '0')}:00
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brand-press)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
              <Icon name="check-circle" size={18} /> אין התנגשויות
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
          <button className="btn btn-primary" disabled={!canSubmit} style={!canSubmit ? { opacity: 0.45, pointerEvents: 'none' } : {}}
            onClick={() => onConfirm({
              code, name, credits, lecturer, diff, category, rating: 0,
              day, start, end: start + duration, room, semester,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              enrolled: 0,
            })}>
            <Icon name="check" size={14} /> הוסף לתואר
          </button>
        </div>
      </div>
    </div>
  );
};
