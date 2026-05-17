import Icon from './Icon';
import { Chip, DiffChip } from './shared';

const CAT_LABELS = { cs: 'מדעי המחשב', math: 'מתמטיקה', biz: 'עסקים/משפט', other: 'אחר' };

/* derive smart recommendations from real data */
function buildSuggestions(allCourses, enrolledCourses, grades) {
  const enrolledCodes = new Set(enrolledCourses.map(c => c.code));
  const gradedCodes   = new Set((grades ?? []).map(g => g.course_code));

  const available = allCourses.filter(c => !enrolledCodes.has(c.code) && !gradedCodes.has(c.code));

  // count credits per category the student already has
  const catCredits = {};
  [...enrolledCourses, ...(grades ?? [])].forEach(c => {
    if (c.category) catCredits[c.category] = (catCredits[c.category] || 0) + (c.credits || 0);
  });

  // weakest category = least credits → prioritise those courses
  const allCats = Object.keys(CAT_LABELS);
  const weakest = allCats.sort((a, b) => (catCredits[a] || 0) - (catCredits[b] || 0));

  // heavy course load? suggest easy courses
  const hardCount = enrolledCourses.filter(c => c.diff === 'hard' || c.diff === 'brutal').length;
  const preferEasy = hardCount >= 2;

  const scored = available.map(c => {
    let score = (c.rating ?? 0) * 10;
    // boost underrepresented categories
    const catRank = weakest.indexOf(c.category);
    if (catRank >= 0) score += (allCats.length - catRank) * 5;
    // if load is heavy, boost easy courses
    if (preferEasy && (c.diff === 'easy' || c.diff === 'medium')) score += 15;
    return { ...c, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);

  // top rated overall
  const topRated = [...available].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);

  // easy balance picks (if not already heavy)
  const easyPicks = available.filter(c => c.diff === 'easy' || c.diff === 'medium')
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);

  // by weakest category
  const catPicks = {};
  weakest.slice(0, 2).forEach(cat => {
    catPicks[cat] = available.filter(c => c.category === cat)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  });

  return { topSuggested: scored.slice(0, 6), topRated, easyPicks, catPicks, weakest, preferEasy, catCredits };
}

export const RecommendScreen = ({ recommendations = [], allCourses = [], courses = [], grades = [], onCoursePick }) => {
  const { topSuggested, topRated, easyPicks, catPicks, weakest, preferEasy, catCredits } = buildSuggestions(allCourses, courses, grades);

  const enrolledCodes = new Set(courses.map(c => c.code));
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #22c55e, #a3e635)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Icon name="sparkles" size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: 0, color: 'var(--fg-strong)', letterSpacing: '-0.02em' }}>המלצות בשבילך</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', marginTop: 4 }}>
            מבוסס על {courses.length} קורסים שנרשמת, {grades.length} ציונים, ודירוגי כלל הקטלוג
          </div>
        </div>
      </div>

      {/* Insight chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {preferEasy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', fontFamily: 'var(--font-body)', fontSize: 13, color: '#c2410c' }}>
            <Icon name="alert" size={14} /> יש לך {courses.filter(c => c.diff === 'hard' || c.diff === 'brutal').length} קורסים קשים — מומלץ לאזן עם קורסים קלים יותר
          </div>
        )}
        {weakest[0] && (catCredits[weakest[0]] || 0) < 6 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', fontFamily: 'var(--font-body)', fontSize: 13, color: '#15803d' }}>
            <Icon name="sparkles" size={14} /> תחום {CAT_LABELS[weakest[0]]} לא מיוצג מספיק בתוכנית שלך
          </div>
        )}
        {allCourses.length === 0 && (
          <div style={{ padding: '7px 14px', borderRadius: 10, background: 'var(--neutral-50)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>
            הוסף קורסים לקטלוג כדי לקבל המלצות מותאמות אישית
          </div>
        )}
      </div>

      {/* Curated recommendations from DB */}
      {hasRecommendations && (
        <section>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', marginBottom: 12 }}>המלצות נבחרות</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {recommendations.map(r => (
              <CourseCard key={r.code} course={r} why={r.why} enrolled={enrolledCodes.has(r.code)} onPick={onCoursePick} />
            ))}
          </div>
        </section>
      )}

      {/* Smart suggestions based on real data */}
      {topSuggested.length > 0 && (
        <section>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', marginBottom: 4 }}>
            מומלץ עבורך
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>
            מחושב לפי קטגוריות חסרות, עומס הסמסטר ודירוגי הקורסים
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {topSuggested.map(r => {
              const why = buildWhy(r, catCredits, courses);
              return <CourseCard key={r.code} course={r} why={why} enrolled={enrolledCodes.has(r.code)} onPick={onCoursePick} />;
            })}
          </div>
        </section>
      )}

      {/* Top rated */}
      {topRated.length > 0 && (
        <section>
          <SectionHead title="קורסים עם הדירוג הגבוה ביותר" sub={`מתוך ${allCourses.length} קורסים בקטלוג`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {topRated.map(c => <MiniCard key={c.code} course={c} enrolled={enrolledCodes.has(c.code)} onPick={onCoursePick} />)}
          </div>
        </section>
      )}

      {/* Easy balance picks — only if student has heavy load */}
      {preferEasy && easyPicks.length > 0 && (
        <section>
          <SectionHead title="קורסים לאיזון עומס" sub="קל/בינוני — מומלץ כשיש הרבה קורסים קשים" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {easyPicks.map(c => <MiniCard key={c.code} course={c} enrolled={enrolledCodes.has(c.code)} onPick={onCoursePick} />)}
          </div>
        </section>
      )}

      {/* By underrepresented categories */}
      {weakest.slice(0, 2).map(cat => {
        const picks = catPicks[cat];
        if (!picks || picks.length === 0) return null;
        return (
          <section key={cat}>
            <SectionHead
              title={`קורסי ${CAT_LABELS[cat]} — תחום לחיזוק`}
              sub={`צברת רק ${catCredits[cat] || 0} נ"ז בתחום זה`}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {picks.map(c => <MiniCard key={c.code} course={c} enrolled={enrolledCodes.has(c.code)} onPick={onCoursePick} />)}
            </div>
          </section>
        );
      })}

      {topSuggested.length === 0 && !hasRecommendations && (
        <div className="card padded" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)', marginBottom: 6 }}>אין עדיין קורסים לציג</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)' }}>הוסף קורסים לקטלוג ולמפת התואר כדי לקבל המלצות מותאמות</div>
        </div>
      )}
    </div>
  );
};

