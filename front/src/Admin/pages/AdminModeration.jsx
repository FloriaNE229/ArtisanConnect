import { useState, useEffect, useCallback } from 'react';
import {
  Star, Trash2, UserX, UserCheck, AlertCircle,
  RefreshCw, Search, MessageSquare, Users,
  ChevronDown, Calendar, Shield
} from 'lucide-react';
import { adminAPI } from '../../../services/api';

// ─── Helpers ────────────────────────────────────────────────

/**
 * Le back Laravel stocke le statut comme booléen `suspendu`
 * user.update(['suspendu' => true]) → GET retourne { ..., suspendu: true }
 * PATCH retourne juste { message: "..." }, pas l'user mis à jour.
 */
const getStatut = (u) => {
  if (typeof u.suspendu === 'boolean') return u.suspendu ? 'SUSPENDU' : 'ACTIF';
  return (u.statut ?? u.status ?? 'ACTIF').toUpperCase();
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const initials = (u) =>
  `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();

// ─── fetchAllUsers ───────────────────────────────────────────
/**
 * adminAPI.users.index() appelle GET /admin/users sans params
 * → pagination Laravel par défaut = 20 items max.
 *
 * On construit l'URL manuellement avec par_page=100 pour tout récupérer.
 * C'est la seule façon fiable tant que adminAPI.users.index() ne supporte
 * pas les query params. (Tu peux aussi patcher ton api.js — voir README)
 */
const fetchAllUsers = async () => {
  const token = localStorage.getItem('token');
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const res = await fetch(`${BASE}/admin/users?par_page=100`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Erreur ${res.status}`);
  }
  const json = await res.json();
  // Pagination Laravel → { data: [...], total, current_page, ... }
  return Array.isArray(json) ? json : (json.data ?? []);
};

const fetchAllAvis = async () => {
  const token = localStorage.getItem('token');
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const res = await fetch(`${BASE}/admin/avis`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Erreur ${res.status}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? []);
};

// ─── Stars ──────────────────────────────────────────────────

const Stars = ({ note }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} style={{ color: i <= note ? '#f59e0b' : '#d1d5db', fill: i <= note ? '#f59e0b' : 'none' }} />
    ))}
  </div>
);

// ─── Badge ──────────────────────────────────────────────────

const Badge = ({ statut }) => {
  const s = statut === 'SUSPENDU';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      backgroundColor: s ? '#fef2f2' : '#f0fdf4',
      color: s ? '#dc2626' : '#16a34a',
      border: `1px solid ${s ? '#fecaca' : '#bbf7d0'}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
      {statut}
    </span>
  );
};

// ─── Stat Card ──────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div style={{
    background: 'white', border: '1px solid #eef0f4', borderRadius: 14,
    padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 11, backgroundColor: `${accent}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={18} color={accent} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 11, color: '#8a93a6', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
    background: active ? '#4a6fa5' : 'white',
    color: active ? 'white' : '#6b7280',
    border: `1px solid ${active ? '#4a6fa5' : '#eef0f4'}`,
    boxShadow: active ? '0 2px 8px rgba(74,111,165,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    {children}
  </button>
);

// ─── Avis Row ───────────────────────────────────────────────

