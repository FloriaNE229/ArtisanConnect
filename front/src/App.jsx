import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import Header from "./Clients/components/Layout/Header";
import Footer from "./Clients/components/Layout/Footer";

// Auth
import Home           from "./Clients/pages/Home";
import Login          from "./Clients/pages/Auth/Login";
import Register       from "./Clients/pages/Auth/Register";
import ForgotPassword from "./Clients/pages/Auth/ForgotPassword";

// Catalog
import ArtisansList  from "./Clients/pages/Catalog/ArtisansList";
import ArtisanDetail from "./Clients/pages/Catalog/ArtisanDetail";

// Services
import MyServices       from "./Clients/pages/Services/MyServices";
import ServiceRequest   from "./Clients/pages/Services/ServiceRequest";
import ServiceImmediate from "./Clients/pages/Services/ServiceImmediate";

// Appointments
import MyAppointments  from "./Clients/pages/Appointments/MyAppointments";
import BookAppointment from "./Clients/pages/Appointments/BookAppointment";

// Profile
import ClientProfile from "./Clients/pages/Profile/ClientProfile";
import EditProfile   from "./Clients/pages/Profile/EditProfile";

// Atelier
import CreateAtelier   from "./Clients/pages/Atelier/CreateAtelier";
import EditAtelier     from "./Clients/pages/Atelier/EditAtelier";
import GestionHoraires from "./Clients/pages/Atelier/Gestionhoraires";
import GestionOeuvres  from "./Clients/pages/Atelier/Gestionoeuvres";
import GestionOffres   from "./Clients/pages/Atelier/Gestionoffres";

// Reviews
import WriteReview from "./Clients/pages/Reviews/WriteReview";
import MyReviews   from "./Clients/pages/Reviews/MyReviews";

// Notifications
import NotificationsList from "./Clients/pages/Notifications/NotificationsList";

// Admin
import AdminLogin               from "./Admin/pages/AdminLogin";
import AdminDashboard           from "./Admin/pages/AdminDashboard";
import AdminUsers               from "./Admin/pages/AdminUsers";
import AdminArtisanVerification from "./Admin/pages/AdminArtisanVerification";
import AdminModeration          from "./Admin/pages/AdminModeration";
import AdminAteliers            from "./Admin/pages/AdminAteliers";
import AdminServices            from "./Admin/pages/AdminServices";
import AdminAppointments        from "./Admin/pages/AdminAppointments";
import AdminReviews             from "./Admin/pages/AdminReviews";
import AdminSettings            from "./Admin/pages/AdminSettings";
import AdminLayout              from "./Admin/layouts/AdminLayout";
import AdminSessionGuard        from "./Admin/pages/AdminSessionGuard";

// Guards
import { AuthProvider } from "./Clients/components/Auth/AuthContext";
import ProtectedRoute      from "./component/ProtectedRoute";
import AdminProtectedRoute from "./component/AdminProtectedRoute";

// ── Wrapper layout client
function ClientLayout({ children, pt }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow${pt ? ` ${pt}` : ""}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* ─────────────────────────────────────────────────────────
            AdminSessionGuard doit être DANS BrowserRouter
            (il utilise useLocation) mais EN DEHORS de <Routes>
            pour surveiller TOUTES les navigations.
        ───────────────────────────────────────────────────────── */}
        <AdminSessionGuard>
          <Routes>

            {/* ══════════════════════════════════════
                Routes publiques
            ══════════════════════════════════════ */}
            <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
            <Route path="/login" element={<ClientLayout><Login /></ClientLayout>} />
            <Route path="/register" element={<ClientLayout pt="pt-20 md:pt-20"><Register /></ClientLayout>} />
            <Route path="/forgot-password" element={<ClientLayout><ForgotPassword /></ClientLayout>} />
            <Route path="/artisans" element={<ClientLayout><ArtisansList /></ClientLayout>} />
            <Route path="/artisan/:id" element={<ClientLayout><ArtisanDetail /></ClientLayout>} />

            {/* ══════════════════════════════════════
                Routes protégées (client / artisan)
            ══════════════════════════════════════ */}
            <Route path="/my-services" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT", "ARTISAN"]}><MyServices /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/services/request" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><ServiceRequest /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/services/request/:artisanId" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><ServiceRequest /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/services/immediate" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><ServiceImmediate /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/my-appointments" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT", "ARTISAN"]}><MyAppointments /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/appointments/book" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><BookAppointment /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/appointments/book/:artisanId" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><BookAppointment /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/profile" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT", "ARTISAN"]}><ClientProfile /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/profile/edit" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT", "ARTISAN"]}><EditProfile /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/atelier/create" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["ARTISAN"]}><CreateAtelier /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/atelier/:id/edit" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["ARTISAN"]}><EditAtelier /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/atelier/horaires" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["ARTISAN"]}><GestionHoraires /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/atelier/oeuvres" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["ARTISAN"]}><GestionOeuvres /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/atelier/offres" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["ARTISAN"]}><GestionOffres /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/reviews/write/:artisanId" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><WriteReview /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/my-reviews" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT"]}><MyReviews /></ProtectedRoute>
              </ClientLayout>
            } />

            <Route path="/notifications" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={["CLIENT", "ARTISAN"]}><NotificationsList /></ProtectedRoute>
              </ClientLayout>
            } />

            {/* ══════════════════════════════════════
                Routes Admin
            ══════════════════════════════════════ */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard"    element={<AdminDashboard />} />
                <Route path="users"        element={<AdminUsers />} />
                <Route path="verification" element={<AdminArtisanVerification />} />
                <Route path="moderation"   element={<AdminModeration />} />
                <Route path="ateliers"     element={<AdminAteliers />} />
                <Route path="services"     element={<AdminServices />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="reviews"      element={<AdminReviews />} />
                <Route path="settings"     element={<AdminSettings />} />
              </Route>
            </Route>

          </Routes>
        </AdminSessionGuard>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;