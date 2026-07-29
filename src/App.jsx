import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/AppContext";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";
import AnalogyGeneratorPage from "./pages/AnalogyGeneratorPage";
import KnowledgeMapPage from "./pages/KnowledgeMapPage";
import LearningPathPage from "./pages/LearningPathPage";
import PracticeLabPage from "./pages/PracticeLabPage";
import ProgressPage from "./pages/ProgressPage";
import SavedIdeasPage from "./pages/SavedIdeasPage";
import SettingsPage from "./pages/SettingsPage";

const pageTitles = {
  home: "Analogy",
  explore: "Explore Concepts",
  generate: "Create an Analogy",
  map: "Knowledge Map",
  "learning-path": "Learning Path",
  practice: "Practice Lab",
  progress: "My Progress",
  saved: "Saved Ideas",
  settings: "Settings",
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.replace("/", "") || "home";

  return (
    <AppShell currentPage={currentPage} pageTitle={pageTitles[currentPage] || "Analogy"} onNavigate={(page) => navigate(`/${page}`)}>
      <Routes>
        <Route path="/" element={<HomePage onNavigate={(page) => navigate(`/${page}`)} />} />
        <Route path="/explore" element={<HomePage onNavigate={(page) => navigate(`/${page}`)} />} />
        <Route path="/generate" element={<AnalogyGeneratorPage onNavigate={(page) => navigate(`/${page}`)} />} />
        <Route path="/map" element={<KnowledgeMapPage />} />
        <Route path="/learning-path" element={<LearningPathPage onNavigate={(page) => navigate(`/${page}`)} />} />
        <Route path="/practice" element={<PracticeLabPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/saved" element={<SavedIdeasPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
