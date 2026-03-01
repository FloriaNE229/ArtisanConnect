import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Star,
  FileText, Clock, Award, LogOut, Shield, Hammer,
  Briefcase, Store, Plus, Loader, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../components/Auth/AuthContext';

export default function ClientProfile() {
  const { user, logout, loading, accesToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState('overview');
  const [atelier,     setAtelier]     = useState(null);
  const [atelierLoad, setAtelierLoad] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const isNewRegistration = location.state?.newRegistration;
  const isArtisan = user?.role === 'ARTISAN' || user?.role === 'artisan';

  // ── Charger profil complet depuis l'API ────────────────────────────────────
  useEffect(() => {
    if (!user || !accesToken || !isArtisan) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/artisan/profile', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${accesToken}` },
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        setProfileData(data.user ?? data);
      } catch { /* utilise contexte */ }
    };
    fetchProfile();
  }, [user, accesToken, isArtisan]);

  // ── Charger atelier ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isArtisan || !accesToken) return;
    const fetchAtelier = async () => {
      setAtelierLoad(true);
      try {
        const res = await fetch('/api/atelier/mine', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${accesToken}` },
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        setAtelier(data.atelier ?? null);
      } catch { /* pas d'atelier = normal */ }
      finally { setAtelierLoad(false); }
    };
    fetchAtelier();
  }, [user, isArtisan, accesToken]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-12 h-12 animate-spin" style={{ color: '#4a6fa5' }} />
    </div>
  );

  // ── Non connecté ───────────────────────────────────────────────────────────
  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-lg font-semibold" style={{ color: '#2b2d42' }}>
        Vous devez être connecté pour voir votre profil.
      </p>
      <Link to="/login">
        <button className="px-8 py-3 font-bold text-white rounded-xl"
          style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
          Se connecter
        </button>
      </Link>
    </div>
  );

  const profile  = profileData ?? user;
  const fullName = (profile.name ?? `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim()) || profile.email;
  const initiale = fullName.charAt(0).toUpperCase();
  const photo    = (profile.photo_profil ?? profile.photo ?? profile.avatar) ?? null;
  const stats    = profile.stats ?? { services: 0, appointments: 0, reviews: 0 };
  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'info',     label: 'Informations'   },
    ...(isArtisan
      ? [{ id: 'artisan', label: 'Mon activité' }, { id: 'atelier', label: 'Mon atelier' }]
      : [{ id: 'activity', label: 'Activité'    }]
    ),
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>

      {/* Bannière bienvenue */}
      {isNewRegistration && (
        <div className="px-4 py-3 text-sm font-semibold text-center text-white"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          🎉 Bienvenue ! Votre compte {isArtisan ? 'artisan' : 'client'} a été créé avec succès.
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4a6fa5 0%, #2d4a7c 100%)', borderBottom: '4px solid #ff7e5f' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />

        <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-end">

            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-40 h-40 overflow-hidden transition-transform duration-300 bg-white border-4 border-white rounded-full shadow-2xl group-hover:scale-105">
                {photo ? (
                  <img src={photo} alt={fullName} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-6xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                    {initiale}
                  </div>
                )}
              </div>
              <Link to="/profile/edit">
                <button className="absolute bottom-0 right-0 p-3 text-white transition-all duration-300 rounded-full shadow-lg hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                  <Edit className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Infos */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center gap-3 mb-2 md:justify-start">
                <h1 className="text-4xl font-black text-white md:text-5xl">{fullName}</h1>
                {isArtisan && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-bold text-white rounded-full bg-white/20">
                    <Hammer className="w-4 h-4" /> Artisan
                  </span>
                )}
              </div>
              <p className="mb-4 text-lg text-white/80">Membre ArtisanConnect</p>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {profile.created_at && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-full bg-white/20">
                    <Calendar className="w-4 h-4" />
                    Membre depuis {new Date(profile.created_at).getFullYear()}
                  </span>
                )}
                {profile.verification_status === 'verified' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-green-500/90 text-white">
                    <Shield className="w-4 h-4" /> Compte vérifié
                  </span>
                )}
                {isArtisan && profile.specialite && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-full bg-white/20">
                    <Briefcase className="w-4 h-4" />
                    {profile.specialite.charAt(0).toUpperCase() + profile.specialite.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link to="/profile/edit">
                <button className="px-6 py-3 text-sm font-bold text-white transition-all border-2 border-white rounded-xl hover:bg-white hover:text-blue-900">
                  <Edit className="inline w-4 h-4 mr-2" />Modifier
                </button>
              </Link>
              <button onClick={handleLogout}
                className="px-6 py-3 text-sm font-bold text-white transition-all border-2 border-white/50 rounded-xl hover:bg-white/10">
                <LogOut className="inline w-4 h-4 mr-2" />Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mx-auto -mt-8 max-w-7xl sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 gap-4 ${isArtisan ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {[
            { label: 'Services',    value: stats.services ?? 0,     color: '#ff7e5f', Icon: FileText },
            { label: 'Rendez-vous', value: stats.appointments ?? 0, color: '#4a6fa5', Icon: Calendar },
            { label: 'Avis',        value: stats.reviews ?? 0,      color: '#f59e0b', Icon: Star     },
            ...(isArtisan ? [{ label: 'Note moy.', value: profile.rating ? Number(profile.rating).toFixed(1) : '–', color: '#22c55e', Icon: Award }] : []),
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="relative p-6 overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-semibold text-gray-500">{label}</p>
                  <p className="text-4xl font-black" style={{ color }}>{value}</p>
                </div>
                <div className="p-4 rounded-full" style={{ backgroundColor: `${color}1a` }}>
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex gap-2 p-2 overflow-x-auto bg-white shadow-md rounded-2xl">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {tab.label}
              {tab.id === 'atelier' && atelier && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  atelier.verification_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {atelier.verification_status === 'approved' ? '✓' : '⏳'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 mx-auto mt-6 mb-16 max-w-7xl sm:px-6 lg:px-8">

        {/* ── Vue d'ensemble ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <h3 className="mb-6 text-2xl font-black text-gray-900">Actions rapides</h3>
              <div className="space-y-3">
                {[
                  { to: '/my-services',     Icon: FileText, label: 'Mes demandes de services', sub: 'Gérer vos demandes'           },
                  { to: '/my-appointments', Icon: Calendar, label: 'Mes rendez-vous',           sub: 'Consulter votre agenda'       },
                  { to: '/my-reviews',      Icon: Star,     label: 'Mes avis',                  sub: 'Voir vos évaluations'         },
                  ...(isArtisan ? [{ to: `/artisan/${user.id}`, Icon: Hammer, label: 'Mon profil public', sub: 'Comment les clients me voient' }] : []),
                ].map(({ to, Icon, label, sub }) => (
                  <Link key={to} to={to}>
                    <button className="flex items-center w-full gap-4 p-4 transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 group">
                      <div className="p-3 transition-colors bg-gray-100 rounded-lg group-hover:bg-blue-100">
                        <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-gray-900">{label}</div>
                        <div className="text-sm text-gray-500">{sub}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </button>
                  </Link>
                ))}

                {isArtisan && (
                  <button onClick={() => navigate(atelier ? `/atelier/${atelier.id}/edit` : '/atelier/create')}
                    className="flex items-center w-full gap-4 p-4 transition-all duration-300 border-2 border-dashed rounded-xl hover:bg-orange-50 group"
                    style={{ borderColor: '#ff7e5f' }}>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,126,95,0.1)' }}>
                      {atelier ? <Store className="w-6 h-6" style={{ color: '#ff7e5f' }} /> : <Plus className="w-6 h-6" style={{ color: '#ff7e5f' }} />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold" style={{ color: '#ff7e5f' }}>
                        {atelier ? 'Gérer mon atelier' : 'Créer mon atelier'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {atelier ? 'Modifier vos offres et informations' : 'Exposez vos services aux clients'}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: '#ff7e5f' }} />
                  </button>
                )}
              </div>
            </div>

            <div className="relative p-8 overflow-hidden text-center text-white shadow-lg rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' }}>
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-white rounded-full shadow-xl">
                <Award className="w-12 h-12" style={{ color: '#ff7e5f' }} />
              </div>
              <h3 className="mb-3 text-3xl font-black">{isArtisan ? 'Artisan Certifié' : 'Membre Actif'}</h3>
              <p className="text-lg text-white/90">
                {isArtisan ? "Vous faites partie de notre réseau d'artisans professionnels" : "Vous êtes un membre actif de la communauté ArtisanConnect"}
              </p>
              {isArtisan && !atelier && (
                <button onClick={() => navigate('/atelier/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 mt-6 font-bold text-orange-500 transition-all bg-white rounded-xl hover:shadow-lg hover:scale-105">
                  <Plus className="w-5 h-5" /> Créer mon atelier
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Informations ── */}
        {activeTab === 'info' && (
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">Informations personnelles</h3>
              <Link to="/profile/edit">
                <button className="flex items-center gap-2 px-5 py-2.5 font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                  <Edit className="w-4 h-4" /> Modifier
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { Icon: User,      label: 'Nom complet', value: fullName,                               show: true      },
                { Icon: Mail,      label: 'Email',        value: profile.email,                          show: true      },
                { Icon: Phone,     label: 'Téléphone',    value: (profile.telephone ?? profile.phone ?? '—'), show: true },
                { Icon: Briefcase, label: 'Spécialité',   value: (profile.specialite ?? '—'),            show: isArtisan },
                { Icon: Award,     label: 'Expérience',   value: (profile.experience_level ?? '—'),      show: isArtisan },
                { Icon: FileText,  label: 'Bio',          value: (profile.bio ?? '—'),                   show: isArtisan },
              ].filter(f => f.show).map(({ Icon, label, value }) => (
                <div key={label} className="p-6 transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(74,111,165,0.1)' }}>
                      <Icon className="w-6 h-6" style={{ color: '#4a6fa5' }} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-semibold text-gray-500">{label}</div>
                      <div className="text-lg font-bold text-gray-900 break-words">{value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mon activité artisan ── */}
        {activeTab === 'artisan' && isArtisan && (
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-6 text-2xl font-black text-gray-900">Mon activité artisan</h3>
            <div className="p-6 text-center border-2 border-dashed rounded-xl" style={{ borderColor: '#e9ecef' }}>
              <Hammer className="w-12 h-12 mx-auto mb-4" style={{ color: '#4a6fa5', opacity: 0.4 }} />
              <p className="font-semibold text-gray-500">Vos missions et rendez-vous apparaîtront ici.</p>
              <Link to="/my-services">
                <button className="px-6 py-3 mt-4 font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                  Voir les demandes de service
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Mon atelier ── */}
        {activeTab === 'atelier' && isArtisan && (
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            {atelierLoad ? (
              <div className="flex justify-center py-10">
                <Loader className="w-8 h-8 animate-spin" style={{ color: '#4a6fa5' }} />
              </div>
            ) : !atelier ? (
              <div className="py-12 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
                  style={{ backgroundColor: 'rgba(255,126,95,0.1)' }}>
                  <Store className="w-10 h-10" style={{ color: '#ff7e5f' }} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Vous n'avez pas encore d'atelier</h3>
                <p className="mb-6 text-gray-500">Créez votre atelier pour exposer vos services aux clients</p>
                <button onClick={() => navigate('/atelier/create')}
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all rounded-xl hover:shadow-lg hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                  <Plus className="w-5 h-5" /> Créer mon atelier
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-2xl font-black text-gray-900">{atelier.nom}</h3>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />{atelier.localisation}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: 'rgba(74,111,165,0.1)', color: '#4a6fa5' }}>
                        {atelier.domaine}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        atelier.verification_status === 'approved' ? 'bg-green-100 text-green-700'
                        : atelier.verification_status === 'rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {atelier.verification_status === 'approved' ? '✓ Approuvé'
                          : atelier.verification_status === 'rejected' ? '✗ Rejeté'
                          : '⏳ En attente de validation'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/atelier/${atelier.id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-gray-600">{atelier.description}</p>

                {atelier.image_principale && (
                  <div className="h-48 overflow-hidden rounded-xl">
                    <img src={atelier.image_principale} alt={atelier.nom} className="object-cover w-full h-full" />
                  </div>
                )}

                {atelier.offres?.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-bold text-gray-900">Mes offres ({atelier.offres.length})</h4>
                    <div className="space-y-2">
                      {atelier.offres.map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 transition-all border-2 border-gray-100 rounded-lg hover:border-blue-200">
                          <span className="font-semibold text-gray-800">{o.titre ?? o.title}</span>
                          <span className="font-black" style={{ color: '#ff7e5f' }}>{o.prix ?? o.price} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Activité client ── */}
        {activeTab === 'activity' && !isArtisan && (
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-8 text-2xl font-black text-gray-900">Activité récente</h3>
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#4a6fa5', opacity: 0.3 }} />
              <p className="font-semibold text-gray-500">Aucune activité récente pour l'instant.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}