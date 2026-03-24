import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Clients/components/Auth/AuthContext"; // adapte le chemin

/**
 * Protège toutes les routes enfants de /admin.
 * Redirige vers /admin/login si :
 *  - l'utilisateur n'est pas connecté
 *  - ou son rôle n'est pas ADMIN
 */
export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  // Tant que le contexte Auth charge (vérification du token), on n'affiche rien
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pas connecté ou pas admin → login admin
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  // Connecté et admin → affiche les routes enfants (Outlet = AdminLayout + page)
  return <Outlet />;
}