import Icon from './Icon';
import { Chip } from './shared';
import { FRIENDS, CURRENT_STUDENT } from './data';

export const FriendsScreen = () => {
  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>חברים &amp; קבוצות לימוד</h1>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>מי מהחברים שלך לומד את אותם קורסים השבוע?</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {FRIENDS.map(f => (
          <div key={f.id} className="card padded" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className={`avatar ${f.color}`} style={{ width: 52, height: 52, fontSize: 22 }}>{f.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)' }}>{f.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{f.id}</div>
              <div style={{ marginTop: 10 }}>
                <div className="t-overline" style={{ marginBottom: 4 }}>קורסים משותפים</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {f.shared.map(s => <Chip key={s} kind="brand">{s}</Chip>)}
                </div>
              </div>
            </div>
            <button className="btn btn-soft btn-sm"><Icon name="message" size={14} /> צ׳אט</button>
          </div>
        ))}
      </div>

      <div className="card padded" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%)', borderColor: '#bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
            <Icon name="users" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#14532d' }}>קבוצת לימוד מומלצת: מבני נתונים</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534', marginTop: 2 }}>3 חברים שלך נרשמו לקבוצה הזו — להצטרף?</div>
          </div>
          <button className="btn btn-primary btn-sm">+ הצטרף</button>
        </div>
      </div>
    </div>
  );
};

export const SettingsScreen = ({ theme, setTheme }) => {
  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>הגדרות</h1>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>פרופיל, התראות, ומראה</div>
      </div>

      <div className="card padded">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>פרופיל</h2>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div className="avatar av-purple" style={{ width: 64, height: 64, fontSize: 26, background: '#22c55e' }}>{CURRENT_STUDENT.initial}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)' }}>{CURRENT_STUDENT.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>{CURRENT_STUDENT.program}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label>תעודת זהות סטודנט <span className="pk-tag">PK</span></label>
            <input className="input" value={CURRENT_STUDENT.id} readOnly />
            <div className="help">מזהה ייחודי לא ניתן לשינוי</div>
          </div>
          <div className="field">
            <label>אימייל</label>
            <input className="input" value={CURRENT_STUDENT.email} readOnly />
          </div>
        </div>
      </div>

      <div className="card padded">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>מראה</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-strong)' }}>מצב כהה</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>פחות אור כשעובדים בשעות הקטנות של הלילה</div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{
            width: 52, height: 28, borderRadius: 999,
            background: theme === 'dark' ? 'var(--brand)' : 'var(--neutral-200)',
            border: 0, cursor: 'pointer', position: 'relative',
            transition: 'background 200ms var(--ease-out)',
          }}>
            <div style={{
              position: 'absolute', top: 3, insetInlineEnd: theme === 'dark' ? 3 : 27,
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              transition: 'inset-inline-end 200ms var(--ease-out)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            }} />
          </button>
        </div>
      </div>

      <div className="card padded">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '0 0 14px' }}>התראות</h2>
        {[
          { name: 'התנגשויות בשעות', on: true },
          { name: 'התראות עומס סמסטר', on: true },
          { name: 'המלצות חכמות', on: true },
          { name: 'חברים נרשמו לאותו קורס', on: false },
          { name: 'אימייל שבועי עם סיכום', on: false },
        ].map(n => (
          <div key={n.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-strong)' }}>{n.name}</div>
            <div style={{ width: 38, height: 22, borderRadius: 999, background: n.on ? 'var(--brand)' : 'var(--neutral-300)', position: 'relative', transition: 'all 200ms' }}>
              <div style={{ position: 'absolute', top: 2, insetInlineEnd: n.on ? 2 : 18, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