/* ── helpers ── */

function buildWhy(course, catCredits, enrolledCourses) {
  const parts = [];
  if (course.rating >= 4.5) parts.push(`דירוג גבוה במיוחד — ★ ${course.rating}`);
  else if (course.rating >= 4)  parts.push(`דירוג טוב — ★ ${course.rating}`);
  const catTotal = catCredits[course.category] || 0;
  if (catTotal < 6) parts.push(`תחום ${CAT_LABELS[course.category] || course.category} חסר אצלך`);
  if (course.diff === 'easy' || course.diff === 'medium') {
    const hard = enrolledCourses.filter(c => c.diff === 'hard' || c.diff === 'brutal').length;
    if (hard >= 2) parts.push('מאזן את העומס הכבד בתוכנית');
  }
  if (course.enrolled > 80) parts.push(`${course.enrolled} סטודנטים רשומים`);
  return parts.length ? parts.join(' · ') : 'קורס מומלץ';
}

const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-strong)' }}>{title}</div>
    {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const CourseCard = ({ course: r, why, enrolled, onPick }) => (
  <div className="card padded" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', opacity: enrolled ? 0.6 : 1 }}
    onClick={() => !enrolled && onPick && onPick(r)}>
    <div style={{ position: 'absolute', insetInline: 0, top: 0, height: 4, background: 'linear-gradient(90deg, #22c55e, #a3e635)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', fontWeight: 700 }}>{r.code}</div>
      {r.rating > 0 && <Chip kind="accent">★ {r.rating}</Chip>}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-strong)', margin: '8px 0 10px', letterSpacing: '-0.01em' }}>{r.name}</div>
    {why && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-default)', lineHeight: 1.55, marginBottom: 14 }}>{why}</div>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
      <DiffChip d={r.diff} />
      {enrolled
        ? <Chip kind="brand">✓ רשום</Chip>
        : <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onPick && onPick(r); }}><Icon name="plus" size={12} /> הוסף</button>
      }
    </div>
  </div>
);

const MiniCard = ({ course: c, enrolled, onPick }) => (
  <div style={{ padding: 14, background: 'var(--neutral-50)', borderRadius: 12, cursor: enrolled ? 'default' : 'pointer', opacity: enrolled ? 0.6 : 1 }}
    onClick={() => !enrolled && onPick && onPick(c)}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{c.code}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', margin: '4px 0 8px' }}>{c.name}</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <DiffChip d={c.diff} />
      {c.rating > 0 && <Chip kind="accent">★ {c.rating}</Chip>}
      {enrolled && <Chip kind="brand">✓</Chip>}
    </div>
  </div>
);
