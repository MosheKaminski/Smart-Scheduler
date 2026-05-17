import Icon from './Icon';

export const Sidebar = ({ active, onNavigate, student }) => {
  const planning = [
    { key: 'dashboard', label: 'דף הבית',      icon: 'logo' },
    { key: 'roadmap',   label: 'מפת התואר',    icon: 'map' },
    { key: 'schedule',  label: 'מערכת השעות',  icon: 'calendar' },
    { key: 'catalog',   label: 'קטלוג קורסים', icon: 'book' },
  ];
  const academic = [
    { key: 'grades',    label: 'ציונים',         icon: 'graduation' },
    { key: 'recommend', label: 'המלצות',          icon: 'sparkles' },
  ];
  const social = [
    { key: 'friends',  label: 'חברים',           icon: 'users' },
    { key: 'erd',      label: 'ארכיטקטורת DB',   icon: 'database' },
    { key: 'settings', label: 'הגדרות',           icon: 'settings' },
  ];

  const NavItem = ({ item }) => (
    <button className={`sb-item ${active === item.key ? 'active' : ''}`} onClick={() => onNavigate(item.key)}>
      <Icon name={item.icon} size={18} />
      <span>{item.label}</span>
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <Icon name="logo" size={36} />
        <div>
          <div className="sb-brand-name">Smart Scheduler</div>
          <div className="sb-brand-sub">הקריה האקדמית אונו</div>
        </div>
      </div>

      <div className="sb-section-label">תכנון</div>
      {planning.map(it => <NavItem key={it.key} item={it} />)}

      <div className="sb-section-label">אקדמיה</div>
      {academic.map(it => <NavItem key={it.key} item={it} />)}

      <div className="sb-section-label">מערכת</div>
      {social.map(it => <NavItem key={it.key} item={it} />)}

      <div className="sb-user">
        <span className="avatar av-purple" style={{ width: 36, height: 36, fontSize: 14 }}>
          {student?.initial ?? '?'}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student?.name ?? ''}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
            {student?.program ?? ''}
          </div>
        </div>
      </div>
    </aside>
  );
};

export const TopBar = ({ title, subtitle, children, onBellClick }) => (
  <div className="topbar">
    <div>
      <h1>{title}</h1>
      {subtitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div className="topbar-spacer" />
    <div className="search-box">
      <Icon name="search" size={16} />
      <input placeholder="חיפוש קורסים, מרצים... (⌘K)" onFocus={() => window.appBus?.openCmdPalette?.()} readOnly />
      <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', background: 'var(--neutral-100)', padding: '2px 6px', borderRadius: 4 }}>⌘K</kbd>
    </div>
    <button className="btn-icon" title="התראות" onClick={onBellClick}><Icon name="bell" size={18} /></button>
    {children}
  </div>
);
