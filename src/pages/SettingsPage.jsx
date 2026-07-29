import { useTheme } from "../contexts/AppContext";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings">
      <div className="settings__header">
        <h2 className="settings__title">Settings</h2>
        <p className="settings__subtitle">Customize your learning experience.</p>
      </div>

      <div className="settings__section">
        <h3 className="settings__section-title">Appearance</h3>
        <div className="settings__row">
          <div>
            <span className="settings__label">Theme</span>
            <span className="settings__desc">Choose between light and dark mode.</span>
          </div>
          <button className="btn btn--secondary" onClick={toggleTheme}>
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>

      <div className="settings__section">
        <h3 className="settings__section-title">Learning Preferences</h3>
        <div className="settings__row">
          <div>
            <span className="settings__label">Default Difficulty</span>
            <span className="settings__desc">Preferred complexity for generated analogies.</span>
          </div>
          <select className="settings__select" defaultValue="intermediate">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
    </div>
  );
}
