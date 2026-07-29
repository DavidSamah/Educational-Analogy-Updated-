import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./AppShell.css";

export default function AppShell({ children, currentPage, pageTitle, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-shell__main">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} pageTitle={pageTitle} />
        <main className="app-shell__content">
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="app-shell__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
