import { useTheme } from "../contexts/AppContext";
import "./TopBar.css";

export default function TopBar({ onToggleSidebar, pageTitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="topbar__title">{pageTitle || "Analogy"}</h1>
      </div>

      <div className="topbar__center">
        <div className="topbar__search">
          <svg className="topbar__search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="16" y2="16" />
          </svg>
          <input
            type="search"
            placeholder="Search a concept or ask a question…"
            className="topbar__search-input"
            aria-label="Search concepts or ask a question"
          />
        </div>
      </div>

      <div className="topbar__right">
        <button
          className="topbar__icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="4" />
              <path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.93 4.93l1.41 1.41m9.32 9.32l1.41 1.41M4.93 15.07l1.41-1.41m9.32-9.32l1.41-1.41" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 10.5A8 8 0 017.5 3a7.5 7.5 0 1015 0z" />
            </svg>
          )}
        </button>

        <button className="topbar__icon-btn" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2a5 5 0 015 5v2l1.5 3H3.5L3 9V7a5 5 0 015-5z" />
            <path d="M8 16a2 2 0 004 0" />
          </svg>
        </button>

        <div className="topbar__avatar" aria-label="User profile">
          <span className="topbar__avatar-initial">U</span>
        </div>
      </div>
    </header>
  );
}
