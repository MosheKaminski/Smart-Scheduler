import { useState, useEffect } from 'react';
import { supabase, signOut } from './supabase';
import { AuthScreen } from './AuthScreen';
import { Sidebar, TopBar } from './Sidebar';
import { DashboardScreen } from './DashboardScreen';
import { ScheduleScreen } from './ScheduleScreen';
import { CourseDetailScreen } from './CourseDetailScreen';
import { GradesScreen } from './GradesScreen';
import { RecommendScreen } from './RecommendScreen';
import { CatalogScreen } from './CatalogScreen';
import { FriendsScreen, SettingsScreen } from './FriendsAndSettings';
import { ToastStack, NotificationsPopover, CommandPalette, AddCourseModal, popCelebration } from './AppExtras';
import { SchedulerTweaks } from './SchedulerTweaks';
import { ERDScreen } from './ERDScreen';
import { RoadmapScreen } from './RoadmapScreen';
import {
  getStudent, getEnrolledCourses, getGrades, getFriends, getRecommendations,
  addEnrollment, removeEnrollment, updateEnrollment, upsertCourse, getAllCourses, getLecturers,
} from './db';
import { DEFAULT_SEMESTER } from './semesters';

const App = () => {
  const [session, setSession] = useState(undefined); // undefined = checking
  const [route, setRoute] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [courses, setCourses] = useState([]);
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [friends, setFriends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [addCoursePrefill, setAddCoursePrefill] = useState(null);
  const [addCourseSemester, setAddCourseSemester] = useState(DEFAULT_SEMESTER);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data when session is available
  useEffect(() => {
    if (!session) return;
    setDataLoading(true);
    Promise.all([
      getStudent(),
      getEnrolledCourses(),
      getGrades(),
      getFriends(),
      getRecommendations(),
      getAllCourses(),
      getLecturers(),
    ]).then(([s, c, g, f, r, ac, lec]) => {
      setStudent(s);
      setCourses(c ?? []);
      setGrades(g ?? []);
      setFriends(f ?? []);
      setRecommendations(r ?? []);
      setAllCourses(ac ?? []);
      setLecturers(lec ?? []);
    }).finally(() => setDataLoading(false));
  }, [session]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.appBus = {
      openAddCourse: (prefill = null, semester = DEFAULT_SEMESTER) => { setAddCoursePrefill(prefill); setAddCourseSemester(semester); setAddCourseOpen(true); },
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

  const navigate = (key) => { setSelectedCourse(null); setRoute(key); };

  const handleSignOut = async () => {
    await signOut();
    setCourses([]); setStudent(null); setGrades([]); setFriends([]); setRecommendations([]);
    setRoute('dashboard');
  };

  const handleAddCourse = async (newCourse) => {
    try {
      await upsertCourse(newCourse);
      await addEnrollment(newCourse.code, false, newCourse.semester || addCourseSemester);
      const courseForState = { ...newCourse, start: newCourse.start ?? newCourse.start_hour, end: newCourse.end ?? newCourse.end_hour, semester: newCourse.semester || addCourseSemester, status: 'planned' };
      setCourses(prev => [...prev, courseForState]);
      setAllCourses(prev => prev.some(c => c.code === newCourse.code) ? prev : [...prev, courseForState]);
      setAddCourseOpen(false);
      setToasts(prev => [...prev, { id: Date.now(), title: 'קורס נוסף!', body: `"${newCourse.name}" נוסף למפת התואר` }]);
      popCelebration(null, newCourse.credits);
    } catch (err) {
      setToasts(prev => [...prev, { id: Date.now(), title: 'שגיאה', body: err?.message || 'הוספת הקורס נכשלה', kind: 'error' }]);
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      await upsertCourse(courseData);
      const updated = await getAllCourses();
      setAllCourses(updated);
      setToasts(prev => [...prev, { id: Date.now(), title: 'קורס נשמר!', body: `"${courseData.name}" עודכן בקטלוג` }]);
    } catch (err) {
      setToasts(prev => [...prev, { id: Date.now(), title: 'שגיאה', body: err?.message || 'שמירת הקורס נכשלה' }]);
    }
  };

  const handleEnrollFromCatalog = (course, semester) => {
    setAddCoursePrefill({ ...course, start: course.start ?? course.start_hour, end: course.end ?? course.end_hour });
    setAddCourseSemester(semester || DEFAULT_SEMESTER);
    setAddCourseOpen(true);
  };

  const handleUpdateEnrollment = async (courseCode, fields) => {
    await updateEnrollment(courseCode, fields);
    setCourses(prev => prev.map(c => c.code === courseCode ? { ...c, ...fields } : c));
  };

  const handleRemoveCourse = async (code) => {
    setCourses(prev => prev.filter(c => c.code !== code));
    await removeEnrollment(code);
  };

  // Still checking session
  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--fg-muted)' }}>
        טוען...
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <AuthScreen onAuth={() => {}} />;
  }

  // Data still loading
  if (dataLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--fg-muted)' }}>
        טוען נתונים...
      </div>
    );
  }

  const titles = {
    dashboard: ['דף הבית', student ? `${student.name}, הנה הסיכום שלך` : ''],
    roadmap:   ['מפת התואר', `${courses.length} קורסים · ${courses.filter(c=>c.status==='done').reduce((s,c)=>s+(c.credits||0),0)}/${student?.credits_required??120} נ"ז הושלמו`],
    schedule:  ['מערכת השעות', 'תצוגה שבועית'],
    catalog:   ['קטלוג קורסים', `${allCourses.length} קורסים במאגר`],
    course:    ['פרטי קורס', null],
    grades:    ['ציונים', 'גליון אישי'],
    recommend: ['המלצות', 'בחירות חכמות בשבילך'],
    friends:   ['חברים', 'קבוצות לימוד פעילות'],
    erd:       ['ארכיטקטורת מסד נתונים', 'תרשים ERD של המערכת'],
    settings:  ['הגדרות', null],
  };

  const renderRoute = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardScreen courses={courses} student={student} recommendations={recommendations} onNavigate={navigate} />;
      case 'roadmap':
        return (
          <RoadmapScreen
            courses={courses}
            student={student}
            allCourses={allCourses}
            enrolledCodes={new Set(courses.map(c => c.code))}
            onAddCourse={(semester) => window.appBus?.openAddCourse(null, semester)}
            onEnrollExisting={async (course, semester) => {
              try {
                await addEnrollment(course.code, false, semester);
                setCourses(prev => [...prev, { ...course, semester, status: 'planned' }]);
              } catch (err) {
                setToasts(prev => [...prev, { id: Date.now(), title: 'שגיאה', body: err?.message || 'ההרשמה נכשלה', kind: 'error' }]);
              }
            }}
            onRemoveCourse={handleRemoveCourse}
            onUpdateEnrollment={handleUpdateEnrollment}
          />
        );
      case 'schedule':
        return <ScheduleScreen courses={courses} onRemoveCourse={handleRemoveCourse} onCoursePick={(c) => {
          if (c) { setSelectedCourse(c); setRoute('course'); }
          else { window.appBus?.openAddCourse(); }
        }} />;
      case 'course':
        return <CourseDetailScreen course={selectedCourse} onBack={() => setRoute('schedule')} />;
      case 'catalog':
        return (
          <CatalogScreen
            allCourses={allCourses}
            enrolledCodes={new Set(courses.map(c => c.code))}
            lecturers={lecturers}
            onEnroll={handleEnrollFromCatalog}
            onSaveCourse={handleSaveCourse}
            onRefreshLecturers={async () => { const lec = await getLecturers(); setLecturers(lec); }}
          />
        );
      case 'recommend':
        return <RecommendScreen
          recommendations={recommendations}
          allCourses={allCourses}
          courses={courses}
          grades={grades}
          onCoursePick={handleEnrollFromCatalog}
        />;
      case 'grades':
        return <GradesScreen grades={grades} />;
      case 'friends':
        return <FriendsScreen friends={friends} />;
      case 'erd':
        return <ERDScreen />;
      case 'settings':
        return <SettingsScreen student={student} theme={theme} setTheme={setTheme} onSignOut={handleSignOut} />;
      default:
        return <DashboardScreen courses={courses} student={student} recommendations={recommendations} onNavigate={navigate} />;
    }
  };

  const [title, subtitle] = titles[route] || ['', ''];

  return (
    <div className="app-shell">
      <Sidebar active={route} onNavigate={navigate} student={student} />
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
        open={cmdOpen} onClose={() => setCmdOpen(false)} onNav={navigate}
        onCoursePick={(c) => { setSelectedCourse({ ...courses[0], ...c }); setRoute('course'); setCmdOpen(false); }}
        courses={courses} recommendations={recommendations} friends={friends}
      />
      <AddCourseModal
        open={addCourseOpen} onClose={() => setAddCourseOpen(false)}
        prefill={addCoursePrefill} courses={courses} onConfirm={handleAddCourse}
        defaultSemester={addCourseSemester}
      />
      <SchedulerTweaks />
    </div>
  );
};

export default App;
