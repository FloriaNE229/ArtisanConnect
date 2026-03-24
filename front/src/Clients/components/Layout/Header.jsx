import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Search, Hammer, User, UserPlus, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [isOpen,      setIsOpen]      = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isLoggedIn = !!token && !!user;

  const navLinks = [
    { name: 'Trouver un artisan', to: '/artisans' },
    ...(isLoggedIn ? [{ name: 'Service Immediat', to: '/services/immediate' }] : []),
    { name: 'Mes services', to: '/my-services' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/artisans?search=${encodeURIComponent(q)}` : '/artisans');
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout?.();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-white/95 backdrop-blur-xl"
      style={{ borderColor: 'var(--gray-dark)' }}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 transition-opacity rounded-2xl blur-lg opacity-30 group-hover:opacity-50"
                style={{ background: 'var(--primary)' }} />
              <div className="relative flex items-center justify-center transition-transform duration-300 shadow-xl w-11 h-11 rounded-2xl group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <Hammer className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black" style={{ color: 'var(--dark)' }}>DigitalArt</span>
              <span className="text-xs font-semibold -mt-0.5" style={{ color: 'var(--primary)' }}>
                L'expertise à votre service
              </span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <nav className="items-center hidden gap-6 ml-12 lg:flex">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className="px-4 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-gray-50 whitespace-nowrap"
                style={{ color: 'var(--dark)' }}
                onMouseEnter={e => e.target.style.color = '#ff7e5f'}
                onMouseLeave={e => e.target.style.color = 'var(--dark)'}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Barre de recherche Desktop */}
          <div className="flex-1 hidden max-w-2xl mx-8 md:flex">
            <form onSubmit={handleSearch} className="relative flex items-center w-full gap-2">
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2"
                  style={{ color: 'var(--primary-light)' }} />
                <input
                  type="text"
                  placeholder="Plombier, électricien, menuisier..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pr-4 text-sm placeholder-gray-400 transition border h-11 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  style={{
                    backgroundColor: 'var(--gray)',
                    borderColor: 'var(--gray-dark)',
                    color: 'var(--dark)'
                  }}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-md rounded-xl hover:shadow-lg whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
              >
                Rechercher
              </button>
            </form>
          </div>

          {/* Actions Desktop */}
          <div className="items-center hidden gap-3 lg:flex">
            {isLoggedIn ? (
              <>
                <Link to="/notifications">
                  <button className="relative p-2.5 rounded-full transition-all hover:bg-gray-100">
                    <Bell className="w-5 h-5" style={{ color: 'var(--dark)' }} />
                  </button>
                </Link>

                <Link to="/profile">
                  <button className="flex items-center gap-2 px-4 py-2 font-semibold transition-all border-2 rounded-xl hover:shadow-md"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                    {user.photo_profil ? (
                      <img
                        src={user.photo_profil}
                        alt={user.prenom}
                        className="object-cover w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-6 h-6 text-xs font-black text-white rounded-full"
                        style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}
                      >
                        {(user.prenom ?? user.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-sm">
                      {user.prenom ?? user.nom ?? 'Mon profil'}
                    </span>

                    {user.role === 'ARTISAN' && (
                      <span
                        className="px-1.5 py-0.5 text-xs font-bold rounded-md text-white"
                        style={{ backgroundColor: '#ff7e5f' }}
                      >
                        Artisan
                      </span>
                    )}
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full transition-all hover:bg-red-50 group"
                >
                  <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button
                    className="px-5 py-2.5 border rounded-xl transition-all font-semibold flex items-center gap-2 hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--light)',
                      color: '#ff7e5f',
                      borderColor: '#ff7e5f'
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Connexion</span>
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    className="px-5 py-2.5 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: '#ff7e5f' }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>S'inscrire</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Toggle Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl border transition-colors"
            style={{
              backgroundColor: 'var(--gray)',
              borderColor: 'var(--gray-dark)'
            }}
          >
            {isOpen
              ? <X className="w-6 h-6" style={{ color: 'var(--dark)' }} />
              : <Menu className="w-6 h-6" style={{ color: 'var(--dark)' }} />}
          </button>
        </div>
      </div>
    </header>
  );
}
