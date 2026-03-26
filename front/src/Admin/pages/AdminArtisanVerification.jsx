import { useState, useEffect, useCallback } from 'react';
import {
  Phone, Mail, Briefcase, Clock,
  CheckCircle, AlertCircle,
  Search, RefreshCw, Users, ShieldOff, ShieldCheck,
  ChevronDown, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../../services/api';

// ─── Helpers ────────────────────────────────────────────────

/**
 * Le back stocke le statut comme un booléen `suspendu`
 * user.update(['suspendu' => true]) → GET retourne { suspendu: true }
 * Le PATCH retourne juste { message: "..." }, pas l'user mis à jour.
 */
const getStatut = (user) => {
  if (typeof user.suspendu === 'boolean') return user.suspendu ? 'SUSPENDU' : 'ACTIF';
  return (user.statut ?? user.status ?? 'ACTIF').toUpperCase();
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const initials = (a) => `${a.prenom?.[0] ?? ''}${a.nom?.[0] ?? ''}`.toUpperCase();

// ─── Sous-composants ─────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div style={{
    background: 'white', border: '1px solid #eef0f4', borderRadius: 14,
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, backgroundColor: `${accent}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={20} color={accent} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 12, color: '#8a93a6', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 24, fontWeight: 700, color: '#1a1d2e', lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const Badge = ({ statut }) => {
  const s = statut === 'SUSPENDU';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      backgroundColor: s ? '#fef2f2' : '#f0fdf4',
      color: s ? '#dc2626' : '#16a34a',
      border: `1px solid ${s ? '#fecaca' : '#bbf7d0'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
      {statut}
    </span>
  );
};

const InfoRow = ({ icon, text, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ color: '#8a93a6', flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 13, color: accent ?? '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {text}
    </span>
  </div>
);

const ActionBtn = ({ onClick, color, bg, border, icon, label, loading }) => (
  <button onClick={onClick} disabled={loading} style={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    color, backgroundColor: bg, border: `1px solid ${border}`,
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.15s',
  }}
    onMouseEnter={e => !loading && (e.currentTarget.style.filter = 'brightness(0.95)')}
    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
  >
    {loading
      ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
      : icon}
    {label}
  </button>
);

const ArtisanCard = ({ artisan, onSuspendre, onReactiver, actionLoading }) => {
  const statut = getStatut(artisan);
  const isSuspended = statut === 'SUSPENDU';

  return (
    <div style={{
      background: 'white', border: '1px solid #eef0f4', borderRadius: 16, padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isSuspended
          ? 'linear-gradient(90deg, #ef4444, #f87171)'
          : 'linear-gradient(90deg, #4a6fa5, #6b8fc7)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: isSuspended
              ? 'linear-gradient(135deg, #fca5a5, #ef4444)'
              : 'linear-gradient(135deg, #4a6fa5, #3a5784)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {initials(artisan)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>
              {artisan.prenom} {artisan.nom}
            </h3>
            {artisan.artisan?.specialite && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#ff7e5f',
                background: 'rgba(255,126,95,0.1)', padding: '2px 8px',
                borderRadius: 6, display: 'inline-block', marginTop: 4,
              }}>
                {artisan.artisan.specialite}
              </span>
            )}
          </div>
        </div>
        <Badge statut={statut} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 18 }}>
        <InfoRow icon={<Mail size={13} />} text={artisan.email} />
        {artisan.telephone && <InfoRow icon={<Phone size={13} />} text={artisan.telephone} />}
        {artisan.artisan?.experience_annees && (
          <InfoRow icon={<Briefcase size={13} />} text={`${artisan.artisan.experience_annees} ans d'expérience`} />
        )}
        {artisan.artisan?.atelier?.ville && (
          <InfoRow icon={<MapPin size={13} />} text={artisan.artisan.atelier.ville} />
        )}
        <InfoRow icon={<Clock size={13} />} text={`Inscrit le ${formatDate(artisan.created_at)}`} />
        {artisan.artisan?.atelier?.nom && (
          <InfoRow icon={<Users size={13} />} text={artisan.artisan.atelier.nom} accent="#4a6fa5" />
        )}
      </div>

      <div style={{ height: 1, background: '#eef0f4', marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 10 }}>
        {isSuspended ? (
          <ActionBtn
            onClick={() => onReactiver(artisan.id)}
            color="#16a34a" bg="#f0fdf4" border="#bbf7d0"
            icon={<ShieldCheck size={15} />} label="Réactiver"
            loading={actionLoading === artisan.id}
          />
        ) : (
          <ActionBtn
            onClick={() => onSuspendre(artisan.id)}
            color="#dc2626" bg="#fef2f2" border="#fecaca"
            icon={<ShieldOff size={15} />} label="Suspendre"
            loading={actionLoading === artisan.id}
          />
        )}
      </div>
    </div>
  );
};

