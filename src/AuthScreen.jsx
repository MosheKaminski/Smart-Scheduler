import { useState } from 'react';
import { signUp, signIn } from './supabase';

function translateError(msg) {
  if (msg.includes('Invalid login credentials')) return 'אימייל או סיסמה שגויים';
  if (msg.includes('User already registered')) return 'כתובת אימייל זו כבר רשומה במערכת';
  if (msg.includes('Password should be at least')) return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (msg.includes('Unable to validate email')) return 'כתובת אימייל לא תקינה';
  if (msg.includes('Email not confirmed')) return 'יש לאשר את האימייל לפני הכניסה';
  return msg;
}

const PROGRAMS = [
  'מדעי המחשב',
  'מתמטיקה ומדעי המחשב',
  'הנדסת תוכנה',
  'מנהל עסקים',
  'משפטים',
  'פסיכולוגיה',
  'ביולוגיה',
  'כלכלה',
  'תקשורת',
  'אחר',
];

export const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('מדעי המחשב');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (m) => { setMode(m); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('נא להזין שם מלא'); setLoading(false); return; }
        await signUp(email, password, name.trim(), program);
      } else {
        await signIn(email, password);
      }
      onAuth();
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ecfccb 100%)',
      padding: 24,
      direction: 'rtl',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg, #22c55e, #65a30d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
          }}>
            <span style={{ fontSize: 36 }}>🗓</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30,
            color: '#14532d', margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>Smart Scheduler</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#166534', margin: 0 }}>
            מערכת שעות חכמה לסטודנטים
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 24, padding: 32,
          boxShadow: '0 8px 48px rgba(0,0,0,0.12)',
        }}>

          {/* Mode tabs */}
          <div style={{
            display: 'flex', gap: 4, background: '#f1f5f9',
            borderRadius: 14, padding: 4, marginBottom: 28,
          }}>
            {[['login', 'כניסה למערכת'], ['register', 'הרשמה חדשה']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => switchMode(v)} style={{
                flex: 1, padding: '10px 0', borderRadius: 11, border: 0, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                background: mode === v ? 'white' : 'transparent',
                color: mode === v ? '#15803d' : '#64748b',
                boxShadow: mode === v ? '0 2px 10px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 180ms',
              }}>{l}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'register' && (
              <>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>שם מלא</label>
                  <input
                    className="input"
                    placeholder="ישראל ישראלי"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>תוכנית לימוד</label>
                  <select className="input" value={program} onChange={e => setProgram(e.target.value)}>
                    {PROGRAMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>אימייל</label>
              <input
                className="input"
                type="email"
                placeholder="student@university.ac.il"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus={mode === 'login'}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>סיסמה</label>
              <input
                className="input"
                type="password"
                placeholder={mode === 'register' ? 'לפחות 6 תווים' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca',
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#b91c1c',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14, border: 0,
                background: loading ? '#86efac' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(34,197,94,0.4)',
                transition: 'all 200ms', marginTop: 4,
              }}
            >
              {loading ? 'מעבד...' : mode === 'login' ? 'כניסה למערכת ←' : 'יצירת חשבון ←'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: '#6b7280' }}>
            {mode === 'login' ? (
              <>אין לך חשבון?{' '}
                <button type="button" onClick={() => switchMode('register')}
                  style={{ background: 'none', border: 0, color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  הרשם עכשיו
                </button>
              </>
            ) : (
              <>כבר יש לך חשבון?{' '}
                <button type="button" onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 0, color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 13 }}>
                  כנס למערכת
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 12, color: '#9ca3af' }}>
          Smart Scheduler · כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
};
