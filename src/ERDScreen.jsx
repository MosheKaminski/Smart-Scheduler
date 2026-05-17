import { useState, useEffect } from 'react';
import { supabase } from './supabase';

/* ── layout constants ── */
const FIELD_H  = 26;
const HEADER_H = 38;
const TW       = 220;

const tableHeight = (fields) => HEADER_H + fields.length * FIELD_H;

/* ── table definitions (matches actual Supabase schema) ── */
const TABLES = [
  {
    id: 'students', label: 'students', color: '#22c55e',
    x: 20, y: 20,
    note: 'RLS — לכל משתמש',
    fields: [
      { name: 'id',               type: 'UUID',        pk: true },
      { name: 'name',             type: 'TEXT',        nn: true },
      { name: 'initial',          type: 'TEXT' },
      { name: 'program',          type: 'TEXT' },
      { name: 'email',            type: 'TEXT' },
      { name: 'gpa',              type: 'NUMERIC(4,1)' },
      { name: 'credits',          type: 'INTEGER' },
      { name: 'credits_required', type: 'INTEGER' },
    ],
  },
  {
    id: 'courses', label: 'courses', color: '#3b82f6',
    x: 660, y: 20,
    note: 'ציבורי',
    fields: [
      { name: 'code',       type: 'TEXT',        pk: true },
      { name: 'name',       type: 'TEXT',        nn: true },
      { name: 'credits',    type: 'INTEGER' },
      { name: 'lecturer',   type: 'TEXT' },
      { name: 'diff',       type: 'TEXT' },
      { name: 'rating',     type: 'NUMERIC(3,1)' },
      { name: 'enrolled',   type: 'INTEGER' },
      { name: 'category',   type: 'TEXT' },
      { name: 'day',        type: 'TEXT' },
      { name: 'start_hour', type: 'INTEGER' },
      { name: 'end_hour',   type: 'INTEGER' },
      { name: 'room',       type: 'TEXT' },
      { name: 'color',      type: 'TEXT' },
    ],
  },
  {
    id: 'enrollments', label: 'enrollments', color: '#f59e0b',
    x: 330, y: 190,
    note: 'RLS — לכל משתמש',
    fields: [
      { name: 'id',          type: 'UUID',    pk: true },
      { name: 'student_id',  type: 'UUID',    fk: 'students' },
      { name: 'course_code', type: 'TEXT',    fk: 'courses' },
      { name: 'conflict',    type: 'BOOLEAN' },
      { name: 'enrolled_at', type: 'TIMESTAMPTZ' },
    ],
  },
  {
    id: 'lecturers', label: 'lecturers', color: '#f97316',
    x: 660, y: 270,
    note: 'ציבורי',
    fields: [
      { name: 'id',         type: 'UUID', pk: true },
      { name: 'name',       type: 'TEXT', nn: true },
      { name: 'title',      type: 'TEXT' },
      { name: 'email',      type: 'TEXT' },
      { name: 'department', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ],
  },
  {
    id: 'grades', label: 'grades', color: '#8b5cf6',
    x: 20, y: 390,
    note: 'RLS — לכל משתמש',
    fields: [
      { name: 'id',          type: 'UUID',        pk: true },
      { name: 'student_id',  type: 'UUID',        fk: 'students' },
      { name: 'course_code', type: 'TEXT' },
      { name: 'course_name', type: 'TEXT' },
      { name: 'credits',     type: 'INTEGER' },
      { name: 'semester',    type: 'TEXT' },
      { name: 'grade',       type: 'NUMERIC(3,1)' },
      { name: 'status',      type: 'TEXT' },
    ],
  },
  {
    id: 'friends', label: 'friends', color: '#ec4899',
    x: 330, y: 560,
    note: 'RLS — לכל משתמש',
    fields: [
      { name: 'id',             type: 'UUID', pk: true },
      { name: 'student_id',     type: 'UUID', fk: 'students' },
      { name: 'friend_id',      type: 'TEXT' },
      { name: 'friend_name',    type: 'TEXT' },
      { name: 'friend_initial', type: 'TEXT' },
      { name: 'color',          type: 'TEXT' },
      { name: 'shared',         type: 'TEXT[]' },
      { name: 'grp',            type: 'TEXT' },
    ],
  },
  {
    id: 'recommendations', label: 'recommendations', color: '#14b8a6',
    x: 660, y: 530,
    note: 'ציבורי',
    fields: [
      { name: 'code',   type: 'TEXT', pk: true },
      { name: 'name',   type: 'TEXT' },
      { name: 'diff',   type: 'TEXT' },
      { name: 'rating', type: 'NUMERIC(3,1)' },
      { name: 'why',    type: 'TEXT' },
    ],
  },
];

/* ── edge helpers ── */
const getEdge = (id, side) => {
  const t = TABLES.find(t => t.id === id);
  const h = tableHeight(t.fields);
  if (side === 'right')  return { x: t.x + TW,     y: t.y + h / 2 };
  if (side === 'left')   return { x: t.x,           y: t.y + h / 2 };
  if (side === 'top')    return { x: t.x + TW / 2,  y: t.y };
  if (side === 'bottom') return { x: t.x + TW / 2,  y: t.y + h };
};

/* ── connections (FK-based) ── */
const CONNECTIONS = [
  { from: 'students',    fs: 'right',  to: 'enrollments', ts: 'left',   color: '#f59e0b' },
  { from: 'courses',     fs: 'left',   to: 'enrollments', ts: 'right',  color: '#f59e0b' },
  { from: 'students',    fs: 'bottom', to: 'grades',       ts: 'top',   color: '#8b5cf6' },
  { from: 'students',    fs: 'right',  to: 'friends',      ts: 'left',  color: '#ec4899' },
  { from: 'lecturers',   fs: 'left',   to: 'courses',      ts: 'right', color: '#f97316', dashed: true, soft: true },
];

const bezier = (f, t, fs, ts) => {
  const dx = Math.abs(t.x - f.x) * 0.5;
  const dy = Math.abs(t.y - f.y) * 0.5;
  const cx1 = (fs === 'right' || fs === 'left') ? f.x + (fs === 'right' ? dx : -dx) : f.x;
  const cy1 = (fs === 'top'   || fs === 'bottom') ? f.y + (fs === 'bottom' ? dy : -dy) : f.y;
  const cx2 = (ts === 'right' || ts === 'left') ? t.x + (ts === 'left' ? -dx : dx) : t.x;
  const cy2 = (ts === 'top'   || ts === 'bottom') ? t.y + (ts === 'top' ? -dy : dy) : t.y;
  return `M ${f.x} ${f.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${t.x} ${t.y}`;
};

const totalH = Math.max(...TABLES.map(t => t.y + tableHeight(t.fields))) + 60;
const totalW = 910;

/* ── relationships list for bottom section ── */
const RELATIONSHIPS = [
  {
    from: 'students', to: 'enrollments',
    fk: 'enrollments.student_id → students.id',
    card: '1 : N',
    cardDesc: 'סטודנט אחד — הרשמות רבות',
    type: 'FK',
    color: '#f59e0b',
  },
  {
    from: 'courses', to: 'enrollments',
    fk: 'enrollments.course_code → courses.code',
    card: '1 : N',
    cardDesc: 'קורס אחד — הרשמות רבות',
    type: 'FK',
    color: '#f59e0b',
  },
  {
    from: 'students', to: 'grades',
    fk: 'grades.student_id → students.id',
    card: '1 : N',
    cardDesc: 'סטודנט אחד — ציונים רבים',
    type: 'FK',
    color: '#8b5cf6',
  },
  {
    from: 'students', to: 'friends',
    fk: 'friends.student_id → students.id',
    card: '1 : N',
    cardDesc: 'סטודנט אחד — חברים רבים',
    type: 'FK',
    color: '#ec4899',
  },
  {
    from: 'lecturers', to: 'courses',
    fk: 'courses.lecturer (שם טקסטואלי)',
    card: '1 : N',
    cardDesc: 'מרצה אחד — קורסים רבים',
    type: 'לוגי',
    color: '#f97316',
  },
  {
    from: 'enrollments', to: 'courses',
    fk: 'enrollments.course_code → courses.code',
    card: 'N : 1',
    cardDesc: 'הרשמות רבות — קורס אחד',
    type: 'FK',
    color: '#3b82f6',
  },
  {
    from: 'students', to: 'courses',
    fk: 'דרך enrollments (many-to-many)',
    card: 'N : M',
    cardDesc: 'סטודנטים רבים — קורסים רבים',
    type: 'עקיף',
    color: '#22c55e',
  },
];

/* ── count fetcher ── */
async function fetchCounts() {
  const tables = ['students', 'courses', 'enrollments', 'grades', 'friends', 'recommendations', 'lecturers'];
  const results = await Promise.all(
    tables.map(t =>
      supabase.from(t).select('*', { count: 'exact', head: true })
        .then(({ count }) => [t, count ?? '—'])
        .catch(() => [t, '—'])
    )
  );
  return Object.fromEntries(results);
}

/* ── component ── */
export const ERDScreen = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetchCounts().then(setCounts);
  }, []);

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>
          ארכיטקטורת מסד הנתונים
        </h1>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
          תרשים ERD של Smart Scheduler — {TABLES.length} טבלאות, {CONNECTIONS.filter(c => !c.soft).length} FK, {CONNECTIONS.filter(c => c.soft).length} קשר לוגי
        </div>
      </div>

      {/* Live counts row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {TABLES.map(t => (
          <div key={t.id} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: `3px solid ${t.color}` }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--fg-strong)' }}>
                {counts[t.id] !== undefined ? counts[t.id] : '…'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-muted)' }}>{t.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ERD diagram */}
      <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
        <div style={{ position: 'relative', width: totalW, height: totalH }}>

          {/* SVG connections */}
          <svg style={{ position: 'absolute', inset: 0, width: totalW, height: totalH, pointerEvents: 'none' }} overflow="visible">
            <defs>
              {CONNECTIONS.map((c, i) => (
                <marker key={i} id={`arr-${i}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c.color} opacity={c.soft ? 0.5 : 1} />
                </marker>
              ))}
            </defs>
            {CONNECTIONS.map((c, i) => {
              const f = getEdge(c.from, c.fs);
              const t = getEdge(c.to,   c.ts);
              const mid = { x: (f.x + t.x) / 2, y: (f.y + t.y) / 2 };
              return (
                <g key={i}>
                  <path
                    d={bezier(f, t, c.fs, c.ts)}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={c.soft ? 1.5 : 2}
                    strokeDasharray={c.dashed ? '6 4' : 'none'}
                    opacity={c.soft ? 0.5 : 1}
                    markerEnd={`url(#arr-${i})`}
                  />
                  <rect x={mid.x - 14} y={mid.y - 9} width={28} height={16} rx={4} fill={c.color} opacity={c.soft ? 0.6 : 1} />
                  <text x={mid.x} y={mid.y + 4} textAnchor="middle" fill="white"
                    style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700 }}>1:N</text>
                </g>
              );
            })}
          </svg>

          {/* Table boxes */}
          {TABLES.map(t => (
            <div key={t.id} style={{
              position: 'absolute', left: t.x, top: t.y, width: TW,
              border: `2px solid ${t.color}`, borderRadius: 12,
              overflow: 'hidden', background: 'var(--card-bg, white)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              <div style={{ background: t.color, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: '0.04em', flex: 1 }}>
                  {t.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 4 }}>
                  {counts[t.id] !== undefined ? `${counts[t.id]} rows` : '…'}
                </span>
              </div>
              {t.fields.map((f, i) => (
                <div key={f.name} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 10px', height: FIELD_H,
                  borderTop: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--neutral-50, #f9fafb)',
                }}>
                  {f.pk
                    ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: '#f59e0b', color: 'white', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>PK</span>
                    : f.fk
                    ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: '#3b82f6', color: 'white', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>FK</span>
                    : f.nn
                    ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: '#ef4444', color: 'white', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>NN</span>
                    : <span style={{ width: 22, flexShrink: 0 }} />
                  }
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-strong)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', flexShrink: 0 }}>
                    {f.type}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Relationships list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>רשימת קשרים וקרדינליות</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{RELATIONSHIPS.length} קשרים מוגדרים</div>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 80px 1fr 70px', gap: 0, padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
          {['טבלה מקור', 'טבלה יעד', 'קרדינליות', 'שדה קישור', 'סוג'].map(h => (
            <div key={h} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>

        {RELATIONSHIPS.map((r, i) => {
          const fromTable = TABLES.find(t => t.id === r.from);
          const toTable   = TABLES.find(t => t.id === r.to);
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '130px 130px 80px 1fr 70px',
              gap: 0, padding: '12px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
              alignItems: 'center',
            }}>
              {/* From */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: fromTable?.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-strong)', fontWeight: 700 }}>{r.from}</span>
              </div>
              {/* To */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: toTable?.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-strong)', fontWeight: 700 }}>{r.to}</span>
              </div>
              {/* Cardinality */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: r.color + '20', border: `1px solid ${r.color}50`, borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: r.color }}>{r.card}</span>
                </div>
              </div>
              {/* FK field */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{r.fk}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-default)', marginTop: 2 }}>{r.cardDesc}</div>
              </div>
              {/* Type */}
              <div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
                  padding: '2px 8px', borderRadius: 5,
                  background: r.type === 'FK' ? '#dbeafe' : r.type === 'לוגי' ? '#ffedd5' : '#f3e8ff',
                  color:      r.type === 'FK' ? '#1d4ed8' : r.type === 'לוגי' ? '#c2410c' : '#7c3aed',
                }}>
                  {r.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="card padded" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>מקרא:</div>
        {[
          { bg: '#f59e0b', label: 'PK — מפתח ראשי' },
          { bg: '#3b82f6', label: 'FK — מפתח זר' },
          { bg: '#ef4444', label: 'NN — חובה (NOT NULL)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-default)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-default)' }}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#999" strokeWidth="1.5" strokeDasharray="5 3" /><polygon points="22,2 28,5 22,8" fill="#999" /></svg>
          קשר לוגי (ללא FK אמיתי)
        </div>
      </div>
    </div>
  );
};
