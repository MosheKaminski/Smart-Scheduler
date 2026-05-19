import { useState, useEffect } from 'react';
import { supabase } from './supabase';

/* ── layout constants ── */
const FIELD_H  = 26;
const HEADER_H = 38;
const TW       = 220;

const tableHeight = (fields = []) => HEADER_H + fields.length * FIELD_H;

/* ── layout / color hints for known tables ── */
const LAYOUT_MAP = {
  students:        { x: 20,  y: 20,  color: '#22c55e', note: 'RLS — לכל משתמש' },
  courses:         { x: 660, y: 20,  color: '#3b82f6', note: 'ציבורי' },
  enrollments:     { x: 330, y: 190, color: '#f59e0b', note: 'RLS — לכל משתמש' },
  lecturers:       { x: 660, y: 270, color: '#f97316', note: 'ציבורי' },
  grades:          { x: 20,  y: 390, color: '#8b5cf6', note: 'RLS — לכל משתמש' },
  friends:         { x: 330, y: 560, color: '#ec4899', note: 'RLS — לכל משתמש' },
  recommendations: { x: 660, y: 530, color: '#14b8a6', note: 'ציבורי' },
};

const EXTRA_COLORS = ['#06b6d4', '#84cc16', '#fb923c', '#a855f7', '#0ea5e9', '#64748b'];

/* postgres udt_name → readable type */
const TYPE_MAP = {
  uuid: 'UUID', text: 'TEXT', int4: 'INTEGER', int8: 'BIGINT',
  numeric: 'NUMERIC', bool: 'BOOLEAN', timestamptz: 'TIMESTAMPTZ',
  timestamp: 'TIMESTAMP', float4: 'FLOAT', float8: 'FLOAT',
  _text: 'TEXT[]', varchar: 'VARCHAR', json: 'JSON', jsonb: 'JSONB',
  bpchar: 'CHAR',
};
const displayType = (t) => TYPE_MAP[t?.toLowerCase()] ?? t?.toUpperCase() ?? 'TEXT';

/* ── connection geometry ── */
function pickSides(from, to) {
  const fc = { x: from.x + TW / 2, y: from.y + tableHeight(from.fields) / 2 };
  const tc = { x: to.x   + TW / 2, y: to.y   + tableHeight(to.fields)   / 2 };
  const dx = tc.x - fc.x, dy = tc.y - fc.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? ['right', 'left'] : ['left', 'right'];
  return dy > 0 ? ['bottom', 'top'] : ['top', 'bottom'];
}

function edgePoint(t, side) {
  const h = tableHeight(t.fields);
  if (side === 'right')  return { x: t.x + TW,    y: t.y + h / 2 };
  if (side === 'left')   return { x: t.x,          y: t.y + h / 2 };
  if (side === 'top')    return { x: t.x + TW / 2, y: t.y };
  return                        { x: t.x + TW / 2, y: t.y + h };
}

function bezier(f, t, fs, ts) {
  const dx = Math.abs(t.x - f.x) * 0.5;
  const dy = Math.abs(t.y - f.y) * 0.5;
  const cx1 = (fs === 'right' || fs === 'left')   ? f.x + (fs === 'right' ? dx : -dx) : f.x;
  const cy1 = (fs === 'top'   || fs === 'bottom')  ? f.y + (fs === 'bottom' ? dy : -dy) : f.y;
  const cx2 = (ts === 'right' || ts === 'left')   ? t.x + (ts === 'left' ? -dx : dx) : t.x;
  const cy2 = (ts === 'top'   || ts === 'bottom')  ? t.y + (ts === 'top' ? -dy : dy) : t.y;
  return `M ${f.x} ${f.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${t.x} ${t.y}`;
}

/* ── data fetching ── */
async function loadSchema() {
  const [schemaRes, fkRes] = await Promise.all([
    supabase.rpc('get_schema_info'),
    supabase.rpc('get_fk_relations'),
  ]);

  if (schemaRes.error) throw new Error(schemaRes.error.message);

  const schemaData = schemaRes.data ?? {};
  const fkRows     = Array.isArray(fkRes.data) ? fkRes.data : [];

  // assign positions
  let autoX = 20, autoY = 800, colorIdx = 0;
  const tables = Object.entries(schemaData).map(([name, cols]) => {
    const layout = LAYOUT_MAP[name] ?? (() => {
      const pos = { x: autoX, y: autoY, color: EXTRA_COLORS[colorIdx++ % EXTRA_COLORS.length], note: 'ציבורי' };
      autoX += TW + 60;
      if (autoX > 800) { autoX = 20; autoY += 280; }
      return pos;
    })();
    return { id: name, label: name, fields: cols ?? [], ...layout };
  });

  // live row counts
  const countEntries = await Promise.all(
    tables.map(t =>
      supabase.from(t.id).select('*', { count: 'exact', head: true })
        .then(({ count }) => [t.id, count ?? '—'])
        .catch(() => [t.id, '—'])
    )
  );
  const counts = Object.fromEntries(countEntries);

  // build edge objects
  const tableMap = Object.fromEntries(tables.map(t => [t.id, t]));
  const edges = fkRows
    .filter(r => tableMap[r.from_table] && tableMap[r.to_table])
    .map(r => {
      const from = tableMap[r.from_table];
      const to   = tableMap[r.to_table];
      const [fs, ts] = pickSides(from, to);
      return { from, to, fs, ts, fromCol: r.from_col, toCol: r.to_col, color: from.color };
    });

  return { tables, edges, counts };
}

