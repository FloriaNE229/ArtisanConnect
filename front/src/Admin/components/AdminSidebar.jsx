import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Store,
  Briefcase,
  Star,
  Calendar,
  Settings,
  LogOut,
  Hammer,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Tableau de bord',       icon: LayoutDashboard, path: '/admin/dashboard' },
    { title: 'Utilisateurs',          icon: Users,           path: '/admin/users' },
    { title: 'Artisans',              icon: UserCheck,       path: '/admin/verification' },
    { title: 'Modération',            icon: Shield,          path: '/admin/moderation' },
    { title: 'Ateliers',              icon: Store,           path: '/admin/ateliers' },
    { title: 'Services',              icon: Briefcase,       path: '/admin/services' },
    { title: 'Rendez-vous',           icon: Calendar,        path: '/admin/appointments' },
    { title: 'Avis',                  icon: Star,            path: '/admin/reviews' },
    { title: 'Paramètres',            icon: Settings,        path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col w-64 min-h-screen p-6"
      style={{ backgroundColor: 'white', borderRight: '1px solid #e9ecef' }}>

      {/* Logo */}
      <Link to="/admin/dashboard" className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
          <Hammer className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#2b2d42' }}>DigitalArt</h1>
          <p className="text-xs" style={{ color: '#6c757d' }}>Admin Panel</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link to={item.path}
                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg"
                  style={{
                    backgroundColor: active ? 'rgba(74, 111, 165, 0.1)' : 'transparent',
                    color: active ? '#4a6fa5' : '#6c757d'
                  }}>
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profil + Déconnexion */}
      <div className="pt-6 border-t" style={{ borderColor: '#e9ecef' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full"
            style={{ background: 'linear-gradient(135deg, #ff7e5f, #ff6b4a)' }}>
            {user ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}` : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#2b2d42' }}>
              {user ? `${user.prenom} ${user.nom}` : 'Admin'}
            </p>
            <p className="text-xs truncate" style={{ color: '#6c757d' }}>
              {user?.email ?? 'admin@artisanconnect.com'}
            </p>
          </div>
        </div>

        {/* Bouton déconnexion → appelle POST /auth/logout */}
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-4 py-3 transition-all rounded-lg hover:bg-red-50"
          style={{ color: '#ef4444' }}>
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}