const AvisRow = ({ avis, onDelete, loading }) => {
  const auteur = avis.client ?? avis.user ?? {};
  const nom = [auteur.prenom, auteur.nom].filter(Boolean).join(' ') || 'Anonyme';

  return (
    <div style={{
      background: 'white', border: '1px solid #eef0f4', borderRadius: 14,
      padding: '18px 22px', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #4a6fa5, #3a5784)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
        }}>
          {nom.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>{nom}</span>
            <Stars note={avis.note} />
            {avis.atelier?.nom && (
              <span style={{ fontSize: 11, color: '#4a6fa5', background: 'rgba(74,111,165,0.08)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                {avis.atelier.nom}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}>
              <Calendar size={10} />
              {formatDate(avis.created_at)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
            {avis.commentaire ?? avis.contenu ?? '(sans commentaire)'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(avis.id)}
        disabled={loading === avis.id}
        style={{
          flexShrink: 0, width: 34, height: 34, borderRadius: 9,
          background: '#fef2f2', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: loading === avis.id ? 'not-allowed' : 'pointer',
          opacity: loading === avis.id ? 0.5 : 1, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (loading !== avis.id) e.currentTarget.style.background = '#fee2e2'; }}
        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
      >
        {loading === avis.id
          ? <RefreshCw size={13} color="#dc2626" style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Trash2 size={13} color="#dc2626" />}
      </button>
    </div>
  );
};

// ─── User Row ───────────────────────────────────────────────

const UserRow = ({ user, onSuspendre, onReactiver, loading }) => {
  const statut = getStatut(user);
  const isSuspended = statut === 'SUSPENDU';
  const isLoading = loading === user.id;

  return (
    <tr style={{ borderBottom: '1px solid #eef0f4', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: isSuspended
              ? 'linear-gradient(135deg, #fca5a5, #ef4444)'
              : 'linear-gradient(135deg, #4a6fa5, #3a5784)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
          }}>
            {initials(user)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>
              {user.prenom} {user.nom}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{user.email}</p>
          </div>
        </div>
      </td>

      <td style={{ padding: '14px 20px' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          color: '#4a6fa5', background: 'rgba(74,111,165,0.08)',
          padding: '3px 9px', borderRadius: 6,
        }}>
          {user.role ?? '—'}
        </span>
      </td>

      <td style={{ padding: '14px 20px' }}>
        <Badge statut={statut} />
      </td>

      <td style={{ padding: '14px 20px', fontSize: 12, color: '#9ca3af' }}>
        {formatDate(user.created_at)}
      </td>

      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
        {isSuspended ? (
          <button onClick={() => onReactiver(user.id)} disabled={isLoading} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
          }}>
            {isLoading ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UserCheck size={12} />}
            Réactiver
          </button>
        ) : (
          <button onClick={() => onSuspendre(user.id)} disabled={isLoading} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1,
          }}>
            {isLoading ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <UserX size={12} />}
            Suspendre
          </button>
        )}
      </td>
    </tr>
  );
};

// ─── Main Component ──────────────────────────────────────────

export default function AdminModeration() {
  const [avis, setAvis]                   = useState([]);
  const [users, setUsers]                 = useState([]);
  const [tab, setTab]                     = useState('avis');
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('tous');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [avisData, usersData] = await Promise.all([
        fetchAllAvis(),
        fetchAllUsers(), // par_page=100 → récupère TOUS les users sans limite de pagination
      ]);
      setAvis(avisData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions avis ─────────────────────────────────────────

  const handleDeleteAvis = async (id) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    setActionLoading(id);
    try {
      await adminAPI.avis.destroy(id);
      setAvis(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Actions users ─────────────────────────────────────────

  const handleSuspendreUser = async (id) => {
    if (!window.confirm('Suspendre cet utilisateur ?')) return;
    setActionLoading(id);
    try {
      await adminAPI.users.suspendre(id);
      // back: user.update(['suspendu' => true]) → on reflète le booléen
      setUsers(prev => prev.map(u => u.id === id ? { ...u, suspendu: true } : u));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactiverUser = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.users.reactiver(id);
      // back: user.update(['suspendu' => false]) → on reflète le booléen
      setUsers(prev => prev.map(u => u.id === id ? { ...u, suspendu: false } : u));
    } catch (err) {
      alert(err.message || 'Erreur lors de la réactivation');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────

  const suspendus = users.filter(u => getStatut(u) === 'SUSPENDU');
  const roles = ['tous', ...new Set(users.map(u => u.role).filter(Boolean))];

  const filteredAvis = avis.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    const nom = [a.client?.prenom, a.client?.nom, a.user?.nom].filter(Boolean).join(' ').toLowerCase();
    return nom.includes(q) || (a.commentaire ?? a.contenu ?? '').toLowerCase().includes(q);
  });

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q);
    const matchRole = roleFilter === 'tous' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Loading ───────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, border: '3px solid #e0e4ee', borderTopColor: '#4a6fa5',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: '#8a93a6', fontSize: 14, fontWeight: 500 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '32px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1a1d2e', letterSpacing: '-0.02em' }}>Modération</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8a93a6' }}>Gérer les avis et les comptes utilisateurs</p>
          </div>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'white',
            border: '1px solid #eef0f4', color: '#4a6fa5', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <p style={{ margin: 0, fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard label="Total avis"   value={avis.length}       icon={MessageSquare} accent="#4a6fa5" />
          <StatCard label="Utilisateurs" value={users.length}      icon={Users}         accent="#6366f1" />
          <StatCard label="Suspendus"    value={suspendus.length}  icon={Shield}        accent="#dc2626" />
          <StatCard label="Note moyenne" icon={Star} accent="#f59e0b"
            value={avis.length ? (avis.reduce((s, a) => s + (a.note ?? 0), 0) / avis.length).toFixed(1) : '—'} />
        </div>

        {/* Alert suspendus */}
        {suspendus.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', fontWeight: 500 }}>
              {suspendus.length} compte{suspendus.length > 1 ? 's' : ''} suspendu{suspendus.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <TabBtn active={tab === 'avis'} onClick={() => { setTab('avis'); setSearch(''); }}>
            💬 Avis ({avis.length})
          </TabBtn>
          <TabBtn active={tab === 'users'} onClick={() => { setTab('users'); setSearch(''); }}>
            👤 Utilisateurs ({users.length}) {suspendus.length > 0 && `· ${suspendus.length} suspendu${suspendus.length > 1 ? 's' : ''}`}
          </TabBtn>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'avis' ? 'Rechercher par auteur ou contenu…' : 'Rechercher par nom ou email…'}
              style={{
                width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #eef0f4',
                borderRadius: 10, fontSize: 13, background: 'white', color: '#1a1d2e',
                outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            />
          </div>

          {tab === 'users' && (
            <div style={{ position: 'relative' }}>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
                padding: '9px 34px 9px 14px', border: '1px solid #eef0f4', borderRadius: 10,
                fontSize: 13, background: 'white', color: '#1a1d2e', outline: 'none',
                cursor: 'pointer', appearance: 'none', fontWeight: 500,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                {roles.map(r => <option key={r} value={r}>{r === 'tous' ? 'Tous les rôles' : r}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {/* Tab Avis */}
        {tab === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredAvis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 16, border: '1px solid #eef0f4' }}>
                <MessageSquare size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
                  Aucun avis{search ? ' pour cette recherche' : ''}
                </p>
              </div>
            ) : filteredAvis.map(a => (
              <AvisRow key={a.id} avis={a} onDelete={handleDeleteAvis} loading={actionLoading} />
            ))}
          </div>
        )}

        {/* Tab Users */}
        {tab === 'users' && (
          <div style={{ background: 'white', border: '1px solid #eef0f4', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <Users size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
                  Aucun utilisateur{search ? ' pour cette recherche' : ''}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eef0f4', background: '#fafbfc' }}>
                    {['Utilisateur', 'Rôle', 'Statut', 'Inscrit le', 'Action'].map((h, i) => (
                      <th key={h} style={{
                        padding: '12px 20px', fontSize: 11, fontWeight: 700,
                        color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase',
                        textAlign: i === 4 ? 'right' : 'left',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <UserRow
                      key={u.id} user={u}
                      onSuspendre={handleSuspendreUser}
                      onReactiver={handleReactiverUser}
                      loading={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}