import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Phone, UserCircle, Hammer } from "lucide-react";
import { useAuth } from "../../components/Auth/AuthContext";
import { authAPI } from "../../../../services/api";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { login }      = useAuth();

  const [userType, setUserType] = useState(() => {
    const type = searchParams.get('type');
    return type === 'artisan' ? 'artisan' : 'client';
  });

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [errors,              setErrors]              = useState({});
  const [apiError,            setApiError]            = useState('');

  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', mot_de_passe: '',
    mot_de_passe_confirmation: '', telephone: '', specialite: '', acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError)     setApiError('');
  };

  const validateForm = () => {
    const e = {};
    if (!formData.prenom.trim()) e.prenom = 'Le prénom est requis';
    if (!formData.nom.trim())    e.nom    = 'Le nom est requis';
    if (!formData.email.trim())                     e.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email invalide';
    if (userType === 'artisan' && !formData.telephone.trim()) e.telephone  = 'Le téléphone est requis';
    if (userType === 'artisan' && !formData.specialite)       e.specialite = 'La spécialité est requise';
    if (!formData.mot_de_passe)                e.mot_de_passe = 'Le mot de passe est requis';
    else if (formData.mot_de_passe.length < 6) e.mot_de_passe = 'Minimum 6 caractères';
    if (!formData.mot_de_passe_confirmation)
      e.mot_de_passe_confirmation = 'Veuillez confirmer votre mot de passe';
    else if (formData.mot_de_passe !== formData.mot_de_passe_confirmation)
      e.mot_de_passe_confirmation = 'Les mots de passe ne correspondent pas';
    if (!formData.acceptTerms) e.acceptTerms = 'Vous devez accepter les conditions';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }

    setLoading(true);
    try {
      const payload = {
        prenom:                    formData.prenom,
        nom:                       formData.nom,
        email:                     formData.email,
        mot_de_passe:              formData.mot_de_passe,
        mot_de_passe_confirmation: formData.mot_de_passe_confirmation,
        ...(userType === 'artisan' && {
          telephone:  formData.telephone,
          specialite: formData.specialite,
        }),
      };

      // authAPI.registerClient()  → POST /auth/register/client
      // authAPI.registerArtisan() → POST /auth/register/artisan
      const data = userType === 'artisan'
        ? await authAPI.registerArtisan(payload)
        : await authAPI.registerClient(payload);

      // Stocke user + token dans le contexte (+ localStorage)
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      navigate('/profile', { replace: true, state: { newRegistration: true } });

    } catch (err) {
      // Erreurs de validation Laravel (422)
      if (err.errors) {
        const laravelErrors = {};
        Object.entries(err.errors).forEach(([key, msgs]) => {
          laravelErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(laravelErrors);
        return;
      }
      // Erreur générique
      setApiError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Helpers style champs
  const s  = (f) => ({
    backgroundColor: errors[f] ? 'rgba(255, 126, 95, 0.05)' : '#f8f9fa',
    borderColor:     errors[f] ? '#ff7e5f' : '#e9ecef',
    color: '#2b2d42',
  });
  const fo = (e, f) => !errors[f] && (e.target.style.borderColor = '#4a6fa5');
  const bl = (e, f) => !errors[f] && (e.target.style.borderColor = '#e9ecef');

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="w-full max-w-md mx-auto">

        {/* Badge */}
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full"
            style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5', border: '1px solid rgba(74, 111, 165, 0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff7e5f' }}></span>
            Rejoignez notre communauté
          </span>
        </div>

        {/* Titre */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#2b2d42' }}>Créer un compte</h1>
          <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.7 }}>Commencez avec ArtisanConnect</p>
        </div>

        <div className="p-6 shadow-lg rounded-xl" style={{ border: '1px solid #e9ecef', backgroundColor: 'white' }}>

          {/* Onglets Client / Artisan */}
          <div className="flex gap-2 p-1 mb-6 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            {[
              { key: 'client',  label: 'Client',  TabIcon: UserCircle },
              { key: 'artisan', label: 'Artisan',  TabIcon: Hammer     },
            ].map(({ key, label, TabIcon }) => (
              <button key={key} type="button" onClick={() => setUserType(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-md transition-all"
                style={{
                  backgroundColor: userType === key ? 'white'       : 'transparent',
                  color:           userType === key ? '#4a6fa5'     : '#2b2d42',
                  boxShadow:       userType === key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                <TabIcon className="w-5 h-5" />{label}
              </button>
            ))}
          </div>

          {/* Erreur API globale */}
          {apiError && (
            <div className="p-3 mb-4 text-sm font-semibold rounded-xl"
              style={{ backgroundColor: 'rgba(255,126,95,0.1)', color: '#ff7e5f', border: '1px solid rgba(255,126,95,0.3)' }}>
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Prénom', name: 'prenom', ph: 'Jean'   },
                  { label: 'Nom',    name: 'nom',    ph: 'Dupont' },
                ].map(({ label, name, ph }) => (
                  <div key={name}>
                    <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>{label}</label>
                    <div className="relative">
                      <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}>
                        <User className="w-5 h-5" />
                      </div>
                      <input type="text" name={name} value={formData[name]} onChange={handleChange} placeholder={ph}
                        className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                        style={s(name)} onFocus={(e) => fo(e, name)} onBlur={(e) => bl(e, name)} />
                    </div>
                    {errors[name] && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors[name]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Adresse email</label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}><Mail className="w-5 h-5" /></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemple@email.com"
                    className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                    style={s('email')} onFocus={(e) => fo(e, 'email')} onBlur={(e) => bl(e, 'email')} />
                </div>
                {errors.email && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.email}</p>}
              </div>

              {/* Téléphone — artisan uniquement */}
              {userType === 'artisan' && (
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Téléphone</label>
                  <div className="relative">
                    <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}><Phone className="w-5 h-5" /></div>
                    <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+229 XX XX XX XX"
                      className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                      style={s('telephone')} onFocus={(e) => fo(e, 'telephone')} onBlur={(e) => bl(e, 'telephone')} />
                  </div>
                  {errors.telephone && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.telephone}</p>}
                </div>
              )}

              {/* Spécialité — artisan uniquement */}
              {userType === 'artisan' && (
                <div>
                  <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Spécialité</label>
                  <div className="relative">
                    <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}><Briefcase className="w-5 h-5" /></div>
                    <select name="specialite" value={formData.specialite} onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                      style={s('specialite')} onFocus={(e) => fo(e, 'specialite')} onBlur={(e) => bl(e, 'specialite')}>
                      <option value="">Choisir une spécialité</option>
                      {['plomberie','electricite','menuiserie','maconnerie','peinture',
                        'climatisation','carrelage','couture','coiffure','mecanique','autre'].map(sp => (
                        <option key={sp} value={sp}>{sp.charAt(0).toUpperCase() + sp.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {errors.specialite && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.specialite}</p>}
                </div>
              )}

              {/* Mot de passe */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Mot de passe</label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}><Lock className="w-5 h-5" /></div>
                  <input type={showPassword ? 'text' : 'password'} name="mot_de_passe" value={formData.mot_de_passe} onChange={handleChange} placeholder="••••••••"
                    className="w-full h-12 px-4 pl-12 pr-12 transition-all border-2 rounded-xl focus:outline-none"
                    style={s('mot_de_passe')} onFocus={(e) => fo(e, 'mot_de_passe')} onBlur={(e) => bl(e, 'mot_de_passe')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute -translate-y-1/2 right-4 top-1/2" style={{ color: '#4a6fa5' }}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.mot_de_passe && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.mot_de_passe}</p>}
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color: '#2b2d42' }}>Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color: '#ff7e5f' }}><Lock className="w-5 h-5" /></div>
                  <input type={showConfirmPassword ? 'text' : 'password'} name="mot_de_passe_confirmation" value={formData.mot_de_passe_confirmation} onChange={handleChange} placeholder="••••••••"
                    className="w-full h-12 px-4 pl-12 pr-12 transition-all border-2 rounded-xl focus:outline-none"
                    style={s('mot_de_passe_confirmation')} onFocus={(e) => fo(e, 'mot_de_passe_confirmation')} onBlur={(e) => bl(e, 'mot_de_passe_confirmation')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute -translate-y-1/2 right-4 top-1/2" style={{ color: '#4a6fa5' }}>
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.mot_de_passe_confirmation && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.mot_de_passe_confirmation}</p>}
              </div>

              {/* Conditions */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}
                    className="w-4 h-4 mt-1 rounded cursor-pointer" style={{ accentColor: '#4a6fa5' }} />
                  <span className="text-sm" style={{ color: '#2b2d42' }}>
                    J'accepte les{" "}
                    <a href="#" className="font-bold" style={{ color: '#4a6fa5' }}>conditions d'utilisation</a>
                  </span>
                </label>
                {errors.acceptTerms && <p className="mt-2 text-sm font-semibold" style={{ color: '#ff7e5f' }}>{errors.acceptTerms}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full h-12 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Inscription en cours...
                  </div>
                ) : (userType === 'client' ? 'Créer mon compte client' : 'Créer mon compte artisan')}
              </button>

            </div>
          </form>

          <div className="pt-4 mt-6 text-center border-t" style={{ borderColor: '#e9ecef' }}>
            <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.7 }}>
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold transition-all hover:underline" style={{ color: '#ff7e5f' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;