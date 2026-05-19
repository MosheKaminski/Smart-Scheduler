import Icon from './Icon';

export const Sidebar = ({ active, onNavigate, student, open = true, onToggle }) => {
  const planning = [
    { key: 'dashboard', label: 'דף הבית',      icon: 'logo' },
    { key: 'roadmap',   label: 'מפת התואר',    icon: 'map' },
    { key: 'schedule',  label: 'מערכת השעות',  icon: 'calendar' },
    { key: 'catalog',   label: 'קטלוג קורסים', icon: 'book' },
  ];
  const academic = [
    { key: 'grades',    label: 'ציונים',          icon: 'graduation' },
    { key: 'whatif',    label: 'סימולטור What-if', icon: 'flask' },
    { key: 'recommend', label: 'המלצות',           icon: 'sparkles' },
  ];
  const social = [
    { key: 'friends',  label: 'חברים',           icon: 'users' },
    { key: 'erd',      label: 'ארכיטקטורת DB',   icon: 'database' },
    { key: 'settings', label: 'הגדרות',           icon: 'settings' },
  ];

  const NavItem = ({ item }) => (
    <button
      className={`sb-item ${active === item.key ? 'active' : ''} ${!open ? 'collapsed' : ''}`}
      onClick={() => onNavigate(item.key)}
      title={!open ? item.label : undefined}
    >
      <Icon name={item.icon} size={18} />
      {open && <span>{item.label}</span>}
    </button>
  );

  return (
    <aside className={`sidebar ${open ? '' : 'sidebar-collapsed'}`}>
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo"><Icon name="logo" size={open ? 34 : 28} /></div>
        {open && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sb-brand-name">Smart Scheduler</div>
            <div className="sb-brand-sub">הקריה האקדמית אונו</div>
          </div>
        )}
        <button className="sb-toggle-btn" onClick={onToggle} title={open ? 'כווץ סיידבר' : 'הרחב סיידבר'}>
          <Icon name={open ? 'arrow-right' : 'arrow-left'} size={14} />
        </button>
      </div>

      {/* Nav */}
      {open && <div className="sb-section-label">תכנון</div>}
      {!open && <div className="sb-divider" />}
      {planning.map(it => <NavItem key={it.key} item={it} />)}

      {open && <div className="sb-section-label">אקדמיה</div>}
      {!open && <div className="sb-divider" />}
      {academic.map(it => <NavItem key={it.key} item={it} />)}

      {open && <div className="sb-section-label">מערכת</div>}
      {!open && <div className="sb-divider" />}
      {social.map(it => <NavItem key={it.key} item={it} />)}

      {/* User */}
      <div className={`sb-user ${!open ? 'sb-user-collapsed' : ''}`}>
        <span className="avatar av-purple" style={{ width: open ? 34 : 30, height: open ? 34 : 30, fontSize: 13, flexShrink: 0 }}>
          {student?.initial ?? '?'}
        </span>
        {open && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#b8dfc4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {student?.name ?? ''}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3d6e4a' }}>
              {student?.program ?? ''}
            </div>
          </div>
        )}
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