// ─── Pagination ──────────────────────────────────────────────

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
      <p style={{ margin: 0, fontSize: 13, color: '#8a93a6' }}>
        {meta.from}–{meta.to} sur {meta.total} artisans
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        <PageBtn disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)}>
          <ChevronLeft size={14} />
        </PageBtn>
        {Array.from({ length: meta.last_page }, (_, i) => i + 1)
          .filter(p => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) => p === '...'
            ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#8a93a6', fontSize: 13 }}>…</span>
            : <PageBtn key={p} active={p === meta.current_page} onClick={() => onPageChange(p)}>{p}</PageBtn>
          )}
        <PageBtn disabled={meta.current_page === meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>
          <ChevronRight size={14} />
        </PageBtn>
      </div>
    </div>
  );
};

const PageBtn = ({ children, onClick, disabled, active }) => (
  <button onClick={onClick} disabled={disabled} style={{
    minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: active ? '#4a6fa5' : 'white',
    color: active ? 'white' : disabled ? '#d1d5db' : '#4b5563',
    border: `1px solid ${active ? '#4a6fa5' : '#eef0f4'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }}>
    {children}
  </button>
);

// ─── Main Component ──────────────────────────────────────────

export default function AdminArtisanVerification() {
  const [artisans, setArtisans]       = useState([]);
  const [meta, setMeta]               = useState(null);   // pagination Laravel
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');

  // Stats globales (indépendantes de la page courante)
  const [statsTotal, setStatsTotal]   = useState({ total: 0, actifs: 0, suspendus: 0 });

  // ── Fetch ────────────────────────────────────────────────

  const fetchArtisans = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError('');

      // On passe role=ARTISAN directement au back (AdminUserController le supporte)
      // Le back retourne une pagination Laravel : { data: [], current_page, last_page, total, from, to }
      const params = new URLSearchParams({ role: 'ARTISAN', par_page: 12, page: p });
      if (search) params.set('search', search);
      if (filterStatut === 'suspendu') params.set('suspendu', 'true');
      if (filterStatut === 'actif')    params.set('suspendu', 'false');

      // adminAPI.users.index() ne supporte pas les query params → on appelle l'URL directement
      const token = localStorage.getItem('token');
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();

      // json = { data: [...], current_page, last_page, total, from, to, per_page }
      setArtisans(json.data ?? []);
      setMeta({
        current_page: json.current_page,
        last_page:    json.last_page,
        total:        json.total,
        from:         json.from,
        to:           json.to,
      });

      // Stats globales : on refait un appel sans filtre statut pour avoir les totaux
      if (p === 1) {
        const resAll = await fetch(`${BASE}/admin/users?role=ARTISAN&par_page=1`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const all = await resAll.json();
        const resSusp = await fetch(`${BASE}/admin/users?role=ARTISAN&suspendu=true&par_page=1`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const susp = await resSusp.json();
        setStatsTotal({
          total:     all.total ?? 0,
          suspendus: susp.total ?? 0,
          actifs:    (all.total ?? 0) - (susp.total ?? 0),
        });
      }

    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des artisans');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatut]);

  useEffect(() => {
    setPage(1);
    fetchArtisans(1);
  }, [search, filterStatut]);

  useEffect(() => {
    fetchArtisans(page);
  }, [page]);

  // ── Actions ──────────────────────────────────────────────

  const handleSuspendre = async (userId) => {
    if (!window.confirm('Confirmer la suspension de cet artisan ?')) return;
    setActionLoading(userId);
    try {
      await adminAPI.users.suspendre(userId);
      // Le back fait user.update(['suspendu' => true]) et retourne {message: "..."}
      // On reflète exactement ce changement localement
      setArtisans(prev => prev.map(a =>
        a.id === userId ? { ...a, suspendu: true } : a
      ));
      setStatsTotal(s => ({ ...s, actifs: s.actifs - 1, suspendus: s.suspendus + 1 }));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactiver = async (userId) => {
    setActionLoading(userId);
    try {
      await adminAPI.users.reactiver(userId);
      // Le back fait user.update(['suspendu' => false]) et retourne {message: "..."}
      setArtisans(prev => prev.map(a =>
        a.id === userId ? { ...a, suspendu: false } : a
      ));
      setStatsTotal(s => ({ ...s, actifs: s.actifs + 1, suspendus: s.suspendus - 1 }));
    } catch (err) {
      alert(err.message || 'Erreur lors de la réactivation');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ───────────────────────────────────────────────

  if (loading && artisans.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, border: '3px solid #e0e4ee', borderTopColor: '#4a6fa5',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: '#8a93a6', fontSize: 14, fontWeight: 500 }}>Chargement des artisans…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1a1d2e', letterSpacing: '-0.02em' }}>
              Gestion des artisans
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8a93a6' }}>
              Superviser et gérer les comptes artisans de la plateforme
            </p>
          </div>
          <button onClick={() => fetchArtisans(page)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'white',
            border: '1px solid #eef0f4', color: '#4a6fa5', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
            Actualiser
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <p style={{ margin: 0, fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total artisans"  value={statsTotal.total}     icon={Users}       accent="#4a6fa5" />
          <StatCard label="Actifs"           value={statsTotal.actifs}    icon={ShieldCheck} accent="#16a34a" />
          <StatCard label="Suspendus"        value={statsTotal.suspendus} icon={ShieldOff}   accent="#dc2626" />
        </div>

        {/* ── Alert suspendus ── */}
        {statsTotal.suspendus > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', fontWeight: 500 }}>
              {statsTotal.suspendus} artisan{statsTotal.suspendus > 1 ? 's' : ''} actuellement suspendu{statsTotal.suspendus > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8a93a6' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom, email…"
              style={{
                width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #eef0f4',
                borderRadius: 10, fontSize: 13, background: 'white', color: '#1a1d2e',
                outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{
              padding: '10px 36px 10px 14px', border: '1px solid #eef0f4', borderRadius: 10,
              fontSize: 13, background: 'white', color: '#1a1d2e', outline: 'none',
              cursor: 'pointer', appearance: 'none', fontWeight: 500,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs uniquement</option>
              <option value="suspendu">Suspendus uniquement</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a93a6', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── Grid ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#8a93a6', fontSize: 13 }}>
            Chargement…
          </div>
        )}

        {!loading && artisans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 18 }}>
            {artisans.map(a => (
              <ArtisanCard
                key={a.id} artisan={a}
                onSuspendre={handleSuspendre}
                onReactiver={handleReactiver}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {!loading && artisans.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 16, border: '1px solid #eef0f4' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1a1d2e' }}>
              {search || filterStatut !== 'tous' ? 'Aucun résultat' : 'Aucun artisan'}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#8a93a6' }}>
              {search ? "Essayez avec d'autres termes de recherche." : "Il n'y a aucun artisan pour le moment."}
            </p>
          </div>
        )}

        {/* ── Pagination ── */}
        <Pagination meta={meta} onPageChange={handlePageChange} />

      </div>
    </div>
  );
}