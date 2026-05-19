import { useState, useMemo } from 'react';
import Icon from './Icon';
import { StatCard } from './shared';

/* weighted GPA from array of { grade, credits } */
function calcGPA(entries) {
  const totalCredits = entries.reduce((s, e) => s + (e.credits || 0), 0);
  if (!totalCredits) return 0;
  return entries.reduce((s, e) => s + (e.grade || 0) * (e.credits || 0), 0) / totalCredits;
}

/* colour for a grade value */
function gradeColor(g) {
  if (g >= 90) return '#15803d';
  if (g >= 80) return '#2563eb';
  if (g >= 70) return '#d97706';
  return '#dc2626';
}

export const WhatIfScreen = ({ grades = [], courses = [] }) => {
  const completed   = grades.filter(g => g.status === 'completed');
  const inProgress  = grades.filter(g => g.status === 'in-progress');

  /* enrolled courses that have no grade record at all */
  const gradedCodes = new Set(grades.map(g => g.course_code));
  const ungradedEnrolled = courses.filter(c => !gradedCodes.has(c.code));

  /* simulation state: course_code → hypothetical grade */
  const initSim = () => {
    const m = {};
    inProgress.forEach(g  => { m[g.course_code]  = Math.round(g.grade || 80); });
    ungradedEnrolled.forEach(c => { m[c.code] = 80; });
    return m;
  };
  const [sim, setSim]           = useState(initSim);
  const [targetGPA, setTargetGPA] = useState(85);
  const [modifyCompleted, setModifyCompleted] = useState(false);
  const [completedSim, setCompletedSim] = useState(() =>
    Object.fromEntries(completed.map(g => [g.course_code, Math.round(g.grade)]))
  );

  const setSingle = (code, val) => setSim(prev => ({ ...prev, [code]: val }));
  const setCompleted = (code, val) => setCompletedSim(prev => ({ ...prev, [code]: val }));

  const currentGPA   = calcGPA(completed);

  const projectedEntries = [
    ...(modifyCompleted
      ? completed.map(g => ({ grade: completedSim[g.course_code] ?? g.grade, credits: g.credits }))
      : completed.map(g => ({ grade: g.grade, credits: g.credits }))
    ),
    ...inProgress.map(g => ({ grade: sim[g.course_code] ?? 80, credits: g.credits })),
    ...ungradedEnrolled.map(c => ({ grade: sim[c.code] ?? 80, credits: c.credits || 3 })),
  ];
  const projectedGPA = calcGPA(projectedEntries);
  const delta = projectedGPA - currentGPA;

  /* target calculator */
  const completedCredits  = completed.reduce((s, g) => s + (g.credits || 0), 0);
  const completedWeighted = completed.reduce((s, g) => s + (g.grade || 0) * (g.credits || 0), 0);
  const remainingCredits  = [...inProgress, ...ungradedEnrolled].reduce((s, c) => s + (c.credits || 3), 0);
  const neededAvg = remainingCredits > 0
    ? (targetGPA * (completedCredits + remainingCredits) - completedWeighted) / remainingCredits
    : null;

  const simCandidates = [
    ...inProgress.map(g  => ({ code: g.course_code, name: g.course_name,  credits: g.credits,       source: 'in-progress' })),
    ...ungradedEnrolled.map(c => ({ code: c.code,       name: c.name,         credits: c.credits || 3,  source: 'enrolled' })),
  ];

  const hasAnything = completed.length > 0 || simCandidates.length > 0;

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #a3e635, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Icon name="flask" size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>סימולטור What-if</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            שנה ציונים תיאורטיים ובדוק כיצד זה משפיע על הממוצע המצטבר שלך
          </div>
        </div>
      </div>

      {!hasAnything && (
        <div className="card padded" style={{ textAlign: 'center', padding: 56 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', marginBottom: 6 }}>אין עדיין נתונים לסימולציה</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>הוסף ציונים בגליון הציונים או קורסים למפת התואר</div>
        </div>
      )}

      {hasAnything && <>

        {/* GPA cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <StatCard
            label="ממוצע נוכחי"
            value={completed.length ? currentGPA.toFixed(1).split('.')[0] : '—'}
            unit={completed.length ? '.' + currentGPA.toFixed(1).split('.')[1] : ''}
            trend={`${completed.length} קורסים הושלמו`}
            trendKind="flat"
          />
          <StatCard
            label="ממוצע צפוי (What-if)"
            value={projectedGPA.toFixed(1).split('.')[0]}
            unit={'.' + projectedGPA.toFixed(1).split('.')[1]}
            trend={delta === 0 ? 'ללא שינוי' : delta > 0 ? `↑ +${delta.toFixed(1)} מהנוכחי` : `↓ ${delta.toFixed(1)} מהנוכחי`}
            trendKind={delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}
          />
          <div className="card padded" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="t-overline">קורסים בסימולציה</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--fg-strong)' }}>
              {simCandidates.length}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-muted)' }}>
              {inProgress.length} בלימוד · {ungradedEnrolled.length} מתוכנן
            </div>
          </div>
        </div>

        {/* GPA gauge */}
        <div className="card padded">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>השפעה ויזואלית</div>
            {completed.length > 0 && (
              <button onClick={() => setModifyCompleted(m => !m)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1.5px solid var(--border-subtle)', background: modifyCompleted ? 'var(--brand-soft)' : 'white', color: modifyCompleted ? 'var(--brand-press)' : 'var(--fg-muted)', cursor: 'pointer' }}>
                {modifyCompleted ? '✓ ' : ''}שנה גם ציונים שהושלמו
              </button>
            )}
          </div>
          <div style={{ position: 'relative', height: 20, borderRadius: 999, background: 'var(--neutral-200)', overflow: 'hidden' }}>
            {/* current */}
            {completed.length > 0 && (
              <div style={{ position: 'absolute', insetInlineStart: 0, top: 0, height: '100%', background: '#94a3b8', width: `${Math.min(currentGPA, 100)}%`, transition: 'width 400ms ease', borderRadius: 999 }} />
            )}
            {/* projected */}
            <div style={{ position: 'absolute', insetInlineStart: 0, top: 0, height: '100%', background: `linear-gradient(90deg, #22c55e, #84cc16)`, width: `${Math.min(projectedGPA, 100)}%`, transition: 'width 400ms ease', borderRadius: 999, opacity: 0.85 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <span>60</span>
            <span style={{ color: '#94a3b8' }}>ממוצע נוכחי: {completed.length ? currentGPA.toFixed(1) : '—'}</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>מוקרן: {projectedGPA.toFixed(1)}</span>
            <span>100</span>
          </div>
        </div>

        {/* Simulation sliders */}
        {simCandidates.length > 0 && (
          <div className="card padded">
            <div className="section-head" style={{ marginBottom: 4 }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="flask" size={18} style={{ color: '#a3e635' }} /> הגדר ציונים תיאורטיים
                </h2>
                <div className="sub">הזז את המחוון או הקלד ציון · הממוצע מתעדכן מיד</div>
              </div>
              <button onClick={() => setSim(Object.fromEntries(simCandidates.map(c => [c.code, 80])))}
                className="btn btn-ghost btn-sm" style={{ boxShadow: 'none' }}>איפוס</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {simCandidates.map((c, i) => {
                const val = sim[c.code] ?? 80;
                return (
                  <div key={c.code} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr 72px', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                        {c.code}
                        <span style={{ marginInlineStart: 8, fontFamily: 'var(--font-display)', fontSize: 10, padding: '1px 6px', borderRadius: 4,
                          background: c.source === 'in-progress' ? '#dbeafe' : '#f1f5f9',
                          color:      c.source === 'in-progress' ? '#1d4ed8' : '#64748b' }}>
                          {c.source === 'in-progress' ? 'בלימוד' : 'מתוכנן'}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)', marginTop: 2 }}>{c.name}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{c.credits} נ"ז</div>
                    <input type="range" min={55} max={100}
                      value={val}
                      onChange={e => setSingle(c.code, +e.target.value)}
                      style={{ width: '100%', accentColor: gradeColor(val) }} />
                    <input type="number" min={55} max={100}
                      value={val}
                      onChange={e => setSingle(c.code, Math.min(100, Math.max(55, +e.target.value || 55)))}
                      className="input"
                      style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: gradeColor(val), padding: '6px 8px' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modify completed grades */}
        {modifyCompleted && completed.length > 0 && (
          <div className="card padded" style={{ borderColor: '#fde68a' }}>
            <div className="section-head" style={{ marginBottom: 4 }}>
              <div>
                <h2>שינוי ציונים שהושלמו</h2>
                <div className="sub">שנה ציונים היסטוריים כדי לראות מה היה קורה</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {completed.map((g, i) => {
                const val = completedSim[g.course_code] ?? Math.round(g.grade);
                return (
                  <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr 72px', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>{g.course_code}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-strong)', marginTop: 2 }}>{g.course_name}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{g.credits} נ"ז</div>
                    <input type="range" min={55} max={100}
                      value={val}
                      onChange={e => setCompleted(g.course_code, +e.target.value)}
                      style={{ width: '100%', accentColor: gradeColor(val) }} />
                    <input type="number" min={55} max={100}
                      value={val}
                      onChange={e => setCompleted(g.course_code, Math.min(100, Math.max(55, +e.target.value || 55)))}
                      className="input"
                      style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: gradeColor(val), padding: '6px 8px' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Target GPA calculator */}
        {remainingCredits > 0 && (
          <div className="card padded" style={{ background: 'linear-gradient(135deg, #f0fdf4, #f7fee7)', borderColor: '#bbf7d0' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#14532d', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="graduation" size={18} /> מחשבון יעד
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534', marginBottom: 10 }}>
                  מה הממוצע שאתה מכוון אליו?
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min={60} max={100} value={targetGPA}
                    onChange={e => setTargetGPA(+e.target.value)}
                    style={{ flex: 1, accentColor: '#16a34a' }} />
                  <input type="number" min={60} max={100} value={targetGPA}
                    onChange={e => setTargetGPA(Math.min(100, Math.max(60, +e.target.value || 60)))}
                    className="input"
                    style={{ width: 72, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, padding: '6px 8px' }} />
                </div>
              </div>

              <div style={{ padding: 18, background: 'white', borderRadius: 14, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {neededAvg === null ? (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534' }}>אין קורסים עתידיים</div>
                ) : neededAvg > 100 ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#dc2626' }}>לא מושג</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#b91c1c', marginTop: 4 }}>היעד גבוה מדי ביחס לממוצע הנוכחי</div>
                  </>
                ) : neededAvg < 55 ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#16a34a' }}>בטוח! ✓</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534', marginTop: 4 }}>כבר הגעת ליעד הזה</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: gradeColor(neededAvg), fontVariantNumeric: 'tabular-nums' }}>{neededAvg.toFixed(1)}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#166534', marginTop: 4 }}>
                      ממוצע נדרש ב-{[...inProgress, ...ungradedEnrolled].length} קורסים הנותרים<br/>
                      ({remainingCredits} נ"ז)
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </>}
    </div>
  );
};
