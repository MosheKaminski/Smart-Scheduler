import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { Chip } from './shared';
import { searchStudents, checkSearchRpc } from './db';

/* ── avatar colour palette ── */
const AV_OPTIONS = [
  { key: 'av-brand', hex: '#22c55e' },
  { key: 'av-teal',  hex: '#14b8a6' },
  { key: 'av-sky',   hex: '#3b82f6' },
  { key: 'av-amber', hex: '#f59e0b' },
  { key: 'av-coral', hex: '#ef4444' },
  { key: 'av-lime',  hex: '#84cc16' },
];
const avatarHex = (key) => AV_OPTIONS.find(a => a.key === key)?.hex ?? '#22c55e';

/* ── Add Friend Modal ── */
const AddFriendModal = ({ open, onClose, onAdd, existingIds }) => {
  const [tab, setTab]       = useState('search'); // 'search' | 'manual'
  const [q, setQ]           = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [name, setName]     = useState('');
  const [initial, setInitial] = useState('');
  const [color, setColor]   = useState('av-brand');
  const [grp, setGrp]       = useState('');
  const [err, setErr]       = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (!open) { setQ(''); setResults([]); setName(''); setInitial(''); setErr(''); setGrp(''); }
  }, [open]);

  const handleSearch = (v) => {
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const res = await searchStudents(v.trim());
      setResults(res.filter(r => !existingIds.has(r.id)));
      setSearching(false);
    }, 350);
  };

  const handleAdd = (friend) => { onAdd({ ...friend, group: friend.group ?? friend.grp ?? null }); onClose(); };

  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 500, alignSelf: 'flex-start', marginTop: '8vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">הוסף חבר</h2>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 24px' }}>
          {[['search','חיפוש משתמשים'],['manual','הוספה ידנית']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setErr(''); }}
              style={{ padding: '12px 18px', border: 0, background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                color: tab === key ? 'var(--brand-press)' : 'var(--fg-muted)',
                borderBottom: tab === key ? '2px solid var(--brand)' : '2px solid transparent',
                marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'search' ? (
            <>
              <div style={{ position: 'relative' }}>
                <Icon name="search" size={15} style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingInlineEnd: 38 }}
                  placeholder="חפש לפי שם או אימייל..." value={q} onChange={e => handleSearch(e.target.value)} autoFocus />
              </div>

              {searching && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>מחפש...</div>
              )}

              {!searching && q.length >= 2 && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  לא נמצאו תוצאות<br />
                  <span style={{ fontSize: 12 }}>נסה הוספה ידנית אם הם לא רשומים למערכת</span>
                </div>
              )}

              {results.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.5)' }}>
                  <div className="avatar av-brand" style={{ width: 40, height: 40, fontSize: 16, background: '#22c55e', flexShrink: 0 }}>
                    {r.initial || r.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>{r.program}</div>
                  </div>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => handleAdd({ id: r.id, name: r.name, initial: r.initial || r.name?.[0] || '?', color: 'av-brand', shared: [], grp: grp || null })}>
                    <Icon name="plus" size={12} /> הוסף
                  </button>
                </div>
              ))}

              {results.length === 0 && q.length < 2 && (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  הקלד לפחות 2 תווים כדי לחפש
                </div>
              )}
            </>
          ) : (
            <>
              <div className="field">
                <label>שם מלא</label>
                <input className="input" placeholder="ישראל ישראלי" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label>ראשית (לאווטר)</label>
                  <input className="input" placeholder="י" maxLength={2} value={initial} onChange={e => setInitial(e.target.value)} />
                </div>
                <div className="field">
                  <label>קבוצת לימוד (אופציונלי)</label>
                  <input className="input" placeholder="מבני נתונים..." value={grp} onChange={e => setGrp(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>צבע אווטר</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {AV_OPTIONS.map(a => (
                    <button key={a.key} onClick={() => setColor(a.key)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: a.hex, border: color === a.key ? '3px solid var(--fg-strong)' : '3px solid transparent', cursor: 'pointer', outline: color === a.key ? '2px solid var(--bg-surface)' : 'none', outlineOffset: 1, transition: 'all 150ms' }} />
                  ))}
                </div>
              </div>
              {err && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#dc2626', padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>{err}</div>}
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
          {tab === 'manual' && (
            <button className="btn btn-primary" onClick={() => {
              if (!name.trim()) { setErr('נא להזין שם'); return; }
              handleAdd({ id: crypto.randomUUID(), name: name.trim(), initial: initial.trim() || name.trim()[0], color, shared: [], grp: grp.trim() || null });
            }}>
              <Icon name="plus" size={14} /> הוסף חבר
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Edit group modal ── */
const EditGroupModal = ({ open, friend, onSave, onClose }) => {
  const [grp, setGrp] = useState(friend?.group ?? '');
  useEffect(() => { if (open) setGrp(friend?.group ?? ''); }, [open, friend]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ width: 360, alignSelf: 'flex-start', marginTop: '20vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">שנה קבוצת לימוד</h2>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>שם הקבוצה</label>
            <input className="input" placeholder="למשל: מבני נתונים..." value={grp} onChange={e => setGrp(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>ביטול</button>
          <button className="btn btn-primary" onClick={() => { onSave(grp.trim() || null); onClose(); }}>שמור</button>
        </div>
      </div>
    </div>
  );
};

/* ── Friend card ── */
const FriendCard = ({ friend, onRemove, onEditGroup }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="card padded" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
      <div className={`avatar ${friend.color}`} style={{ width: 48, height: 48, fontSize: 20, flexShrink: 0, background: avatarHex(friend.color) }}>
        {friend.initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>{friend.name}</div>
          {friend.group && (
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--brand-soft)', color: 'var(--brand-press)' }}>
              {friend.group}
            </span>
          )}
        </div>

        {friend.shared?.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
              קורסים משותפים
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {friend.shared.map(s => <Chip key={s} kind="brand">{s}</Chip>)}
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>אין קורסים משותפים עדיין</div>
        )}
      </div>

      {/* Menu */}
      <div style={{ position: 'relative' }}>
        <button className="btn-icon" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={() => setMenuOpen(o => !o)}>
          <Icon name="dots" size={14} />
        </button>
        {menuOpen && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', insetInlineEnd: 0, top: '110%', zIndex: 30,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-subtle)',
            borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', padding: 6, minWidth: 160 }}>
            <button onClick={() => { setMenuOpen(false); onEditGroup(friend); }}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', border: 0, borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-default)', background: 'none' }}>
              <Icon name="edit" size={13} style={{ marginInlineEnd: 6 }} /> שנה קבוצה
            </button>
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            <button onClick={() => { setMenuOpen(false); onRemove(friend.id); }}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', border: 0, borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#dc2626', background: 'none' }}>
              <Icon name="x" size={13} style={{ marginInlineEnd: 6 }} /> הסר חבר
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Groups summary ── */
const GroupsSummary = ({ friends }) => {
  const groups = {};
  friends.forEach(f => {
    const g = f.group || 'ללא קבוצה';
    if (!groups[g]) groups[g] = [];
    groups[g].push(f);
  });
  const entries = Object.entries(groups).sort(([a], [b]) => a === 'ללא קבוצה' ? 1 : b === 'ללא קבוצה' ? -1 : a.localeCompare(b));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map(([grp, members]) => (
        <div key={grp} className="card padded" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: grp === 'ללא קבוצה' ? 'var(--neutral-100)' : 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: grp === 'ללא קבוצה' ? 'var(--fg-muted)' : 'white', flexShrink: 0 }}>
            <Icon name="users" size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{grp}</div>
            <div style={{ display: 'flex', gap: -6, marginTop: 4 }}>
              {members.map(m => (
                <div key={m.id} className={`avatar`} title={m.name}
                  style={{ width: 24, height: 24, fontSize: 10, background: avatarHex(m.color), borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, marginInlineEnd: -6, border: '2px solid var(--bg-surface)' }}>
                  {m.initial}
                </div>
              ))}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginInlineStart: 12, alignSelf: 'center' }}>{members.length} חברים</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Main screen ── */
export const FriendsScreen = ({ friends = [], onAddFriend, onRemoveFriend, onUpdateGroup }) => {
  const [addOpen, setAddOpen]       = useState(false);
  const [editFriend, setEditFriend] = useState(null);
  const [tab, setTab]               = useState('friends');
  const [filterQ, setFilterQ]       = useState('');
  const [rpcOk, setRpcOk]           = useState(null); // null=checking, true/false

  useEffect(() => {
    checkSearchRpc().then(setRpcOk);
  }, []);

  const existingIds = new Set(friends.map(f => f.id));
  const q = filterQ.trim().toLowerCase();
  const filteredFriends = q
    ? friends.filter(f => f.name?.toLowerCase().includes(q) || f.group?.toLowerCase().includes(q))
    : friends;

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>חברים &amp; קבוצות</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            {friends.length} חברים · {new Set(friends.map(f => f.group).filter(Boolean)).size} קבוצות לימוד
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Icon name="plus" size={15} /> הוסף חבר
        </button>
      </div>

      {/* Tabs + search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="tabs" style={{ alignSelf: 'flex-start', flexShrink: 0 }}>
          <button className={`tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>חברים ({friends.length})</button>
          <button className={`tab ${tab === 'groups'  ? 'active' : ''}`} onClick={() => setTab('groups')}>קבוצות לימוד</button>
        </div>
        {friends.length > 0 && (
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Icon name="search" size={14} style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
            <input className="input" style={{ paddingInlineEnd: 32, height: 36, fontSize: 13 }}
              placeholder="חיפוש לפי שם או קבוצה..."
              value={filterQ} onChange={e => setFilterQ(e.target.value)} />
          </div>
        )}
      </div>

      {/* Empty state */}
      {friends.length === 0 && (
        <div className="card padded" style={{ textAlign: 'center', padding: 56 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', marginBottom: 6 }}>אין עדיין חברים</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)', marginBottom: 20 }}>הוסף חברים כדי לראות קורסים משותפים ולתאם לוחות זמנים</div>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={14} /> הוסף חבר ראשון</button>
        </div>
      )}

      {/* No filter results */}
      {friends.length > 0 && filteredFriends.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--fg-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          לא נמצאו תוצאות עבור &ldquo;{filterQ}&rdquo;
        </div>
      )}

      {/* Friends list */}
      {tab === 'friends' && filteredFriends.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {filteredFriends.map(f => (
            <FriendCard key={f.id} friend={f}
              onRemove={onRemoveFriend}
              onEditGroup={setEditFriend} />
          ))}
        </div>
      )}

      {/* Groups view */}
      {tab === 'groups' && filteredFriends.length > 0 && (
        <GroupsSummary friends={filteredFriends} />
      )}

      {/* RPC hint — only when the RPC is missing */}
      {rpcOk === false && (
        <div className="card padded" style={{ background: 'rgba(255,247,237,0.8)', borderColor: '#fed7aa', padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="alert" size={16} style={{ color: '#c2410c', flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9a3412' }}>
              כדי לאפשר חיפוש משתמשים, הרץ ב-SQL Editor של Supabase:
              <code style={{ display: 'block', marginTop: 6, padding: '6px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7c2d12' }}>
                CREATE OR REPLACE FUNCTION search_students(query text) RETURNS TABLE (id uuid, name text, initial text, program text) LANGUAGE SQL SECURITY DEFINER AS $$ SELECT id, name, initial, program FROM students WHERE lower(name) LIKE lower('%'||query||'%') OR lower(email) LIKE lower('%'||query||'%') LIMIT 10; $$;
              </code>
            </div>
          </div>
        </div>
      )}

      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} existingIds={existingIds}
        onAdd={async (f) => { try { await onAddFriend(f); } catch {} }} />

      <EditGroupModal open={!!editFriend} friend={editFriend} onClose={() => setEditFriend(null)}
        onSave={(grp) => onUpdateGroup(editFriend.id, grp)} />
    </div>
  );
};

/* ── Settings screen ── */
export const SettingsScreen = ({ student, theme, setTheme, onSignOut }) => (
  <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>הגדרות</h1>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>פרופיל, התראות, ומראה</div>
    </div>

    <div className="card padded">
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>פרופיל</h2>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 26, background: '#22c55e', color: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{student?.initial}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)' }}>{student?.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>{student?.program}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="field"><label>מזהה סטודנט <span className="pk-tag">PK</span></label><input className="input" value={student?.id ?? ''} readOnly /></div>
        <div className="field"><label>אימייל</label><input className="input" value={student?.email ?? ''} readOnly /></div>
      </div>
    </div>

    <div className="card padded">
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>מראה</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>מצב כהה</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>פחות אור בשעות הקטנות</div>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ width: 52, height: 28, borderRadius: 999, background: theme === 'dark' ? 'var(--brand)' : 'var(--neutral-200)', border: 0, cursor: 'pointer', position: 'relative', transition: 'background 200ms' }}>
          <div style={{ position: 'absolute', top: 3, insetInlineEnd: theme === 'dark' ? 3 : 27, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'inset-inline-end 200ms', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }} />
        </button>
      </div>
    </div>

    <div className="card padded">
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>התראות</h2>
      {[
        ['התנגשויות בשעות', true], ['התראות עומס סמסטר', true], ['המלצות חכמות', true],
        ['חברים נרשמו לאותו קורס', false], ['אימייל שבועי עם סיכום', false],
      ].map(([label, on]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-strong)' }}>{label}</div>
          <div style={{ width: 38, height: 22, borderRadius: 999, background: on ? 'var(--brand)' : 'var(--neutral-300)', position: 'relative', transition: 'all 200ms' }}>
            <div style={{ position: 'absolute', top: 2, insetInlineEnd: on ? 2 : 18, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }} />
          </div>
        </div>
      ))}
    </div>

    <div className="card padded" style={{ borderColor: '#fca5a5', background: 'rgba(255,245,245,0.8)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#b91c1c', margin: '0 0 14px' }}>חשבון</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>התנתקות מהמערכת</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>תצא מהחשבון שלך במכשיר זה</div>
        </div>
        <button onClick={onSignOut} style={{ padding: '8px 18px', borderRadius: 10, border: '1.5px solid #fca5a5', background: 'white', color: '#b91c1c', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>התנתק</button>
      </div>
    </div>
  </div>
);
