import { useState } from "react";
import EmptyState from "../components/EmptyState";
import "./SavedIdeasPage.css";

const sampleItems = [
  { id: 1, type: "Analogy", title: "Internet as a transportation network", date: "2 days ago" },
  { id: 2, type: "Concept", title: "Gravity", date: "5 days ago" },
  { id: 3, type: "Map", title: "Physics Foundations", date: "1 week ago" },
];

export default function SavedIdeasPage() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sampleItems.filter((item) => {
    if (filter !== "all" && item.type.toLowerCase() !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="saved-ideas">
      <div className="saved-ideas__header">
        <h2 className="saved-ideas__title">Saved Ideas</h2>
        <p className="saved-ideas__subtitle">
          Save useful analogies and concepts so you can return to them later.
        </p>
      </div>

      <div className="saved-ideas__controls">
        <div className="saved-ideas__search">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="saved-ideas__search-icon">
            <circle cx="7" cy="7" r="5" />
            <line x1="11" y1="11" x2="16" y2="16" />
          </svg>
          <input
            type="search"
            placeholder="Search saved items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saved-ideas__search-input"
          />
        </div>
        <select
          className="saved-ideas__filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="analogy">Analogies</option>
          <option value="concept">Concepts</option>
          <option value="map">Knowledge Maps</option>
        </select>
        <div className="saved-ideas__view-toggle">
          <button
            className={`saved-ideas__view-btn ${view === "grid" ? "saved-ideas__view-btn--active" : ""}`}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >▦</button>
          <button
            className={`saved-ideas__view-btn ${view === "list" ? "saved-ideas__view-btn--active" : ""}`}
            onClick={() => setView("list")}
            aria-label="List view"
          >☰</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📚"
          title="You have not saved any ideas yet."
          description="Save useful analogies and concepts so you can return to them later."
          actionLabel="Explore Concepts"
          onAction={() => {}}
        />
      ) : (
        <div className={`saved-ideas__grid ${view === "list" ? "saved-ideas__grid--list" : ""}`}>
          {filtered.map((item) => (
            <div key={item.id} className="saved-item-card">
              <span className="saved-item-card__type">{item.type}</span>
              <h4 className="saved-item-card__title">{item.title}</h4>
              <span className="saved-item-card__date">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
