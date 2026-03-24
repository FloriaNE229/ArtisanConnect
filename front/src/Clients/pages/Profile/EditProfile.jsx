import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Save,
  Camera, CheckCircle, Loader, Briefcase, Award, FileText
} from 'lucide-react';
import { useAuth }   from '../../components/Auth/AuthContext';
import { profilAPI } from '../../../../services/api';

const EXPERIENCE_LEVELS = [
  { value: 'debutant',      label: 'Débutant (0-2 ans)'     },
  { value: 'intermediaire', label: 'Intermédiaire (3-5 ans)' },
  { value: 'expert',        label: 'Expert (6+ ans)'         },
];

export default function EditProfile() {
  const navigate           = useNavigate();
  const { user, token, login } = useAuth();
  const isArtisan          = user?.role === 'ARTISAN';

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

  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchProfile = async () => {
      try {
        const data    = await profilAPI.show();
        const profile = data?.user ?? data ?? user;

        const artisanProfile = profile.artisan ?? null;

        setForm({
          prenom:           profile.prenom                               ?? '',
          nom:              profile.nom                                  ?? '',
          email:            profile.email                                ?? '',
          telephone:        artisanProfile?.telephone ?? profile.telephone ?? '',
          bio:              artisanProfile?.bio       ?? profile.bio       ?? '',
          specialite:       artisanProfile?.specialite       ?? profile.specialite       ?? '',
          experience_level: artisanProfile?.experience_level ?? profile.experience_level ?? '',
          photo_profil:     profile.photo_profil ?? '',
        });
        setPhotoPreview(profile.photo_profil ?? profile.photo ?? null);

      } catch {
        const artisanProfile = user.artisan ?? null;
        setForm({
          prenom:           user.prenom                                   ?? '',
          nom:              user.nom                                      ?? '',
          email:            user.email                                    ?? '',
          telephone:        artisanProfile?.telephone ?? user.telephone   ?? '',
          bio:              artisanProfile?.bio       ?? user.bio         ?? '',
          specialite:       artisanProfile?.specialite       ?? user.specialite       ?? '',
          experience_level: artisanProfile?.experience_level ?? user.experience_level ?? '',
          photo_profil:     user.photo_profil ?? '',
        });
        setPhotoPreview(user.photo_profil ?? user.photo ?? null);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = 'Le prénom est requis';
    if (!form.nom.trim())    e.nom    = 'Le nom est requis';
    if (!form.email.trim())  e.email  = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError(null);

    try {
      let data;

      if (photoFile) {
        const fd = new FormData();
        fd.append('prenom',       form.prenom.trim());
        fd.append('nom',          form.nom.trim());
        fd.append('photo_profil', photoFile);
        data = await profilAPI.update(fd, true);
      } else {
        const payload = {
          prenom: form.prenom.trim(),
          nom:    form.nom.trim(),
        };
        data = await profilAPI.update(payload);
      }

      if (isArtisan) {
        const artisanPayload = {
          telephone: form.telephone.trim() || null,
        };
        await profilAPI.updateArtisan(artisanPayload);
      }

      if (data?.user) login(data.user, token);

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1800);

    } catch (err) {
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([k, msgs]) => {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        setApiError(err.message || 'Impossible de contacter le serveur.');
      }
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
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const fullName = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || user.email : '';
  const initiale = fullName.charAt(0).toUpperCase();

  const inputStyle = (hasError) => ({
    width: '100%',
    height: 48,
    paddingLeft: 48,
    paddingRight: 16,
    border: `2px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
    borderRadius: 12,
    outline: 'none',
    fontSize: 15,
    color: '#1f2937',
    background: hasError ? '#fef2f2' : '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 700,
    color: '#1f2937',
  };

  const iconWrapStyle = {
    position: 'relative',
    display: 'block',
  };

  const iconStyle = {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 18,
    height: 18,
    color: '#4a6fa5',
    opacity: 0.5,
    pointerEvents: 'none',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(74,111,165,0.10)',
    padding: 32,
  };

  if (fetching) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Loader style={{ width: 40, height: 40, color: '#4a6fa5', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (success) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#f8fafc,#e2e8f0)' }}>
      <div style={{ maxWidth: 380, padding: 40, margin: '0 16px', textAlign: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(74,111,165,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)' }}>
          <CheckCircle style={{ width: 40, height: 40, color: '#22c55e' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>Profil mis à jour !</h2>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Vos informations ont été enregistrées.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#4a6fa5' }}>
          <Loader style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Redirection...
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 96, paddingBottom: 80, background: 'linear-gradient(135deg,#f8fafc,#e2e8f0)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, fontWeight: 700, color: '#4a6fa5', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Retour au profil
        </Link>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1f2937', marginBottom: 8 }}>Modifier mon profil</h1>
          <p style={{ color: '#6b7280' }}>Mettez à jour vos informations personnelles</p>
        </div>

        {apiError && (
          <div style={{ padding: 16, marginBottom: 24, fontSize: 13, fontWeight: 600, color: '#b91c1c', border: '2px solid #fecaca', background: '#fef2f2', borderRadius: 12 }}>
            ⚠️ {apiError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Photo de profil */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>Photo de profil</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flexShrink: 0, width: 96, height: 96, borderRadius: '50%', border: '4px solid #fff', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg,#ff7e5f,#feb47b)' }}>
                    {initiale}
                  </div>
                )}
              </div>
              <div>
                <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                <label htmlFor="photo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, border: '2px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', color: '#1f2937' }}>
                  <Camera style={{ width: 14, height: 14 }} /> Changer la photo
                </label>
                <p style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>JPG, PNG (max 2MB)</p>
                {photoFile && (
                  <p style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: '#22c55e' }}>✓ {photoFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>Informations personnelles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'prenom', label: 'Prénom', ph: 'Jean'   },
                  { key: 'nom',    label: 'Nom',    ph: 'Dupont' },
                ].map(({ key, label, ph }) => (
                  <div key={key}>
                    <label style={labelStyle}>
                      {label} <span style={{ color: '#ff7e5f' }}>*</span>
                    </label>
                    <div style={iconWrapStyle}>
                      <User style={iconStyle} />
                      <input
                        type="text"
                        value={form[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={ph}
                        style={inputStyle(!!errors[key])}
                        onFocus={e => { if (!errors[key]) e.target.style.borderColor = '#60a5fa'; }}
                        onBlur={e  => { if (!errors[key]) e.target.style.borderColor = '#e5e7eb'; }}
                      />
                    </div>
                    {errors[key] && <p style={{ marginTop: 4, fontSize: 11, color: '#ef4444' }}>{errors[key]}</p>}
                  </div>
                ))}
              </div>

              <div>
                <label style={labelStyle}>
                  Email <span style={{ color: '#ff7e5f' }}>*</span>
                </label>
                <div style={iconWrapStyle}>
                  <Mail style={iconStyle} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jean@example.com"
                    style={inputStyle(!!errors.email)}
                    onFocus={e => { if (!errors.email) e.target.style.borderColor = '#60a5fa'; }}
                    onBlur={e  => { if (!errors.email) e.target.style.borderColor = '#e5e7eb'; }}
                    disabled
                  />
                </div>
                {errors.email && <p style={{ marginTop: 4, fontSize: 11, color: '#ef4444' }}>{errors.email}</p>}
              </div>

              {!isArtisan && (
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <div style={iconWrapStyle}>
                    <Phone style={iconStyle} />
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
                      placeholder="+229 97 00 00 00"
                      style={inputStyle(false)}
                      onFocus={e => e.target.style.borderColor = '#60a5fa'}
                      onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Infos artisan */}
          {isArtisan && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>Informations artisan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <div style={iconWrapStyle}>
                    <Phone style={iconStyle} />
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
                      placeholder="+229 97 00 00 00"
                      style={inputStyle(false)}
                      onFocus={e => e.target.style.borderColor = '#60a5fa'}
                      onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Spécialité</label>
                  <div style={iconWrapStyle}>
                    <Briefcase style={iconStyle} />
                    <input
                      type="text"
                      value={form.specialite}
                      onChange={(e) => handleChange('specialite', e.target.value)}
                      placeholder="Ex: Plomberie, Électricité..."
                      style={inputStyle(false)}
                      disabled
                      onFocus={e => e.target.style.borderColor = '#60a5fa'}
                      onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Niveau d'expérience</label>
                  <div style={iconWrapStyle}>
                    <Award style={iconStyle} />
                    <select
                      value={form.experience_level}
                      onChange={(e) => handleChange('experience_level', e.target.value)}
                      style={{ ...inputStyle(false), appearance: 'none', color: form.experience_level ? '#1f2937' : '#9ca3af' }}
                      disabled
                    >
                      <option value="">Sélectionnez votre niveau</option>
                      {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Biographie</label>
                  <div style={{ position: 'relative' }}>
                    <FileText style={{ ...iconStyle, top: 16, transform: 'none' }} />
                    <textarea
                      value={form.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      placeholder="Décrivez votre parcours, vos compétences..."
                      rows={4}
                      style={{ width: '100%', paddingTop: 12, paddingBottom: 12, paddingLeft: 48, paddingRight: 16, border: '2px solid #e5e7eb', borderRadius: 12, outline: 'none', resize: 'none', fontSize: 15, color: '#1f2937', boxSizing: 'border-box' }}
                      disabled
                      onFocus={e => e.target.style.borderColor = '#60a5fa'}
                      onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, textAlign: 'right', color: '#9ca3af' }}>{form.bio.length} caractères</div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/profile" style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px 0', fontWeight: 700, border: '2px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', color: '#1f2937', background: '#fff' }}>
                Annuler
              </button>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', fontWeight: 700, color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, background: 'linear-gradient(135deg,#4a6fa5,#3a5784)' }}>
              {loading ? (
                <><Loader style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Enregistrement...</>
              ) : (
                <><Save style={{ width: 18, height: 18 }} /> Enregistrer</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}