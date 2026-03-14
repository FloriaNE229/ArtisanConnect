import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Phone, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Card   from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Input  from '../../components/Common/Input';
import { serviceImmediatAPI } from '../../../../services/api';

const CATEGORIES = [
  { value: 'plomberie',   label: 'Plomberie',   icon: '🔧' },
  { value: 'electricite', label: 'Électricité', icon: '⚡' },
  { value: 'menuiserie',  label: 'Menuiserie',  icon: '🔨' },
  { value: 'mecanique',   label: 'Mécanique',   icon: '🔩' },
  { value: 'autre',       label: 'Autre',       icon: '🛠️' },
];

export default function ServiceImmediate() {
  const navigate = useNavigate();

  const [loading,       setLoading]       = useState(false);
  const [searching,     setSearching]     = useState(false);
  const [artisansFound, setArtisansFound] = useState([]);
  const [errors,        setErrors]        = useState({});

  const [formData, setFormData] = useState({
    domaine: '', description: '', localisation: '', ville: '', phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.domaine) e.domaine = 'Catégorie requise';
    if (!formData.description || formData.description.trim().length < 10)
      e.description = 'Description requise (min 10 caractères)';
    if (!formData.localisation) e.localisation = 'Adresse requise';
    if (!formData.ville)        e.ville        = 'Ville requise';
    if (!formData.phone)        e.phone        = 'Téléphone requis';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setSearching(true);

    try {
      // Envoi directement les bons champs au backend
      const payload = { ...formData };
      const data = await serviceImmediatAPI.store(payload);

      const list = data.artisans ?? data.data ?? data ?? [];
      setArtisansFound(Array.isArray(list) ? list : []);

    } catch (err) {
      setSearching(false);
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([k, msgs]) => {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        setErrors({ submit: err.message || 'Une erreur est survenue.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactArtisan = (artisanId) => {
    navigate(`/artisan/${artisanId}`);
  };

  const handleReset = () => {
    setSearching(false);
    setArtisansFound([]);
    setErrors({});
  };

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: 'var(--light)' }}>
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Zap className="w-4 h-4 animate-pulse" />
            Service d'urgence
          </div>
          <h1 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: 'var(--dark)' }}>
            Service
            <span className="text-transparent bg-clip-text"
              style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}immédiat
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--dark)', opacity: 0.7 }}>
            Besoin d'un artisan tout de suite ? Nous trouvons les disponibles près de chez vous
          </p>
        </div>

        {!searching ? (
          <Card className="p-8">
            {errors.submit && (
              <div className="p-4 mb-6 rounded-xl"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
                <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>{errors.submit}</p>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl"
              style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#fb923c' }} />
              <div>
                <div className="mb-1 font-bold" style={{ color: '#fb923c' }}>Service d'urgence activé</div>
                <p className="text-xs" style={{ color: 'var(--dark)', opacity: 0.8 }}>
                  Votre demande sera notifiée aux artisans disponibles dans votre zone.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Catégorie */}
              <div>
                <label className="block mb-3 text-sm font-bold" style={{ color: 'var(--dark)' }}>
                  Type de service *
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button"
                      onClick={() => handleChange({ target: { name: 'domaine', value: cat.value } })}
                      className="p-4 text-sm font-bold transition-all rounded-xl"
                      style={{
                        backgroundColor: formData.domaine === cat.value ? 'var(--primary)' : 'white',
                        color:           formData.domaine === cat.value ? 'white' : 'var(--dark)',
                        border: `2px solid ${formData.domaine === cat.value ? 'var(--primary)' : 'var(--gray-dark)'}`,
                      }}>
                      <div className="mb-2 text-2xl">{cat.icon}</div>
                      {cat.label}
                    </button>
                  ))}
                </div>
                {errors.domaine && (
                  <p className="mt-2 text-sm font-semibold" style={{ color: '#ef4444' }}>{errors.domaine}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: 'var(--dark)' }}>
                  Décrivez brièvement le problème *
                </label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Ex: Fuite d'eau importante au lavabo..." rows={4}
                  className="w-full px-4 py-3 transition-all border-2 resize-none rounded-xl"
                  style={{
                    backgroundColor: errors.description ? 'rgba(239, 68, 68, 0.05)' : 'var(--gray)',
                    borderColor:     errors.description ? '#ef4444' : 'var(--gray-dark)',
                    color:           'var(--dark)',
                  }} />
                {errors.description && (
                  <p className="mt-2 text-sm font-semibold" style={{ color: '#ef4444' }}>{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input label="Adresse *" name="localisation" value={formData.localisation}
                  onChange={handleChange} icon={MapPin} placeholder="Rue, quartier..."
                  error={errors.localisation} />
                <Input label="Ville *" name="ville" value={formData.ville}
                  onChange={handleChange} icon={MapPin} placeholder="Ex: Cotonou"
                  error={errors.ville} />
              </div>

              <Input label="Téléphone *" name="phone" type="tel" value={formData.phone}
                onChange={handleChange} icon={Phone} placeholder="+229 XX XX XX XX"
                error={errors.phone} />

              <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--gray-dark)' }}>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" variant="secondary" disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" /> Recherche...
                    </div>
                  ) : (
                    <><Zap className="w-5 h-5" /> Trouver un artisan</>
                  )}
                </Button>
              </div>
            </form>
          </Card>

        ) : (
          /* Résultats */
          <div className="space-y-6">
            {loading ? (
              <Card className="p-12 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
                  style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)' }}>
                  <Loader className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="mb-3 text-2xl font-bold" style={{ color: 'var(--dark)' }}>
                  Recherche en cours...
                </h3>
                <p className="text-sm" style={{ color: 'var(--dark)', opacity: 0.7 }}>
                  Nous notifions les artisans disponibles dans votre zone
                </p>
              </Card>

            ) : artisansFound.length > 0 ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
                    <h3 className="text-xl font-bold" style={{ color: 'var(--dark)' }}>
                      {artisansFound.length} artisan{artisansFound.length > 1 ? 's' : ''} disponible{artisansFound.length > 1 ? 's' : ''}
                    </h3>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--dark)', opacity: 0.7 }}>
                    Ces professionnels peuvent intervenir rapidement
                  </p>
                </Card>

                <div className="space-y-4">
                  {artisansFound.map(artisan => {
                    const name    = artisan.name ?? `${artisan.prenom ?? ''} ${artisan.nom ?? ''}`.trim();
                    const photo   = artisan.photo_profil ?? artisan.photo ?? artisan.image ?? null;
                    const initial = name.charAt(0).toUpperCase();
                    return (
                      <Card key={artisan.id} hover className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-xl"
                            style={{ backgroundColor: 'var(--gray)' }}>
                            {photo ? (
                              <img src={photo} alt={name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-2xl font-black text-white"
                                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
                                {initial}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="mb-1 text-lg font-bold" style={{ color: 'var(--dark)' }}>{name}</h4>
                                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                  {artisan.specialite ?? artisan.specialty}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full"
                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                <Clock className="w-3 h-3" /> Disponible maintenant
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-sm"
                              style={{ color: 'var(--dark)', opacity: 0.7 }}>
                              {artisan.distance && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />{artisan.distance}
                                </div>
                              )}
                              {artisan.rating != null && (
                                <div>⭐ {Number(artisan.rating).toFixed(1)} ({artisan.reviews_count ?? artisan.reviews ?? 0} avis)</div>
                              )}
                            </div>
                            <Button onClick={() => handleContactArtisan(artisan.id)}
                              variant="primary" className="!px-6 !py-2 !text-sm">
                              <Phone className="w-4 h-4" /> Contacter maintenant
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <div className="text-center">
                  <Button variant="outline" onClick={handleReset}>
                    Faire une nouvelle recherche
                  </Button>
                </div>
              </>

            ) : (
              <Card className="p-12 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertCircle className="w-10 h-10" style={{ color: '#ef4444' }} />
                </div>
                <h3 className="mb-3 text-2xl font-bold" style={{ color: 'var(--dark)' }}>
                  Aucun artisan disponible
                </h3>
                <p className="mb-6 text-sm" style={{ color: 'var(--dark)', opacity: 0.7 }}>
                  Aucun artisan n'est disponible immédiatement dans votre zone.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleReset}>Nouvelle recherche</Button>
                  <Button onClick={() => navigate('/services/request')}>Demande classique</Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}