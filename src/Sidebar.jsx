import Icon from './Icon';
import { CURRENT_STUDENT } from './data';

export const Sidebar = ({ active, onNavigate }) => {
  const items = [
    { key: 'dashboard',  label: 'דף הבית',          icon: 'logo' },
    { key: 'schedule',   label: 'מערכת השעות',      icon: 'calendar', count: 6 },
    { key: 'catalog',    label: 'קטלוג קורסים',     icon: 'book' },
    { key: 'course',     label: 'פרטי קורס',        icon: 'book' },
    { key: 'grades',     label: 'ציונים',           icon: 'graduation', count: 2 },
    { key: 'whatif',     label: 'סימולטור What-if', icon: 'flask' },
    { key: 'recommend',  label: 'המלצות',           icon: 'sparkles' },
    { key: 'friends',    label: 'חברים',             icon: 'users' },
    { key: 'erd',        label: 'ארכיטקטורת DB',    icon: 'database' },
    { key: 'settings',   label: 'הגדרות',            icon: 'settings' },
  ];

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
      {items.slice(0, 4).map(it => (
        <button key={it.key} className={`sb-item ${active === it.key ? 'active' : ''}`} onClick={() => onNavigate(it.key)}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
          {it.count && <span className="count">{it.count}</span>}
        </button>
      ))}

      <div className="sb-section-label">אקדמיה</div>
      {items.slice(4, 7).map(it => (
        <button key={it.key} className={`sb-item ${active === it.key ? 'active' : ''}`} onClick={() => onNavigate(it.key)}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
          {it.count && <span className="count">{it.count}</span>}
        </button>
      ))}

      <div className="sb-section-label">חברתי</div>
      {items.slice(7, 10).map(it => (
        <button key={it.key} className={`sb-item ${active === it.key ? 'active' : ''}`} onClick={() => onNavigate(it.key)}>
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
        </button>
      ))}

      <div className="sb-user">
        <span className="avatar av-purple" style={{ width: 36, height: 36, fontSize: 14 }}>{CURRENT_STUDENT.initial}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{CURRENT_STUDENT.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>{CURRENT_STUDENT.id}</div>
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
