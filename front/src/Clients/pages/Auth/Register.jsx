import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Phone, UserCircle, Hammer } from "lucide-react";
import { useAuth } from "../../components/Auth/AuthContext";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

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
    prenom: "", nom: "", email: "", password: "",
    password_confirmation: "", phone: "", specialty: "", acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const e = {};
    if (!formData.prenom.trim()) e.prenom = "Le prénom est requis";
    if (!formData.nom.trim())    e.nom    = "Le nom est requis";
    if (!formData.email.trim())                     e.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Email invalide";
    if (userType === "artisan" && !formData.phone.trim()) e.phone = "Le téléphone est requis";
    if (userType === "artisan" && !formData.specialty)    e.specialty = "La spécialité est requise";
    if (!formData.password)                e.password = "Le mot de passe est requis";
    else if (formData.password.length < 6) e.password = "Minimum 6 caractères";
    if (!formData.password_confirmation)
      e.password_confirmation = "Veuillez confirmer votre mot de passe";
    else if (formData.password !== formData.password_confirmation)
      e.password_confirmation = "Les mots de passe ne correspondent pas";
    if (!formData.acceptTerms) e.acceptTerms = "Vous devez accepter les conditions";
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
        prenom: formData.prenom, nom: formData.nom, email: formData.email,
        password: formData.password, password_confirmation: formData.password_confirmation,
        role: userType === 'artisan' ? 'ARTISAN' : 'CLIENT',
        ...(userType === 'artisan' && { phone: formData.phone, specialty: formData.specialty }),
      };

      const response = await fetch("/api/register", {
        method: "POST", credentials: "include",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const laravelErrors = {};
          Object.entries(data.errors).forEach(([key, msgs]) => {
            laravelErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          setErrors(laravelErrors);
          return;
        }
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      // Stocker dans le contexte Auth (respecte le nom "accesToken" de AuthContext)
      if (data.user) {
        login(data.user, data.accesToken ?? null);
      }

      // Client ET artisan → profil
      navigate('/profile', { replace: true, state: { newRegistration: true } });

    } catch (err) {
      setApiError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const s  = (f) => ({
    backgroundColor: errors[f] ? 'rgba(255, 126, 95, 0.05)' : '#f8f9fa',
    borderColor: errors[f] ? '#ff7e5f' : '#e9ecef', color: '#2b2d42',
  });
  const fo = (e, f) => !errors[f] && (e.target.style.borderColor = '#4a6fa5');
  const bl = (e, f) => !errors[f] && (e.target.style.borderColor = '#e9ecef');

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full"
            style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5', border: '1px solid rgba(74, 111, 165, 0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff7e5f' }}></span>
            Rejoignez notre communauté
          </span>
        </div>
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#2b2d42' }}>Créer un compte</h1>
          <p className="text-sm" style={{ color: '#2b2d42', opacity: 0.7 }}>Commencez avec ArtisanConnect</p>
        </div>

        <div className="p-6 shadow-lg rounded-xl" style={{ border: '1px solid #e9ecef', backgroundColor: 'white' }}>
          {/* Onglets */}
          <div className="flex gap-2 p-1 mb-6 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
            {[{key:'client',label:'Client',Icon:UserCircle},{key:'artisan',label:'Artisan',Icon:Hammer}].map(({key,label,Icon})=>(
              <button key={key} type="button" onClick={() => setUserType(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-md transition-all"
                style={{ backgroundColor:userType===key?'white':'transparent', color:userType===key?'#4a6fa5':'#2b2d42', boxShadow:userType===key?'0 2px 4px rgba(0,0,0,0.1)':'none' }}>
                <Icon className="w-5 h-5" />{label}
              </button>
            ))}
          </div>

          {apiError && (
            <div className="p-3 mb-4 text-sm font-semibold rounded-xl"
              style={{ backgroundColor:'rgba(255,126,95,0.1)', color:'#ff7e5f', border:'1px solid rgba(255,126,95,0.3)' }}>
              ⚠️ {apiError}
            </div>
          )}

          <div className="space-y-4">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              {[{label:'Prénom',name:'prenom',ph:'Jean'},{label:'Nom',name:'nom',ph:'Dupont'}].map(({label,name,ph})=>(
                <div key={name}>
                  <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>{label}</label>
                  <div className="relative">
                    <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><User className="w-5 h-5" /></div>
                    <input type="text" name={name} value={formData[name]} onChange={handleChange} placeholder={ph}
                      className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                      style={s(name)} onFocus={(e)=>fo(e,name)} onBlur={(e)=>bl(e,name)} />
                  </div>
                  {errors[name] && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors[name]}</p>}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>Adresse email</label>
              <div className="relative">
                <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><Mail className="w-5 h-5" /></div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemple@email.com"
                  className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                  style={s('email')} onFocus={(e)=>fo(e,'email')} onBlur={(e)=>bl(e,'email')} />
              </div>
              {errors.email && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.email}</p>}
            </div>

            {/* Téléphone — artisan */}
            {userType==="artisan" && (
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>Téléphone</label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><Phone className="w-5 h-5" /></div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+229 XX XX XX XX"
                    className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                    style={s('phone')} onFocus={(e)=>fo(e,'phone')} onBlur={(e)=>bl(e,'phone')} />
                </div>
                {errors.phone && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.phone}</p>}
              </div>
            )}

            {/* Spécialité — artisan */}
            {userType==="artisan" && (
              <div>
                <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>Spécialité</label>
                <div className="relative">
                  <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><Briefcase className="w-5 h-5" /></div>
                  <select name="specialty" value={formData.specialty} onChange={handleChange}
                    className="w-full h-12 px-4 pl-12 transition-all border-2 rounded-xl focus:outline-none"
                    style={s('specialty')} onFocus={(e)=>fo(e,'specialty')} onBlur={(e)=>bl(e,'specialty')}>
                    <option value="">Choisir une spécialité</option>
                    {['plomberie','electricite','menuiserie','maconnerie','peinture',
                      'climatisation','carrelage','couture','coiffure','mecanique','autre'].map(sp=>(
                      <option key={sp} value={sp}>{sp.charAt(0).toUpperCase()+sp.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {errors.specialty && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.specialty}</p>}
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>Mot de passe</label>
              <div className="relative">
                <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><Lock className="w-5 h-5" /></div>
                <input type={showPassword?'text':'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                  className="w-full h-12 px-4 pl-12 pr-12 transition-all border-2 rounded-xl focus:outline-none"
                  style={s('password')} onFocus={(e)=>fo(e,'password')} onBlur={(e)=>bl(e,'password')} />
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute -translate-y-1/2 right-4 top-1/2" style={{ color:'#4a6fa5' }}>
                  {showPassword?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.password}</p>}
            </div>

            {/* Confirmer mdp */}
            <div>
              <label className="block mb-2 text-sm font-bold" style={{ color:'#2b2d42' }}>Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute -translate-y-1/2 left-4 top-1/2" style={{ color:'#ff7e5f' }}><Lock className="w-5 h-5" /></div>
                <input type={showConfirmPassword?'text':'password'} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="••••••••"
                  className="w-full h-12 px-4 pl-12 pr-12 transition-all border-2 rounded-xl focus:outline-none"
                  style={s('password_confirmation')} onFocus={(e)=>fo(e,'password_confirmation')} onBlur={(e)=>bl(e,'password_confirmation')} />
                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute -translate-y-1/2 right-4 top-1/2" style={{ color:'#4a6fa5' }}>
                  {showConfirmPassword?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}
                </button>
              </div>
              {errors.password_confirmation && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.password_confirmation}</p>}
            </div>

            {/* Conditions */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}
                  className="w-4 h-4 mt-1 rounded cursor-pointer" style={{ accentColor:'#4a6fa5' }} />
                <span className="text-sm" style={{ color:'#2b2d42' }}>
                  J'accepte les <a href="#" className="font-bold" style={{ color:'#4a6fa5' }}>conditions d'utilisation</a>
                </span>
              </label>
              {errors.acceptTerms && <p className="mt-2 text-sm font-semibold" style={{ color:'#ff7e5f' }}>{errors.acceptTerms}</p>}
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full h-12 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background:'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Inscription en cours...
                </div>
              ) : (userType==="client" ? "Créer mon compte client" : "Créer mon compte artisan")}
            </button>
          </div>

          <div className="pt-4 mt-6 text-center border-t" style={{ borderColor:'#e9ecef' }}>
            <p className="text-sm" style={{ color:'#2b2d42', opacity:0.7 }}>
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold transition-all hover:underline" style={{ color:'#ff7e5f' }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;