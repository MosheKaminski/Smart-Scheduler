import { useState } from 'react';
import Icon from './Icon';
import { Chip, DiffChip } from './shared';
import { COURSES } from './data';

export const CourseDetailScreen = ({ course, onBack }) => {
  const c = course || COURSES[0];
  const [tab, setTab] = useState('overview');
  const reviews = [
    { name: 'אביב מ.', rating: 5, semester: 'אביב 2025', text: 'מרצה שיודע להסביר את החומר ברמה גבוהה. דורש הרבה זמן אבל מתגמל. שיעורי בית מאתגרים.', helpful: 24 },
    { name: 'תמר ר.', rating: 4, semester: 'סתיו 2024', text: 'קשה אבל פייר. כדאי להתחיל את התרגילים מוקדם.', helpful: 12 },
    { name: 'עומר ש.', rating: 4, semester: 'אביב 2024', text: 'הרצאות מעניינות, הבוחן הסופי מאוד מאתגר. שווה את ההשקעה.', helpful: 8 },
  ];

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', boxShadow: 'none' }} onClick={onBack}><Icon name="arrow-right" size={14} /> חזור לקטלוג</button>

      <div className="card padded" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', insetInline: 0, top: 0, height: 4, background: 'linear-gradient(90deg, #22c55e, #a3e635)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', fontWeight: 700 }}>{c.code} · {c.credits} נ"ז</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, margin: '4px 0 8px', color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>{c.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <DiffChip d={c.diff} />
              <Chip kind="brand">★ {c.rating} ({c.enrolled} דירוגים)</Chip>
              <Chip kind="info">דרישת קדם: CS-1010, CS-2000</Chip>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <button className="btn btn-primary"><Icon name="plus" size={16} /> הוסף לסמסטר</button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>הרשמה פתוחה עד 30/12</div>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)' }}>
          {[{ k: 'overview', l: 'סקירה' }, { k: 'lecturers', l: 'מרצים' }, { k: 'reviews', l: 'דירוגים' }, { k: 'syllabus', l: 'סילבוס' }, { k: 'market', l: 'מרקטפלייס' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '10px 16px', border: 0, background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
              color: tab === t.k ? 'var(--brand-press)' : 'var(--fg-muted)',
              borderBottom: tab === t.k ? '2.5px solid var(--brand)' : '2.5px solid transparent',
              marginBottom: -1,
            }}>{t.l}</button>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', margin: '0 0 8px' }}>על הקורס</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--fg-default)', margin: 0 }}>
                  קורס מבוא למבני נתונים: רשימות מקושרות, ערימות, תורים, עצים, גרפים ושלל אלגוריתמים יסודיים. הקורס משלב יסודות תיאורטיים עם תרגול מעשי ב-Java/Python.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 18 }}>
                  {[['חובת נוכחות', '80%'], ['שעות שבועיות', '4'], ['סטודנטים רשומים', c.enrolled], ['משקל בציון', '4 נ"ז']].map(([label, val]) => (
                    <div key={label} style={{ padding: 14, background: 'var(--neutral-50)', borderRadius: 12 }}>
                      <div className="t-overline">{label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginTop: 4, color: 'var(--fg-strong)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card tight" style={{ background: 'var(--neutral-50)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)', margin: '0 0 12px' }}>דרישות קדם</h3>
                {[
                  { code: 'CS-1010', name: 'מבוא למדעי המחשב', done: true, grade: 92 },
                  { code: 'CS-1020', name: 'מבוא לתכנות', done: true, grade: 95 },
                  { code: 'MATH-1010', name: 'חדו"א 1', done: true, grade: 84 },
                  { code: 'CS-2000', name: 'תכנות מונחה עצמים', done: true, grade: 89 },
                ].map(p => (
                  <div key={p.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <div style={{ color: p.done ? '#16a34a' : '#9aa494' }}><Icon name={p.done ? 'check-circle' : 'lock'} size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{p.code}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-strong)' }}>{p.name}</div>
                    </div>
                    {p.done && <Chip kind="brand">{p.grade}</Chip>}
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--brand-soft)', borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--brand-press)', fontWeight: 600 }}>✓ עברת את כל דרישות הקדם</div>
              </div>
            </div>
          )}

          {tab === 'lecturers' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { name: 'ד״ר עמיר כהן', initial: 'ע', rating: 4.6, enrolled: 128, hard: 'קשה', selected: true },
                { name: 'פרופ׳ נועה בן-עמי', initial: 'נ', rating: 4.2, enrolled: 86, hard: 'קשה', selected: false },
                { name: 'ד״ר מיכל שגיא', initial: 'מ', rating: 4.4, enrolled: 64, hard: 'בינוני', selected: false },
              ].map(l => (
                <div key={l.name} className="card tight" style={{ borderColor: l.selected ? 'var(--brand)' : 'var(--border-subtle)', borderWidth: l.selected ? 1.5 : 1, background: l.selected ? 'var(--brand-soft)' : 'white', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar av-purple" style={{ width: 44, height: 44, fontSize: 18, background: '#22c55e' }}>{l.initial}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)' }}>{l.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>★ {l.rating} · {l.enrolled} סטודנטים</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Chip kind={l.hard === 'קשה' ? 'hard' : 'med'}><span className="dot" style={{ background: l.hard === 'קשה' ? '#ef4444' : '#f59e0b' }} />{l.hard}</Chip>
                    {l.selected && <Chip kind="brand">בחור עבורי</Chip>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r, i) => (
                <div key={i} className="card tight">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="avatar av-purple" style={{ width: 36, height: 36, fontSize: 14, background: '#16a34a' }}>{r.name[0]}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)' }}>{r.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{r.semester}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                      {[1, 2, 3, 4, 5].map(n => <Icon key={n} name={n <= r.rating ? 'star-filled' : 'star'} size={14} />)}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)', marginTop: 10, lineHeight: 1.55 }}>{r.text}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 8 }}>👍 {r.helpful} סטודנטים מצאו את הביקורת מועילה</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'syllabus' && (
            <ol style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-default)', lineHeight: 1.8, paddingInlineStart: 20, margin: 0 }}>
              <li>הקדמה ומבני נתונים בסיסיים — מערכים, מחרוזות</li>
              <li>רשימות מקושרות — בודדת, כפולה, מעגלית</li>
              <li>ערימה (Stack) ותור (Queue) — מימוש ויישומים</li>
              <li>עצים בינאריים — סריקה, חיפוש, AVL</li>
              <li>טבלאות גיבוב (Hash Tables)</li>
              <li>ערימות (Heaps) ותורי עדיפויות</li>
              <li>גרפים — ייצוג, BFS, DFS</li>
              <li>אלגוריתמי מסלולים קצרים — Dijkstra</li>
              <li>פרויקט מסכם</li>
            </ol>
          )}

          {tab === 'market' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>סיכומים, ספרים וחומרי לימוד משומשים מסטודנטים שלמדו את הקורס</div>
                <button className="btn btn-soft btn-sm">+ הוסף פוסט</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { title: 'סיכומי הרצאות 2024 — דנה לוי', price: '₪ 45', tag: 'סיכומים' },
                  { title: 'Cormen — מהדורה 4', price: '₪ 80', tag: 'ספר משומש' },
                  { title: 'דפי תרגול לבוחן + פתרונות', price: 'חינם', tag: 'תרגול' },
                ].map((m, i) => (
                  <div key={i} className="card tight" style={{ cursor: 'pointer' }}>
                    <div style={{ height: 60, borderRadius: 8, background: 'linear-gradient(135deg, #f0fdf4, #ecfccb)', marginBottom: 10 }} />
                    <Chip kind="neutral">{m.tag}</Chip>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', marginTop: 6 }}>{m.title}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--brand-press)', marginTop: 4 }}>{m.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
