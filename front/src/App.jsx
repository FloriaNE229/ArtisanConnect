import { BrowserRouter, Routes, Route } from "react-router-dom";

//  Imports Clients - Layout 
import Header from "./Clients/components/Layout/Header";
import Footer from "./Clients/components/Layout/Footer";

// Imports Clients - Auth
import Home from "./Clients/pages/Home";
import Login from "./Clients/pages/Auth/Login";
import Register from "./Clients/pages/Auth/Register";
import ForgotPassword from "./Clients/pages/Auth/ForgotPassword";

// Imports Clients - Catalog
import ArtisansList from "./Clients/pages/Catalog/ArtisansList";
import ArtisanDetail from "./Clients/pages/Catalog/ArtisanDetail";

// Imports Clients - Services 
import MyServices from "./Clients/pages/Services/MyServices";
import ServiceRequest from "./Clients/pages/Services/ServiceRequest";
import ServiceImmediate from "./Clients/pages/Services/ServiceImmediate";

// Imports Clients - Appointments 
import MyAppointments from "./Clients/pages/Appointments/MyAppointments";
import BookAppointment from "./Clients/pages/Appointments/BookAppointment";

// Imports - Profile 
import ClientProfile from "./Clients/pages/Profile/ClientProfile";
import EditProfile from "./Clients/pages/Profile/EditProfile";

// Imports - Atelier
import CreateAtelier from "./Clients/pages/Atelier/CreateAtelier";
import EditAtelier from "./Clients/pages/Atelier/EditAtelier";

// Imports Clients - Reviews 
import WriteReview from "./Clients/pages/Reviews/WriteReview";
import MyReviews from "./Clients/pages/Reviews/MyReviews";

// Imports Clients - Notifications 
import NotificationsList from "./Clients/pages/Notifications/NotificationsList";

// Imports Admin 
import AdminLogin from "./Admin/pages/AdminLogin";
import AdminDashboard from "./Admin/pages/AdminDashboard";
import AdminUsers from "./Admin/pages/AdminUsers";
import AdminArtisanVerification from "./Admin/pages/AdminArtisanVerification";
import AdminModeration from "./Admin/pages/AdminModeration";
import AdminAteliers from "./Admin/pages/AdminAteliers";
import AdminServices from "./Admin/pages/AdminServices";
import AdminAppointments from "./Admin/pages/AdminAppointments";
import AdminReviews from "./Admin/pages/AdminReviews";
import AdminSettings from "./Admin/pages/AdminSettings";
import AdminLayout from "./Admin/layouts/AdminLayout";
import { AuthProvider } from "./Clients/components/Auth/AuthContext";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ========== ROUTES CLIENT ========== */}

                    {/* Home */}
                    <Route
                        path="/"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <Home />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Auth */}
                    <Route
                        path="/login"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <Login />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow pt-20 md:pt-20 ">
                                    <Register />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ForgotPassword />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Catalog - Artisans */}
                    <Route
                        path="/artisans"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ArtisansList />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/artisan/:id"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ArtisanDetail />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Services */}
                    <Route
                        path="/my-services"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <MyServices />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/services/request"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ServiceRequest />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/services/request/:artisanId"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ServiceRequest />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/services/immediate"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ServiceImmediate />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Appointments */}
                    <Route
                        path="/my-appointments"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <MyAppointments />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/appointments/book"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <BookAppointment />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/appointments/book/:artisanId"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <BookAppointment />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Profile */}
                    <Route
                        path="/profile"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <ClientProfile />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/profile/edit"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <EditProfile />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* ── Atelier ── */}
                    <Route
                        path="/atelier/create"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <CreateAtelier />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/atelier/:id/edit"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <EditAtelier />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Reviews */}
                    <Route
                        path="/reviews/write/:artisanId"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <WriteReview />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    <Route
                        path="/my-reviews"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <MyReviews />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* Notifications */}
                    <Route
                        path="/notifications"
                        element={
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">
                                    <NotificationsList />
                                </main>
                                <Footer />
                            </div>
                        }
                    />

                    {/* ========== ROUTES ADMIN ========== */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="verification" element={<AdminArtisanVerification />} />
                        <Route path="moderation" element={<AdminModeration />} />
                        <Route path="ateliers" element={<AdminAteliers />} />
                        <Route path="services" element={<AdminServices />} />
                        <Route path="appointments" element={<AdminAppointments />} />
                        <Route path="reviews" element={<AdminReviews />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;