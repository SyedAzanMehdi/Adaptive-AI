import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import { RequireAuth } from "./components/Guards";
import StudentLayout from "./components/StudentLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/student/Dashboard";
import Diagnostic from "./pages/student/Diagnostic";
import Lessons from "./pages/student/Lessons";
import LessonPage from "./pages/student/LessonPage";
import AdminLayout from "./pages/admin/AdminLayout";

const Playground = lazy(() => import("./pages/student/Playground"));
const DomainCompass = lazy(() => import("./pages/student/DomainCompass"));
const Planner = lazy(() => import("./pages/student/Planner"));
const Autopilot = lazy(() => import("./pages/student/Autopilot"));
const Interview = lazy(() => import("./pages/student/Interview"));
const Pipeline = lazy(() => import("./pages/student/Pipeline"));
const Dojo = lazy(() => import("./pages/student/Dojo"));
const Resilience = lazy(() => import("./pages/student/Resilience"));
const Freelance = lazy(() => import("./pages/student/Freelance"));
const Chat = lazy(() => import("./pages/student/Chat"));
const PremiumPage = lazy(() => import("./pages/student/PremiumPage"));
const MemoryTwin = lazy(() => import("./pages/student/MemoryTwin"));
const RescueReview = lazy(() => import("./pages/student/RescueReview"));
const StruggleDNA = lazy(() => import("./pages/student/StruggleDNA"));
const FieldRecommendation = lazy(() => import("./pages/student/FieldRecommendation"));
const SoftwareHouses = lazy(() => import("./pages/student/SoftwareHouses"));
const TechDictionary = lazy(() => import("./pages/student/TechDictionary"));
const Users = lazy(() => import("./pages/admin/Users"));
const Curriculum = lazy(() => import("./pages/admin/Curriculum"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"));
const AdminSoftwareHouses = lazy(() => import("./pages/admin/SoftwareHouses"));

function PageFallback() {
  return <div className="flex justify-center py-16 text-neutral-600 dark:text-neutral-400">Loading…</div>;
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const home = user ? (user.role === "admin" ? "/admin" : "/") : "/login";

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <StudentLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="diagnostic" element={<Diagnostic />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="lessons/:conceptId" element={<LessonPage />} />
            <Route path="practice" element={<Playground />} />
            <Route path="dojo" element={<Dojo />} />
            <Route path="compass" element={<DomainCompass />} />
            <Route path="planner" element={<Planner />} />
            <Route path="autopilot" element={<Autopilot />} />
            <Route path="interview" element={<Interview />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="freelance" element={<Freelance />} />
            <Route path="resilience" element={<Resilience />} />
            <Route path="chat" element={<Chat />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="memory" element={<MemoryTwin />} />
            <Route path="rescue" element={<RescueReview />} />
            <Route path="dna" element={<StruggleDNA />} />
            <Route path="field-recommendation" element={<FieldRecommendation />} />
            <Route path="software-houses" element={<SoftwareHouses />} />
            <Route path="dictionary" element={<TechDictionary />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<Users />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="software-houses" element={<AdminSoftwareHouses />} />
          </Route>

          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
