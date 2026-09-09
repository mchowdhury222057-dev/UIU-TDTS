import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/routing/RequireAuth";
import { RequireRole } from "./components/routing/RequireRole";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { Dashboard } from "./pages/app/Dashboard";
import { Projects } from "./pages/app/Projects";
import { Teams } from "./pages/app/Teams";
import { Tasks } from "./pages/app/Tasks";
import { Kanban } from "./pages/app/Kanban";
import { SprintBoard } from "./pages/app/SprintBoard";
import { Timeline } from "./pages/app/Timeline";
import { Performance } from "./pages/app/Performance";
import { Reviews } from "./pages/app/Reviews";
import { Reports } from "./pages/app/Reports";
import { Roles } from "./pages/app/Roles";
import { Notifications } from "./pages/app/Notifications";
import { Settings } from "./pages/app/Settings";
import { Profile } from "./pages/app/Profile";
import { Help } from "./pages/app/Help";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="teams" element={<Teams />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="sprints" element={<SprintBoard />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
          <Route element={<RequireRole roles={["SUPER_ADMIN"]} />}>
            <Route path="roles" element={<Roles />} />
          </Route>
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
