export const CURRENT_STUDENT = {
  id: 'STU-209831',
  name: 'דנה לוי',
  initial: 'ד',
  program: 'מדעי המחשב · שנה ב׳',
  email: 'dana.levi@ono.ac.il',
  gpa: 87.4,
  credits: 88,
  creditsRequired: 120,
};

export const COURSES = [
  { code: 'CS-2010',   name: 'מבני נתונים',          credits: 4, lecturer: 'ד״ר עמיר כהן',     diff: 'hard',   rating: 4.4, enrolled: 128, category: 'cs',   day: 'mon', start: 10, end: 12, room: '301', color: 'av-purple' },
  { code: 'CS-3050',   name: 'בסיסי נתונים',          credits: 4, lecturer: 'פרופ׳ נועה בן-עמי', diff: 'hard',   rating: 4.7, enrolled: 92,  category: 'cs',   day: 'mon', start: 12, end: 14, room: '208', color: 'av-pink', conflict: true },
  { code: 'MATH-1110', name: 'אלגברה לינארית 1',       credits: 3, lecturer: 'פרופ׳ יוסי לוי',   diff: 'easy',   rating: 4.7, enrolled: 62,  category: 'math', day: 'tue', start: 10, end: 12, room: '102', color: 'av-mint' },
  { code: 'CS-2520',   name: 'מערכות הפעלה',           credits: 4, lecturer: 'ד״ר מיכל שגיא',    diff: 'medium', rating: 4.2, enrolled: 88,  category: 'cs',   day: 'wed', start: 14, end: 16, room: '305', color: 'av-sky' },
  { code: 'LAW-2020',  name: 'דיני חוזים',             credits: 2, lecturer: 'עו״ד רוני אלון',   diff: 'medium', rating: 4.1, enrolled: 215, category: 'biz',  day: 'mon', start: 14, end: 16, room: '410', color: 'av-amber' },
  { code: 'CS-3300',   name: 'אלגוריתמים מתקדמים',     credits: 4, lecturer: 'ד״ר עמיר כהן',     diff: 'brutal', rating: 4.0, enrolled: 54,  category: 'cs',   day: 'thu', start: 10, end: 13, room: '301', color: 'av-coral' },
];

export const RECOMMENDED = [
  { code: 'CS-4100', name: 'למידת מכונה — מבוא',    diff: 'medium', rating: 4.7, why: '88% מהסטודנטים שלקחו "מבני נתונים" המליצו' },
  { code: 'PSY-2010', name: 'פסיכולוגיה קוגניטיבית', diff: 'easy',   rating: 4.6, why: 'בחירה חברתית פופולרית · פותחת אופקים' },
  { code: 'CS-3700', name: 'תורת המשחקים',           diff: 'hard',   rating: 4.5, why: 'מתאים לפרופיל "תיאורטי" שלך' },
];

export const GRADES = [
  { code: 'CS-1010',   name: 'מבוא למדעי המחשב',  credits: 5, semester: 'א׳ 2024', grade: 92,   status: 'completed' },
  { code: 'MATH-1010', name: 'חדו״א 1',            credits: 5, semester: 'א׳ 2024', grade: 84,   status: 'completed' },
  { code: 'CS-1020',   name: 'מבוא לתכנות',        credits: 4, semester: 'א׳ 2024', grade: 95,   status: 'completed' },
  { code: 'ENG-1010',  name: 'אנגלית למתקדמים',    credits: 2, semester: 'א׳ 2024', grade: 88,   status: 'completed' },
  { code: 'CS-2000',   name: 'תכנות מונחה עצמים',  credits: 4, semester: 'ב׳ 2024', grade: 89,   status: 'completed' },
  { code: 'MATH-1020', name: 'חדו״א 2',            credits: 5, semester: 'ב׳ 2024', grade: 78,   status: 'completed' },
  { code: 'CS-2010',   name: 'מבני נתונים',        credits: 4, semester: 'א׳ 2025', grade: null, status: 'in-progress' },
  { code: 'CS-3050',   name: 'בסיסי נתונים',       credits: 4, semester: 'א׳ 2025', grade: null, status: 'in-progress' },
];

export const FRIENDS = [
  { id: 'STU-209102', name: 'אביב מורן',   initial: 'א', color: 'av-pink',  shared: ['מבני נתונים', 'בסיסי נתונים'],   group: 'mon' },
  { id: 'STU-211045', name: 'נועם פרידמן', initial: 'נ', color: 'av-mint',  shared: ['אלגברה 1'],                      group: 'tue' },
  { id: 'STU-203877', name: 'תמר רוזן',    initial: 'ת', color: 'av-amber', shared: ['בסיסי נתונים', 'דיני חוזים'],    group: 'mon' },
  { id: 'STU-210560', name: 'עומר שלמה',   initial: 'ע', color: 'av-sky',   shared: ['מערכות הפעלה'],                  group: 'wed' },
];

export const DAYS = [
  { key: 'sun', label: 'ראשון' },
  { key: 'mon', label: 'שני' },
  { key: 'tue', label: 'שלישי' },
  { key: 'wed', label: 'רביעי' },
  { key: 'thu', label: 'חמישי' },
];

export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export const DIFF_LABEL = { easy: 'קל', medium: 'בינוני', hard: 'קשה', brutal: 'רצחני' };
export const DIFF_CLASS = { easy: 'chip-easy', medium: 'chip-med', hard: 'chip-hard', brutal: 'chip-hard' };
export const DIFF_DOT   = { easy: '#14b8a6', medium: '#f59e0b', hard: '#ef4444', brutal: '#ef4444' };
