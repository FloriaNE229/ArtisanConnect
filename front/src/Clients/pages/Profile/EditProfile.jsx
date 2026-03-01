import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Save,
  Camera, CheckCircle, Loader, Briefcase, Award, FileText
} from 'lucide-react';
import { useAuth } from '../../components/Auth/AuthContext';

const EXPERIENCE_LEVELS = [
  { value: 'debutant',      label: 'Débutant (0-2 ans)'     },
  { value: 'intermediaire', label: 'Intermédiaire (3-5 ans)' },
  { value: 'expert',        label: 'Expert (6+ ans)'         },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, accesToken, login } = useAuth();

  const isArtisan = user?.role === 'ARTISAN' || user?.role === 'artisan';

  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState(null);

  const [form, setForm] = useState({
    prenom:           '',
    nom:              '',
    email:            '',
    telephone:        '',
    bio:              '',
    specialite:       '',
    experience_level: '',
    photo_profil:     '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  // ── Charger les données actuelles ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setForm({
      prenom:           user.prenom           ?? '',
      nom:              user.nom              ?? '',
      email:            user.email            ?? '',
      telephone:        user.telephone ?? user.phone ?? '',
      bio:              user.bio              ?? '',
      specialite:       user.specialite       ?? '',
      experience_level: user.experience_level ?? '',
      photo_profil:     user.photo_profil     ?? '',
    });
    setPhotoPreview(user.photo_profil ?? user.photo ?? null);
    setFetching(false);
  }, [user]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.prenom.trim())  e.prenom = 'Le prénom est requis';
    if (!form.nom.trim())     e.nom    = 'Le nom est requis';
    if (!form.email.trim())   e.email  = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    return e;
  };

  // ── Soumission ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        prenom:    form.prenom.trim(),
        nom:       form.nom.trim(),
        bio:       form.bio.trim()       || null,
        telephone: form.telephone.trim() || null,
        photo_profil: photoPreview?.startsWith('data:') ? photoPreview : (form.photo_profil || null),
      };
      if (isArtisan) {
        payload.specialite       = form.specialite       || null;
        payload.experience_level = form.experience_level || null;
      }

      const res = await fetch('/api/artisan/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept:         'application/json',
          Authorization:  `Bearer ${accesToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
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

      // Mettre à jour le contexte auth avec les nouvelles données
      if (data.user) login(data.user, accesToken);

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1800);

    } catch {
      setApiError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const fullName = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || user.email : '';
  const initiale = fullName.charAt(0).toUpperCase();

  // ── Loading initial ────────────────────────────────────────────────────────
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
        <h2 className="mb-2 text-2xl font-black" style={{ color: '#2b2d42' }}>Profil mis à jour !</h2>
        <p className="mb-4 text-gray-500">Vos informations ont été enregistrées.</p>
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
        <Link to="/profile" className="inline-flex items-center gap-2 mb-6 text-sm font-bold"
          style={{ color: '#4a6fa5' }}>
          <ArrowLeft className="w-4 h-4" /> Retour au profil
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-black" style={{ color: '#2b2d42' }}>
            Modifier mon <span className="text-transparent bg-clip-text"
              style={{ background: 'linear-gradient(90deg, #4a6fa5, #6b8fc7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              profil
            </span>
          </h1>
          <p className="text-gray-500">Mettez à jour vos informations personnelles</p>
        </div>

        {/* Erreur API */}
        {apiError && (
          <div className="p-4 mb-6 text-sm font-semibold text-red-700 border-2 border-red-200 bg-red-50 rounded-xl">
            ⚠️ {apiError}
          </div>
        )}

        <div className="space-y-6">

          {/* ── Photo de profil ── */}
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-6 text-lg font-bold" style={{ color: '#2b2d42' }}>Photo de profil</h3>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-24 h-24 overflow-hidden border-4 border-white rounded-full shadow-lg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-3xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }}>
                    {initiale}
                  </div>
                )}
              </div>
              <div>
                <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <label htmlFor="photo"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border-2 border-gray-200 cursor-pointer rounded-xl hover:border-blue-400 hover:bg-blue-50"
                  style={{ color: '#2b2d42' }}>
                  <Camera className="w-4 h-4" /> Changer la photo
                </label>
                <p className="mt-2 text-xs text-gray-400">JPG, PNG (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* ── Informations personnelles ── */}
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <h3 className="mb-6 text-lg font-bold" style={{ color: '#2b2d42' }}>Informations personnelles</h3>
            <div className="space-y-4">

              {/* Prénom + Nom */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                    Prénom <span style={{ color: '#ff7e5f' }}>*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                    <input type="text" value={form.prenom} onChange={(e) => handleChange('prenom', e.target.value)}
                      placeholder="Jean"
                      className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none transition-all ${errors.prenom ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                      style={{ color: '#2b2d42' }} />
                  </div>
                  {errors.prenom && <p className="mt-1 text-xs text-red-500">{errors.prenom}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                    Nom <span style={{ color: '#ff7e5f' }}>*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                    <input type="text" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)}
                      placeholder="Dupont"
                      className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none transition-all ${errors.nom ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                      style={{ color: '#2b2d42' }} />
                  </div>
                  {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>
                  Email <span style={{ color: '#ff7e5f' }}>*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                  <input type="email" value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jean@example.com"
                    className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                    style={{ color: '#2b2d42' }} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Téléphone</label>
                <div className="relative">
                  <Phone className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                  <input type="tel" value={form.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full h-12 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none rounded-xl focus:border-blue-400"
                    style={{ color: '#2b2d42' }} />
                </div>
              </div>

            </div>
          </div>

          {/* ── Infos artisan (seulement si artisan) ── */}
          {isArtisan && (
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <h3 className="mb-6 text-lg font-bold" style={{ color: '#2b2d42' }}>
                Informations artisan
              </h3>
              <div className="space-y-4">

                {/* Spécialité */}
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Spécialité</label>
                  <div className="relative">
                    <Briefcase className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                    <input type="text" value={form.specialite}
                      onChange={(e) => handleChange('specialite', e.target.value)}
                      placeholder="Ex: Plomberie, Électricité..."
                      className="w-full h-12 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none rounded-xl focus:border-blue-400"
                      style={{ color: '#2b2d42' }} />
                  </div>
                </div>

                {/* Niveau d'expérience */}
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Niveau d'expérience</label>
                  <div className="relative">
                    <Award className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                    <select value={form.experience_level}
                      onChange={(e) => handleChange('experience_level', e.target.value)}
                      className="w-full h-12 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none appearance-none rounded-xl focus:border-blue-400"
                      style={{ color: form.experience_level ? '#2b2d42' : '#9ca3af' }}>
                      <option value="">Sélectionnez votre niveau</option>
                      {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Biographie</label>
                  <div className="relative">
                    <FileText className="absolute w-5 h-5 pointer-events-none left-4 top-4" style={{ color: '#4a6fa5', opacity: 0.5 }} />
                    <textarea value={form.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      placeholder="Décrivez votre parcours, vos compétences, ce qui vous différencie..."
                      rows={4}
                      className="w-full py-3 pl-12 pr-4 transition-all border-2 border-gray-200 outline-none resize-none rounded-xl focus:border-blue-400"
                      style={{ color: '#2b2d42' }} />
                  </div>
                  <div className="mt-1 text-xs text-right text-gray-400">{form.bio.length} caractères</div>
                </div>

              </div>
            </div>
          )}

          {/* ── Boutons ── */}
          <div className="flex gap-4">
            <Link to="/profile" className="flex-1">
              <button className="w-full py-3 font-bold transition-all border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                style={{ color: '#2b2d42' }}>
                Annuler
              </button>
            </Link>
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
              {loading ? (
                <><Loader className="w-5 h-5 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="w-5 h-5" /> Enregistrer</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}