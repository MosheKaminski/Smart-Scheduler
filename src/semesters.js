export const SEMESTERS = [
  { id: 'y1s1', label: 'שנה א׳ · סמ א׳', year: 1, sem: 1 },
  { id: 'y1s2', label: 'שנה א׳ · סמ ב׳', year: 1, sem: 2 },
  { id: 'y1s3', label: 'שנה א׳ · קיץ',   year: 1, sem: 3 },
  { id: 'y2s1', label: 'שנה ב׳ · סמ א׳', year: 2, sem: 1 },
  { id: 'y2s2', label: 'שנה ב׳ · סמ ב׳', year: 2, sem: 2 },
  { id: 'y2s3', label: 'שנה ב׳ · קיץ',   year: 2, sem: 3 },
  { id: 'y3s1', label: 'שנה ג׳ · סמ א׳', year: 3, sem: 1 },
  { id: 'y3s2', label: 'שנה ג׳ · סמ ב׳', year: 3, sem: 2 },
  { id: 'y3s3', label: 'שנה ג׳ · קיץ',   year: 3, sem: 3 },
];

export const STATUSES = [
  { id: 'planned', label: 'מתוכנן', color: '#64748b', bg: '#f1f5f9' },
  { id: 'active',  label: 'בלימוד', color: '#2563eb', bg: '#dbeafe' },
  { id: 'done',    label: 'הושלם',  color: '#16a34a', bg: '#dcfce7' },
  { id: 'failed',  label: 'נכשל',   color: '#dc2626', bg: '#fee2e2' },
];

export const YEAR_LABELS = { 1: 'שנה א׳', 2: 'שנה ב׳', 3: 'שנה ג׳' };
export const SEM_LABELS  = { 1: 'סמסטר א׳', 2: 'סמסטר ב׳', 3: 'סמסטר קיץ' };
export const DEFAULT_SEMESTER = 'y1s1';
