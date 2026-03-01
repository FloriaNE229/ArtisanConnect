import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, Briefcase, FileText, Image, ChevronLeft, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../../components/Auth/AuthContext';

const DOMAINES = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Maçonnerie',
  'Couture', 'Coiffure', 'Mécanique', 'Électronique', 'Jardinage',
  'Nettoyage', 'Cuisine', 'Photographie', 'Informatique', 'Autre'
];

export default function CreateAtelier() {
  const navigate  = useNavigate();
  const { accesToken, user } = useAuth();

  const [form, setForm] = useState({
    nom:              '',
    domaine:          '',
    localisation:     '',
    description:      '',
    image_principale: '',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [apiError, setApiError] = useState(null);

  // ── Validation locale ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.nom.trim())          e.nom          = 'Le nom est requis';
    if (!form.domaine)             e.domaine      = 'Le domaine est requis';
    if (!form.localisation.trim()) e.localisation = 'La localisation est requise';
    if (!form.description.trim())  e.description  = 'La description est requise';
    if (form.description.trim().length < 20) e.description = 'Description trop courte (min 20 caractères)';
    return e;
  };

  // ── Soumission ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError(null);
    setErrors({});

    try {
      const res = await fetch('/api/atelier', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          Accept:          'application/json',
          Authorization:   `Bearer ${accesToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          nom:              form.nom.trim(),
          domaine:          form.domaine,
          localisation:     form.localisation.trim(),
          description:      form.description.trim(),
          image_principale: form.image_principale.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Erreurs de validation Laravel
        if (data.errors) {
          const mapped = {};
          Object.keys(data.errors).forEach(k => { mapped[k] = data.errors[k][0]; });
          setErrors(mapped);
        } else {
          setApiError(data.message ?? 'Une erreur est survenue');
        }
        return;
      }

      // Succès !
      setSuccess(true);
      setTimeout(() => navigate('/profile', { state: { atelierCreated: true } }), 2000);

    } catch {
      setApiError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  // ── Succès ─────────────────────────────────────────────────────────────────
  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6"
      style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="max-w-md p-8 mx-4 text-center bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: '#22c55e' }} />
        </div>
        <h2 className="mb-3 text-2xl font-black" style={{ color: '#2b2d42' }}>Atelier créé !</h2>
        <p className="text-gray-500">
          Votre atelier est en attente de validation par un administrateur.
          Vous serez notifié dès qu'il sera approuvé.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm" style={{ color: '#4a6fa5' }}>
          <Loader className="w-4 h-4 animate-spin" /> Redirection...
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="max-w-2xl px-4 mx-auto sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#4a6fa5' }}>
            <ChevronLeft className="w-4 h-4" /> Retour au profil
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-black" style={{ color: '#2b2d42' }}>Créer mon atelier</h1>
          <p className="text-gray-500">
            Présentez vos services aux clients de façon professionnelle
          </p>
        </div>

        {/* Info validation */}
        <div className="flex items-start gap-3 p-4 mb-6 border-2 rounded-xl"
          style={{ backgroundColor: 'rgba(74,111,165,0.05)', borderColor: 'rgba(74,111,165,0.2)' }}>
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#4a6fa5' }} />
          <p className="text-sm" style={{ color: '#4a6fa5' }}>
            Votre atelier sera examiné par notre équipe avant d'être visible par les clients.
            Ce processus prend généralement 24 à 48h.
          </p>
        </div>

        {/* Erreur API */}
        {apiError && (
          <div className="p-4 mb-6 text-sm font-semibold text-red-700 border-2 border-red-200 bg-red-50 rounded-xl">
            ⚠️ {apiError}
          </div>
        )}

        {/* Formulaire */}
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="space-y-6">

            {/* Nom de l'atelier */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Nom de l'atelier <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <Store className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input
                  type="text"
                  placeholder="Ex: Atelier Kouassi Plomberie"
                  value={form.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  maxLength={150}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl transition-all outline-none ${
                    errors.nom ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }}
                />
              </div>
              {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
            </div>

            {/* Domaine */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Domaine d'activité <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <select
                  value={form.domaine}
                  onChange={(e) => handleChange('domaine', e.target.value)}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl transition-all outline-none appearance-none ${
                    errors.domaine ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: form.domaine ? '#2b2d42' : '#9ca3af' }}
                >
                  <option value="">Sélectionnez un domaine</option>
                  {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {errors.domaine && <p className="mt-1 text-xs text-red-500">{errors.domaine}</p>}
            </div>

            {/* Localisation */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Localisation <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input
                  type="text"
                  placeholder="Ex: Cotonou, Bénin"
                  value={form.localisation}
                  onChange={(e) => handleChange('localisation', e.target.value)}
                  maxLength={255}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl transition-all outline-none ${
                    errors.localisation ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }}
                />
              </div>
              {errors.localisation && <p className="mt-1 text-xs text-red-500">{errors.localisation}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Description <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <FileText className="absolute w-5 h-5 left-4 top-4" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <textarea
                  placeholder="Décrivez vos services, votre expérience, ce qui vous différencie..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all outline-none resize-none ${
                    errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <span />
                }
                <span className="text-xs text-gray-400">{form.description.length} caractères</span>
              </div>
            </div>

            {/* Image principale (optionnel) */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Image principale <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <Image className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={form.image_principale}
                  onChange={(e) => handleChange('image_principale', e.target.value)}
                  className="w-full h-12 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none rounded-xl focus:border-blue-400"
                  style={{ color: '#2b2d42' }}
                />
              </div>
              {form.image_principale && (
                <div className="h-40 mt-3 overflow-hidden rounded-xl">
                  <img src={form.image_principale} alt="Aperçu"
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <p className="mt-1 text-xs text-gray-400">Entrez l'URL d'une image pour illustrer votre atelier</p>
            </div>

          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-8">
            <Link to="/profile" className="flex-1">
              <button className="w-full py-3 font-bold transition-all border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                style={{ color: '#2b2d42' }}>
                Annuler
              </button>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
              {loading ? (
                <><Loader className="w-5 h-5 animate-spin" /> Création...</>
              ) : (
                <><Store className="w-5 h-5" /> Créer mon atelier</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}