import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, Mail, Calendar, Clock, Award, Shield,
  MessageCircle, ChevronLeft, Heart, Share2, CheckCircle,
  Edit, Plus, Store, Hammer, AlertCircle, Loader
} from 'lucide-react';
import Button from '../../components/Common/Button';
import Card from '../../components/Common/Card';
import { useAuth } from '../../components/Auth/AuthContext';

export default function ArtisanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accesToken } = useAuth();

  const [artisan,    setArtisan]    = useState(null);
  const [atelier,    setAtelier]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('about');
  const [selectedImg,setSelectedImg]= useState(0);

  // L'artisan connecté consulte SA propre page ?
  const isOwnProfile = user && String(user.id) === String(id);
  const isArtisan    = user?.role === 'ARTISAN' || user?.role === 'artisan';

  // ── Charger le profil artisan ──────────────────────────────────────────────
  useEffect(() => {
    const fetchArtisan = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/artisans/${id}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Artisan introuvable');
        const data = await res.json();
        setArtisan(data.artisan ?? data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();
  }, [id]);

  // ── Charger l'atelier ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAtelier = async () => {
      try {
        // Si c'est son propre profil → endpoint privé (avec auth)
        // Sinon → endpoint public
        const url = isOwnProfile
          ? '/api/atelier/mine'
          : `/api/artisans/${id}/atelier`;

        const headers = { Accept: 'application/json' };
        if (isOwnProfile && accesToken) {
          headers['Authorization'] = `Bearer ${accesToken}`;
        }

        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setAtelier(data.atelier ?? null);
      } catch {
        // Pas d'atelier = normal
      }
    };
    fetchAtelier();
  }, [id, isOwnProfile, accesToken]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fullName  = artisan
    ? (artisan.name ?? `${artisan.prenom ?? ''} ${artisan.nom ?? ''}`.trim())
    : '';
  const initiale  = fullName.charAt(0).toUpperCase();
  const photo     = artisan?.photo ?? artisan?.photo_profil ?? artisan?.image ?? null;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-10 h-10 animate-spin" style={{ color: '#4a6fa5' }} />
    </div>
  );

  // ── Erreur ─────────────────────────────────────────────────────────────────
  if (error || !artisan) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="w-12 h-12" style={{ color: '#ff7e5f' }} />
      <p className="text-lg font-bold" style={{ color: '#2b2d42' }}>
        {error ?? 'Artisan introuvable'}
      </p>
      <Link to="/artisans">
        <button className="px-6 py-3 font-bold text-white rounded-xl"
          style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
          Retour à la liste
        </button>
      </Link>
    </div>
  );

  // ── Tabs selon la vue ──────────────────────────────────────────────────────
  const tabs = isOwnProfile
    ? [
        { id: 'about',   label: 'Mon profil' },
        { id: 'atelier', label: atelier ? 'Mon atelier' : 'Créer mon atelier' },
      ]
    : [
        { id: 'about',   label: 'À propos' },
        ...(atelier ? [{ id: 'atelier', label: 'Atelier & Offres' }] : []),
        { id: 'reviews', label: `Avis (${artisan.reviews ?? 0})` },
      ];

  const gallery = atelier?.photos ?? (photo ? [photo] : []);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/artisans" className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#4a6fa5' }}>
            <ChevronLeft className="w-4 h-4" />
            Retour aux artisans
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Colonne principale ── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Hero Card */}
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl">

              {/* Banner / Photo */}
              <div className="relative h-64" style={{ background: 'linear-gradient(135deg, #4a6fa5 0%, #2d4a7c 100%)' }}>
                {photo ? (
                  <img src={photo} alt={fullName} className="object-cover w-full h-full opacity-30" />
                ) : (
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                )}

                {/* Badges */}
                <div className="absolute flex gap-2 top-4 left-4">
                  {artisan.verification_status === 'verified' && (
                    <div className="flex items-center gap-1 px-3 py-1 text-sm font-bold bg-white rounded-full shadow"
                      style={{ color: '#4a6fa5' }}>
                      <Shield className="w-4 h-4" /> Vérifié
                    </div>
                  )}
                  {artisan.available && (
                    <div className="px-3 py-1 text-sm font-bold text-white rounded-full shadow"
                      style={{ backgroundColor: '#22c55e' }}>
                      Disponible
                    </div>
                  )}
                </div>

                {/* Actions (vue client) */}
                {!isOwnProfile && (
                  <div className="absolute flex gap-2 top-4 right-4">
                    <button className="flex items-center justify-center w-10 h-10 transition-all bg-white rounded-full shadow hover:scale-110">
                      <Heart className="w-5 h-5" style={{ color: '#ff7e5f' }} />
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 transition-all bg-white rounded-full shadow hover:scale-110">
                      <Share2 className="w-5 h-5" style={{ color: '#4a6fa5' }} />
                    </button>
                  </div>
                )}

                {/* Bouton édition (vue artisan) */}
                {isOwnProfile && (
                  <div className="absolute top-4 right-4">
                    <Link to="/profile/edit">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-all border-2 border-white rounded-xl hover:bg-white hover:text-blue-900">
                        <Edit className="w-4 h-4" /> Modifier mon profil
                      </button>
                    </Link>
                  </div>
                )}

                {/* Avatar */}
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 overflow-hidden border-4 border-white rounded-full shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                    {photo ? (
                      <img src={photo} alt={fullName} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-4xl font-black text-white">
                        {initiale}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="px-8 pt-16 pb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="mb-1 text-3xl font-black" style={{ color: '#2b2d42' }}>{fullName}</h1>
                    <p className="mb-1 text-lg font-bold" style={{ color: '#ff7e5f' }}>
                      {artisan.specialty ?? artisan.specialite}
                    </p>
                    {(artisan.location ?? artisan.ville) && (
                      <div className="flex items-center gap-1 text-sm" style={{ color: '#2b2d42', opacity: 0.6 }}>
                        <MapPin className="w-4 h-4" />
                        {artisan.location ?? artisan.ville}
                      </div>
                    )}
                  </div>
                  {artisan.rating != null && (
                    <div className="text-right">
                      <div className="text-3xl font-black" style={{ color: '#4a6fa5' }}>{artisan.rating}</div>
                      <div className="flex items-center justify-end mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(artisan.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <div className="text-xs" style={{ color: '#2b2d42', opacity: 0.5 }}>
                        {artisan.reviews ?? 0} avis
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "ans d'expérience", value: artisan.experience ?? '–', color: '#4a6fa5', bg: 'rgba(74,111,165,0.1)' },
                    { label: 'projets réalisés',  value: artisan.completedProjects ?? '–', color: '#ff7e5f', bg: 'rgba(255,126,95,0.1)' },
                    { label: 'satisfaction',       value: '98%', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className="p-4 text-center rounded-xl" style={{ backgroundColor: bg }}>
                      <div className="text-2xl font-black" style={{ color }}>{value}</div>
                      <div className="mt-1 text-xs" style={{ color: '#2b2d42', opacity: 0.7 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div className="flex overflow-x-auto border-b" style={{ borderColor: '#e9ecef' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-6 py-4 text-sm font-bold transition-all whitespace-nowrap"
                    style={{
                      color: activeTab === tab.id ? '#4a6fa5' : '#2b2d42',
                      borderBottom: activeTab === tab.id ? '3px solid #4a6fa5' : '3px solid transparent',
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">

                {/* ── Onglet À propos ── */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {artisan.bio && (
                      <div>
                        <h3 className="mb-3 text-xl font-bold" style={{ color: '#2b2d42' }}>
                          {isOwnProfile ? 'Ma biographie' : `À propos de ${fullName}`}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#2b2d42', opacity: 0.8 }}>
                          {artisan.bio}
                        </p>
                      </div>
                    )}

                    {!artisan.bio && isOwnProfile && (
                      <div className="p-4 text-center border-2 border-dashed rounded-xl" style={{ borderColor: '#e9ecef' }}>
                        <p className="mb-3 text-sm" style={{ color: '#2b2d42', opacity: 0.5 }}>
                          Vous n'avez pas encore de biographie.
                        </p>
                        <Link to="/profile/edit">
                          <button className="px-4 py-2 text-sm font-bold text-white rounded-lg"
                            style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                            Compléter mon profil
                          </button>
                        </Link>
                      </div>
                    )}

                    {artisan.specialite && (
                      <div>
                        <h3 className="mb-3 text-xl font-bold" style={{ color: '#2b2d42' }}>Spécialité</h3>
                        <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full"
                          style={{ backgroundColor: 'rgba(74,111,165,0.1)', color: '#4a6fa5' }}>
                          <Hammer className="w-4 h-4" />
                          {artisan.specialite}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Onglet Atelier ── */}
                {activeTab === 'atelier' && (
                  <div>
                    {/* Vue artisan connecté sans atelier */}
                    {isOwnProfile && !atelier && (
                      <div className="py-12 text-center">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
                          style={{ backgroundColor: 'rgba(255,126,95,0.1)' }}>
                          <Store className="w-10 h-10" style={{ color: '#ff7e5f' }} />
                        </div>
                        <h3 className="mb-3 text-2xl font-bold" style={{ color: '#2b2d42' }}>
                          Vous n'avez pas encore d'atelier
                        </h3>
                        <p className="mb-6 text-sm" style={{ color: '#2b2d42', opacity: 0.6 }}>
                          Créez votre atelier pour exposer vos produits et services aux clients
                        </p>
                        <button onClick={() => navigate('/atelier/create')}
                          className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all rounded-xl hover:shadow-lg hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                          <Plus className="w-5 h-5" />
                          Créer mon atelier
                        </button>
                      </div>
                    )}

                    {/* Atelier existant */}
                    {atelier && (
                      <div className="space-y-6">
                        {/* Header atelier */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-1 text-2xl font-black" style={{ color: '#2b2d42' }}>
                              {atelier.nom}
                            </h3>
                            <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: '#2b2d42', opacity: 0.6 }}>
                              <MapPin className="w-4 h-4" />{atelier.localisation}
                            </div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full"
                              style={{ backgroundColor: 'rgba(74,111,165,0.1)', color: '#4a6fa5' }}>
                              {atelier.domaine}
                            </span>

                            {/* Badge statut (vue artisan) */}
                            {isOwnProfile && (
                              <span className={`ml-2 px-3 py-1 text-xs font-bold rounded-full ${
                                atelier.verification_status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : atelier.verification_status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {atelier.verification_status === 'approved' ? '✓ Approuvé'
                                  : atelier.verification_status === 'rejected' ? '✗ Rejeté'
                                  : '⏳ En attente'}
                              </span>
                            )}
                          </div>

                          {isOwnProfile && (
                            <button onClick={() => navigate(`/atelier/${atelier.id}/edit`)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl"
                              style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                              <Edit className="w-4 h-4" /> Modifier
                            </button>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm leading-relaxed" style={{ color: '#2b2d42', opacity: 0.8 }}>
                          {atelier.description}
                        </p>

                        {/* Image principale */}
                        {atelier.image_principale && (
                          <div className="h-56 overflow-hidden rounded-xl">
                            <img src={atelier.image_principale} alt={atelier.nom}
                              className="object-cover w-full h-full" />
                          </div>
                        )}

                        {/* Offres */}
                        {atelier.offres && atelier.offres.length > 0 && (
                          <div>
                            <h4 className="mb-4 text-lg font-bold" style={{ color: '#2b2d42' }}>
                              Offres de services
                            </h4>
                            <div className="space-y-3">
                              {atelier.offres.map(offre => (
                                <div key={offre.id} className="flex items-start justify-between p-4 transition-all border-2 rounded-xl hover:shadow-md"
                                  style={{ borderColor: '#e9ecef' }}>
                                  <div>
                                    <div className="mb-1 font-bold" style={{ color: '#2b2d42' }}>{offre.titre ?? offre.title}</div>
                                    <div className="text-sm" style={{ color: '#2b2d42', opacity: 0.6 }}>{offre.description}</div>
                                  </div>
                                  <div className="ml-4 text-right">
                                    <div className="text-lg font-black" style={{ color: '#ff7e5f' }}>
                                      {offre.prix ?? offre.price} FCFA
                                    </div>
                                    {!isOwnProfile && (
                                      <button className="px-3 py-1 mt-1 text-xs font-bold text-white rounded-lg"
                                        style={{ backgroundColor: '#4a6fa5' }}>
                                        Commander
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Avis sur l'atelier */}
                        {atelier.avis && atelier.avis.length > 0 && (
                          <div>
                            <h4 className="mb-4 text-lg font-bold" style={{ color: '#2b2d42' }}>Avis clients</h4>
                            <div className="space-y-3">
                              {atelier.avis.map(avis => (
                                <div key={avis.id} className="p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold" style={{ color: '#2b2d42' }}>
                                      {avis.user?.prenom ?? 'Client'}
                                    </span>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < avis.note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.7 }}>{avis.commentaire}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Onglet Avis (vue client) ── */}
                {activeTab === 'reviews' && !isOwnProfile && (
                  <div className="space-y-4">
                    {artisan.customerReviews && artisan.customerReviews.length > 0 ? (
                      artisan.customerReviews.map((review) => (
                        <div key={review.id} className="flex items-start gap-4 p-4 rounded-xl"
                          style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 font-bold text-white rounded-full"
                            style={{ backgroundColor: '#4a6fa5' }}>
                            {review.author?.[0] ?? '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold" style={{ color: '#2b2d42' }}>{review.author}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.7 }}>{review.comment}</p>
                            {review.verified && (
                              <div className="flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: '#22c55e' }}>
                                <CheckCircle className="w-3 h-3" /> Avis vérifié
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <Star className="w-10 h-10 mx-auto mb-3" style={{ color: '#4a6fa5', opacity: 0.3 }} />
                        <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.5 }}>Aucun avis pour l'instant.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6 lg:col-span-1">

            {/* Vue artisan connecté */}
            {isOwnProfile ? (
              <>
                <div className="p-6 bg-white shadow-lg rounded-2xl">
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#2b2d42' }}>Mon espace artisan</h3>
                  <div className="space-y-3">
                    <Link to="/profile/edit">
                      <button className="flex items-center w-full gap-3 p-3 transition-all border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 group">
                        <Edit className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        <span className="text-sm font-bold" style={{ color: '#2b2d42' }}>Modifier mon profil</span>
                      </button>
                    </Link>
                    {!atelier ? (
                      <button onClick={() => navigate('/atelier/create')}
                        className="flex items-center w-full gap-3 p-3 transition-all border-2 border-dashed rounded-xl hover:border-orange-400 hover:bg-orange-50 group"
                        style={{ borderColor: '#ff7e5f' }}>
                        <Plus className="w-5 h-5" style={{ color: '#ff7e5f' }} />
                        <span className="text-sm font-bold" style={{ color: '#ff7e5f' }}>Créer mon atelier</span>
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/atelier/${atelier.id}/edit`)}
                        className="flex items-center w-full gap-3 p-3 transition-all border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 group">
                        <Store className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                        <span className="text-sm font-bold" style={{ color: '#2b2d42' }}>Gérer mon atelier</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white shadow-lg rounded-2xl">
                  <h3 className="mb-3 text-lg font-bold" style={{ color: '#2b2d42' }}>Statut du compte</h3>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                    artisan.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <Shield className="w-4 h-4" />
                    {artisan.verification_status === 'verified' ? 'Compte vérifié' : 'Vérification en attente'}
                  </div>
                </div>
              </>
            ) : (
              /* Vue client */
              <>
                <div className="p-6 bg-white shadow-lg rounded-2xl">
                  <h3 className="mb-4 text-xl font-bold" style={{ color: '#2b2d42' }}>Contacter l'artisan</h3>
                  <div className="mb-6 space-y-3">
                    {artisan.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                        <Phone className="w-5 h-5" style={{ color: '#4a6fa5' }} />
                        <div>
                          <div className="text-xs" style={{ color: '#2b2d42', opacity: 0.5 }}>Téléphone</div>
                          <div className="text-sm font-bold" style={{ color: '#2b2d42' }}>{artisan.phone}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                      <Mail className="w-5 h-5" style={{ color: '#4a6fa5' }} />
                      <div>
                        <div className="text-xs" style={{ color: '#2b2d42', opacity: 0.5 }}>Email</div>
                        <div className="text-sm font-bold" style={{ color: '#2b2d42' }}>{artisan.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link to={`/appointments/book/${id}`} className="block">
                      <button className="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-all rounded-xl hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                        <Calendar className="w-5 h-5" /> Prendre rendez-vous
                      </button>
                    </Link>
                    <Link to={`/services/request/${id}`} className="block">
                      <button className="flex items-center justify-center w-full gap-2 py-3 font-bold transition-all border-2 rounded-xl hover:bg-gray-50"
                        style={{ borderColor: '#4a6fa5', color: '#4a6fa5' }}>
                        <Clock className="w-5 h-5" /> Demande de service
                      </button>
                    </Link>
                    <button className="flex items-center justify-center w-full gap-2 py-3 font-bold transition-all border-2 rounded-xl hover:bg-gray-50"
                      style={{ borderColor: '#e9ecef', color: '#2b2d42' }}>
                      <MessageCircle className="w-5 h-5" /> Envoyer un message
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-white shadow-lg rounded-2xl">
                  <h3 className="mb-4 text-lg font-bold" style={{ color: '#2b2d42' }}>Garanties</h3>
                  <div className="space-y-3">
                    {[
                      { Icon: CheckCircle, color: '#22c55e', title: 'Travail garanti',       sub: 'Satisfaction 30 jours' },
                      { Icon: Shield,      color: '#4a6fa5', title: 'Professionnel vérifié', sub: 'Identité et qualifications' },
                      { Icon: Star,        color: '#fbbf24', title: 'Service de qualité',    sub: `Note ${artisan.rating ?? '–'}/5` },
                    ].map(({ Icon, color, title, sub }) => (
                      <div key={title} className="flex items-start gap-3">
                        <Icon className="flex-shrink-0 w-5 h-5 mt-0.5" style={{ color }} />
                        <div>
                          <div className="text-sm font-bold" style={{ color: '#2b2d42' }}>{title}</div>
                          <div className="text-xs" style={{ color: '#2b2d42', opacity: 0.6 }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}