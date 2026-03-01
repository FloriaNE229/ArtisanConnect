import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Store, MapPin, Briefcase, FileText, Image,
  ChevronLeft, Loader, CheckCircle, Trash2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../components/Auth/AuthContext';

const DOMAINES = [
  'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Maçonnerie',
  'Couture', 'Coiffure', 'Mécanique', 'Électronique', 'Jardinage',
  'Nettoyage', 'Cuisine', 'Photographie', 'Informatique', 'Autre'
];

export default function EditAtelier() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { accesToken } = useAuth();

  const [form, setForm] = useState({
    nom:              '',
    domaine:          '',
    localisation:     '',
    description:      '',
    image_principale: '',
  });

  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(true);
  const [success,      setSuccess]      = useState(false);
  const [errors,       setErrors]       = useState({});
  const [apiError,     setApiError]     = useState(null);
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [statusBadge,  setStatusBadge]  = useState(null);

  // ── Charger l'atelier existant ─────────────────────────────────────────────
  useEffect(() => {
    if (!accesToken) return;
    const fetchAtelier = async () => {
      setFetching(true);
      try {
        const res = await fetch('/api/atelier/mine', {
          headers: {
            Accept:        'application/json',
            Authorization: `Bearer ${accesToken}`,
          },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Atelier introuvable');
        const data = await res.json();
        const atelier = data.atelier ?? data;

        setForm({
          nom:              atelier.nom              ?? '',
          domaine:          atelier.domaine          ?? '',
          localisation:     atelier.localisation     ?? '',
          description:      atelier.description      ?? '',
          image_principale: atelier.image_principale ?? '',
        });
        setStatusBadge(atelier.verification_status ?? null);
      } catch (e) {
        setApiError(e.message);
      } finally {
        setFetching(false);
      }
    };
    fetchAtelier();
  }, [id, accesToken]);

  // ── Validation ─────────────────────────────────────────────────────────────
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

    try {
      const res = await fetch(`/api/atelier/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept:         'application/json',
          Authorization:  `Bearer ${accesToken}`,
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
        if (data.errors) {
          const mapped = {};
          Object.keys(data.errors).forEach(k => { mapped[k] = data.errors[k][0]; });
          setErrors(mapped);
        } else {
          setApiError(data.message ?? 'Une erreur est survenue');
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);

    } catch {
      setApiError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/atelier/${id}`, {
        method: 'DELETE',
        headers: {
          Accept:        'application/json',
          Authorization: `Bearer ${accesToken}`,
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      navigate('/profile', { state: { atelierDeleted: true } });
    } catch (e) {
      setApiError(e.message);
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  // ── Status badge ───────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (!statusBadge) return null;
    const config = {
      approved: { label: '✓ Approuvé',           cls: 'bg-green-100 text-green-700'  },
      rejected: { label: '✗ Rejeté',              cls: 'bg-red-100 text-red-700'      },
      pending:  { label: '⏳ En attente',          cls: 'bg-yellow-100 text-yellow-700'},
    };
    const c = config[statusBadge] ?? config.pending;
    return (
      <span className={`px-3 py-1 text-sm font-bold rounded-full ${c.cls}`}>{c.label}</span>
    );
  };

  // ── Chargement ─────────────────────────────────────────────────────────────
  if (fetching) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-10 h-10 animate-spin" style={{ color: '#4a6fa5' }} />
    </div>
  );

  // ── Succès ─────────────────────────────────────────────────────────────────
  if (success) return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="max-w-sm p-10 mx-4 text-center bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: '#22c55e' }} />
        </div>
        <h2 className="mb-2 text-2xl font-black" style={{ color: '#2b2d42' }}>Atelier mis à jour !</h2>
        <p className="mb-4 text-gray-500">
          Vos modifications sont en attente de validation par un administrateur.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#4a6fa5' }}>
          <Loader className="w-4 h-4 animate-spin" /> Redirection...
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20"
      style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="max-w-2xl px-4 mx-auto sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#4a6fa5' }}>
            <ChevronLeft className="w-4 h-4" /> Retour au profil
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="mb-2 text-3xl font-black" style={{ color: '#2b2d42' }}>
              Modifier mon atelier
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-500">Mettez à jour les informations de votre atelier</p>
              <StatusBadge />
            </div>
          </div>
        </div>

        {/* Avertissement modification */}
        {statusBadge === 'approved' && (
          <div className="flex items-start gap-3 p-4 mb-6 border-2 rounded-xl"
            style={{ backgroundColor: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.3)' }}>
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              Toute modification repassera votre atelier en attente de validation.
            </p>
          </div>
        )}

        {/* Erreur API */}
        {apiError && (
          <div className="p-4 mb-6 text-sm font-semibold text-red-700 border-2 border-red-200 bg-red-50 rounded-xl">
            ⚠️ {apiError}
          </div>
        )}

        {/* Formulaire */}
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="space-y-6">

            {/* Nom */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Nom de l'atelier <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <Store className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2"
                  style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input type="text" value={form.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Ex: Atelier Kouassi Plomberie"
                  maxLength={150}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none transition-all ${
                    errors.nom ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }} />
              </div>
              {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
            </div>

            {/* Domaine */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Domaine <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2"
                  style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <select value={form.domaine}
                  onChange={(e) => handleChange('domaine', e.target.value)}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none appearance-none transition-all ${
                    errors.domaine ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: form.domaine ? '#2b2d42' : '#9ca3af' }}>
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
                <MapPin className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2"
                  style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input type="text" value={form.localisation}
                  onChange={(e) => handleChange('localisation', e.target.value)}
                  placeholder="Ex: Cotonou, Bénin"
                  maxLength={255}
                  className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none transition-all ${
                    errors.localisation ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }} />
              </div>
              {errors.localisation && <p className="mt-1 text-xs text-red-500">{errors.localisation}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Description <span style={{ color: '#ff7e5f' }}>*</span>
              </label>
              <div className="relative">
                <FileText className="absolute w-5 h-5 pointer-events-none left-4 top-4"
                  style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <textarea value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez vos services, votre expérience..."
                  rows={5}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none resize-none transition-all ${
                    errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                  }`}
                  style={{ color: '#2b2d42' }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <span />}
                <span className="text-xs text-gray-400">{form.description.length} caractères</span>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                Image principale <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <Image className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2"
                  style={{ color: '#4a6fa5', opacity: 0.5 }} />
                <input type="url" value={form.image_principale}
                  onChange={(e) => handleChange('image_principale', e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full h-12 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none rounded-xl focus:border-blue-400"
                  style={{ color: '#2b2d42' }} />
              </div>
              {form.image_principale && (
                <div className="h-40 mt-3 overflow-hidden rounded-xl">
                  <img src={form.image_principale} alt="Aperçu"
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
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
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
              {loading
                ? <><Loader className="w-5 h-5 animate-spin" /> Enregistrement...</>
                : <><Store className="w-5 h-5" /> Enregistrer</>}
            </button>
          </div>
        </div>

        {/* Zone danger - Supprimer l'atelier */}
        <div className="p-6 mt-6 bg-white border-2 border-red-100 shadow-lg rounded-2xl">
          <h3 className="mb-2 text-lg font-bold text-red-600">Zone de danger</h3>
          <p className="mb-4 text-sm text-gray-500">
            La suppression de votre atelier est irréversible. Toutes vos offres et avis seront perdus.
          </p>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 transition-all border-2 border-red-200 rounded-xl hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Supprimer mon atelier
            </button>
          ) : (
            <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl">
              <p className="mb-4 text-sm font-semibold text-red-700">
                ⚠️ Êtes-vous sûr ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="flex-1 py-2 text-sm font-bold transition-all border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                  style={{ color: '#2b2d42' }}>
                  Annuler
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center justify-center flex-1 gap-2 py-2 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60">
                  {deleting
                    ? <><Loader className="w-4 h-4 animate-spin" /> Suppression...</>
                    : <><Trash2 className="w-4 h-4" /> Confirmer la suppression</>}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}