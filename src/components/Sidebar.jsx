import { useTheme } from "../contexts/AppContext";
import "./Sidebar.css";

const navItems = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "explore", label: "Explore Concepts", icon: ExploreIcon },
  { id: "generate", label: "Create an Analogy", icon: GenerateIcon },
  { id: "map", label: "Knowledge Map", icon: MapIcon },
  { id: "learning-path", label: "Learning Path", icon: PathIcon },
  { id: "practice", label: "Practice Lab", icon: PracticeIcon },
  { id: "progress", label: "My Progress", icon: ProgressIcon },
  { id: "saved", label: "Saved Ideas", icon: SavedIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ currentPage, onNavigate, isOpen }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
              <circle cx="10" cy="12" r="2" fill="currentColor" />
              <circle cx="22" cy="12" r="2" fill="currentColor" />
              <circle cx="16" cy="22" r="2" fill="currentColor" />
              <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="12" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
              <line x1="22" y1="12" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="sidebar__brand">
            <span className="sidebar__title">Analogy</span>
            <span className="sidebar__tagline">Learn through connections.</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar__item ${currentPage === item.id ? "sidebar__item--active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-current={currentPage === item.id ? "page" : undefined}
            >
              <span className="sidebar__icon" aria-hidden="true">
                <item.icon />
              </span>
              <span className="sidebar__label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__item"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="sidebar__icon" aria-hidden="true">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </span>
            <span className="sidebar__label">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10L10 3l7 7" />
      <path d="M5 8v8a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6" />
      <line x1="14" y1="14" x2="18" y2="18" />
    </svg>
  );
}

function GenerateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3v7m0 0l-3-3m3 3l3-3" />
      <path d="M3 14a7 7 0 0114 0" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="10" cy="14" r="2" />
      <line x1="5" y1="7" x2="10" y2="12" />
      <line x1="15" y1="7" x2="10" y2="12" />
      <line x1="5" y1="5" x2="15" y2="5" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16V6m4 10V4m4 12V9m4 7v-5" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v12m6-9v9m6-6v6" />
      <circle cx="3" cy="3" r="1" fill="currentColor" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="17" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 3" />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h6l3 5 3-5h3v14H5z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.93 4.93l1.41 1.41m9.32 9.32l1.41 1.41M4.93 15.07l1.41-1.41m9.32-9.32l1.41-1.41" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.93 4.93l1.41 1.41m9.32 9.32l1.41 1.41M4.93 15.07l1.41-1.41m9.32-9.32l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 10.5A8 8 0 017.5 3a7.5 7.5 0 1015 0z" />
    </svg>
  );
}
