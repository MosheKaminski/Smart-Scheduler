import { useState, useEffect } from 'react';
import { Sidebar, TopBar } from './Sidebar';
import { DashboardScreen } from './DashboardScreen';
import { ScheduleScreen } from './ScheduleScreen';
import { CourseDetailScreen } from './CourseDetailScreen';
import { GradesScreen } from './GradesScreen';
import { RecommendScreen } from './RecommendScreen';
import { FriendsScreen, SettingsScreen } from './FriendsAndSettings';
import { ToastStack, NotificationsPopover, CommandPalette, AddCourseModal, popCelebration } from './AppExtras';
import { SchedulerTweaks } from './SchedulerTweaks';
import Icon from './Icon';
import { COURSES } from './data';

const App = () => {
  const [route, setRoute] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [courses, setCourses] = useState(COURSES);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [addCoursePrefill, setAddCoursePrefill] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.appBus = {
      openAddCourse: (prefill = null) => { setAddCoursePrefill(prefill); setAddCourseOpen(true); },
      openCmdPalette: () => setCmdOpen(true),
      toast: (t) => setToasts(prev => [...prev, { ...t, id: Date.now() + Math.random() }]),
    };
    return () => { window.appBus = null; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navigate = (key) => {
    setSelectedCourse(null);
    setRoute(key);
  };

  const titles = {
    dashboard: ['דף הבית', 'דנה, הנה הסיכום שלך'],
    schedule:  ['מערכת השעות', 'סמסטר אביב 2026'],
    catalog:   ['קטלוג קורסים', 'כל הקורסים בקטלוג'],
    course:    ['פרטי קורס', null],
    grades:    ['ציונים', 'גליון אישי + What-if'],
    whatif:    ['What-if Simulator', 'תכנון ממוצע עתידי'],
    recommend: ['המלצות', 'בחירות חכמות בשבילך'],
    friends:   ['חברים', 'קבוצות לימוד פעילות'],
    erd:       ['ארכיטקטורת מסד נתונים', 'תרשים ERD של המערכת'],
    settings:  ['הגדרות', null],
  };

  const handleAddCourse = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    setAddCourseOpen(false);
    setToasts(prev => [...prev, {
      id: Date.now(),
      title: 'קורס נוסף!',
      body: `"${newCourse.name}" נוסף למערכת השעות`,
    }]);
    popCelebration(null, newCourse.credits);
  };

  const renderRoute = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardScreen onNavigate={navigate} />;
      case 'schedule':
        return <ScheduleScreen courses={courses} setCourses={setCourses} onCoursePick={(c) => {
          if (c) { setSelectedCourse(c); setRoute('course'); }
          else { window.appBus?.openAddCourse(); }
        }} />;
      case 'course':
        return <CourseDetailScreen course={selectedCourse} onBack={() => setRoute('catalog')} />;
      case 'catalog':
      case 'recommend':
        return <RecommendScreen onCoursePick={(c) => { setSelectedCourse({ ...COURSES[0], ...c }); setRoute('course'); }} />;
      case 'grades':
      case 'whatif':
        return <GradesScreen />;
      case 'friends':
        return <FriendsScreen />;
      case 'erd':
        return (
          <div className="app-content">
            <div className="card padded" style={{ textAlign: 'center', padding: 48 }}>
              <Icon name="database" size={48} style={{ color: 'var(--brand)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--fg-strong)', margin: '12px 0 6px' }}>ארכיטקטורת מסד הנתונים</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-muted)', margin: '0 0 18px' }}>תרשים ה-ERD המלא של מערכת Smart Scheduler</p>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsScreen theme={theme} setTheme={setTheme} />;
      default:
        return <DashboardScreen onNavigate={navigate} />;
    }
  };

  const [title, subtitle] = titles[route] || ['', ''];

  return (
    <div className="app-shell">
      <Sidebar active={route} onNavigate={navigate} />
      <main className="app-main">
        <TopBar title={title} subtitle={subtitle} onBellClick={() => setNotifOpen(o => !o)}>
          {route === 'dashboard' && (
            <button className="btn btn-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="החלף מצב כהה">
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
          )}
        </TopBar>
        {renderRoute()}
      </main>

      <ToastStack toasts={toasts} dismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      {notifOpen && <NotificationsPopover onClose={() => setNotifOpen(false)} onNav={navigate} />}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNav={navigate}
        onCoursePick={(c) => { setSelectedCourse({ ...COURSES[0], ...c }); setRoute('course'); setCmdOpen(false); }}
        courses={courses}
      />
      <AddCourseModal
        open={addCourseOpen}
        onClose={() => setAddCourseOpen(false)}
        prefill={addCoursePrefill}
        courses={courses}
        onConfirm={handleAddCourse}
      />
      <SchedulerTweaks />
    </div>
  );
};

export default App;
