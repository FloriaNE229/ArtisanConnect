import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../Clients/components/Auth/AuthContext'; 

/**
 * AdminSessionGuard
 *
 * Surveille la navigation. Dès que l'utilisateur quitte /admin/*,
 * on :
 *   1. Révoque le token côté back (fire & forget)
 *   2. Appelle logout() du AuthContext → vide user + token en mémoire React
 *      → le Header re-render immédiatement sans les infos admin
 */
export default function AdminSessionGuard({ children }) {
  const location = useLocation();
  const { logout } = useAuth();           // ← vide l'état React du Header
  const wasOnAdmin = useRef(false);

  useEffect(() => {
    const isAdminProtected = location.pathname.startsWith('/admin') &&
                             location.pathname !== '/admin/login';

    if (isAdminProtected) {
      wasOnAdmin.current = true;
    } else if (wasOnAdmin.current) {
      // On vient de quitter /admin/* → déconnexion complète
      wasOnAdmin.current = false;

      // 1. Révocation back (fire & forget)
      authAPI.logout().catch(() => {});

      // 2. Vide le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');

      // 3. Reset l'état React → Header re-render sans les infos admin
      logout?.();
    }
  }, [location.pathname]);

  return children;
}