/* ── component ── */
export const ERDScreen = () => {
  const [tables,  setTables]  = useState([]);
  const [edges,   setEdges]   = useState([]);
  const [counts,  setCounts]  = useState({});
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState(false);

  const reload = () => {
    setLoading(true);
    setRpcError(false);
    loadSchema()
      .then(({ tables, edges, counts }) => { setTables(tables); setEdges(edges); setCounts(counts); })
      .catch(e => { console.error(e); setRpcError(true); })
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const totalW = tables.length ? Math.max(...tables.map(t => t.x + TW)) + 60 : 910;
  const totalH = tables.length ? Math.max(...tables.map(t => t.y + tableHeight(t.fields))) + 60 : 400;

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>
            ארכיטקטורת מסד הנתונים
          </h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            {loading ? 'טוען סכמה מה-DB…' : rpcError ? 'נדרשת הגדרת RPC — ראה הוראות למטה' : `${tables.length} טבלאות · ${edges.length} קשרי FK · נתונים עדכניים מה-DB`}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reload} disabled={loading}
          style={{ marginTop: 4, flexShrink: 0 }}>
          {loading ? '⟳ טוען…' : '⟳ רענן'}
        </button>
      </div>

      {/* RPC missing instructions */}
      {rpcError && !loading && (
        <div className="card padded" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#c2410c', marginBottom: 8 }}>
            נדרשת הגדרת פונקציות RPC ב-Supabase
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9a3412', lineHeight: 1.6 }}>
            הרץ את שתי פונקציות ה-SQL בעורך SQL של Supabase ולאחר מכן לחץ רענן.<br />
            הפונקציות: <code>get_schema_info()</code> ו-<code>get_fk_relations()</code>
          </div>
        </div>
      )}

      {/* Live count chips */}
      {!rpcError && tables.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tables.map(t => (
            <div key={t.id} className="card" style={{ padding: '10px 16px', borderTop: `3px solid ${t.color}` }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--fg-strong)' }}>
                {loading ? '…' : (counts[t.id] ?? '—')}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-muted)' }}>{t.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* ERD diagram */}
      {!rpcError && tables.length > 0 && (
        <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
          <div style={{ position: 'relative', width: totalW, height: totalH }}>

            {/* SVG edges */}
            <svg style={{ position: 'absolute', inset: 0, width: totalW, height: totalH, pointerEvents: 'none' }} overflow="visible">
              <defs>
                {edges.map((e, i) => (
                  <marker key={i} id={`arr-${i}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={e.color} />
                  </marker>
                ))}
              </defs>
              {edges.map((e, i) => {
                const f = edgePoint(e.from, e.fs);
                const t = edgePoint(e.to,   e.ts);
                const mid = { x: (f.x + t.x) / 2, y: (f.y + t.y) / 2 };
                return (
                  <g key={i}>
                    <path d={bezier(f, t, e.fs, e.ts)} fill="none"
                      stroke={e.color} strokeWidth={2} markerEnd={`url(#arr-${i})`} />
                    <rect x={mid.x - 14} y={mid.y - 9} width={28} height={16} rx={4} fill={e.color} />
                    <text x={mid.x} y={mid.y + 4} textAnchor="middle" fill="white"
                      style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700 }}>1:N</text>
                  </g>
                );
              })}
            </svg>

            {/* Table boxes */}
            {tables.map(t => (
              <div key={t.id} style={{
                position: 'absolute', left: t.x, top: t.y, width: TW,
                border: `2px solid ${t.color}`, borderRadius: 12,
                overflow: 'hidden', background: 'var(--card-bg, white)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}>
                <div style={{ background: t.color, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: 'white', flex: 1 }}>
                    {t.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 4 }}>
                    {loading ? '…' : `${counts[t.id] ?? '—'} rows`}
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
                      : f.fk_to
                      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: '#3b82f6', color: 'white', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>FK</span>
                      : <span style={{ width: 22, flexShrink: 0 }} />
                    }
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-strong)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-muted)', flexShrink: 0 }}>
                      {displayType(f.type)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships list — generated from live FK data */}
      {!rpcError && edges.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>קשרי FK — {edges.length} קשרים מזוהים</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>נשלפו ישירות מ-information_schema</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 72px 1fr 56px', gap: 0, padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--neutral-50)' }}>
            {['טבלה מקור', 'טבלה יעד', 'קרדינליות', 'שדה קישור', 'סוג'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>
          {edges.map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '130px 130px 72px 1fr 56px',
              padding: '11px 20px', alignItems: 'center',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.from.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--fg-strong)' }}>{e.from.id}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.to.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--fg-strong)' }}>{e.to.id}</span>
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: e.from.color + '20', border: `1px solid ${e.from.color}50`, borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: e.from.color }}>1 : N</span>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                {e.from.id}.{e.fromCol} → {e.to.id}.{e.toCol}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#dbeafe', color: '#1d4ed8' }}>FK</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {!rpcError && tables.length > 0 && (
        <div className="card padded" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>מקרא:</div>
          {[
            { bg: '#f59e0b', label: 'PK — מפתח ראשי' },
            { bg: '#3b82f6', label: 'FK — מפתח זר' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-default)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg }} />
              {l.label}
            </div>
          ))}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginInlineStart: 'auto' }}>
            טבלאות חדשות יופיעו אוטומטית בעת רענון
          </div>
        </div>
      )}
    </div>
  );
};
