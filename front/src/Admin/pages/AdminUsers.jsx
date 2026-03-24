import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function AdminUsers() {
  const [users, setUsers]             = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterRole, setFilterRole]   = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showActions, setShowActions] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id en cours d'action

  // ── Ferme le menu si on clique ailleurs ──────────────────
  useEffect(() => {
    const close = () => setShowActions(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── Chargement des utilisateurs ───────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.users.index();
      setUsers(data.data ?? data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Actions ───────────────────────────────────────────────
  const handleSuspendre = async (userId) => {
    if (!window.confirm('Suspendre cet utilisateur ?')) return;
    setActionLoading(userId);
    try {
      await adminAPI.users.suspendre(userId);
      // Mise à jour locale immédiate (pas besoin de refetch)
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, suspendu: true, statut: 'SUSPENDU', status: 'SUSPENDU' } : u
      ));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleReactiver = async (userId) => {
    if (!window.confirm('Réactiver cet utilisateur ?')) return;
    setActionLoading(userId);
    try {
      await adminAPI.users.reactiver(userId);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, suspendu: false, statut: 'ACTIF', status: 'ACTIF' } : u
      ));
    } catch (err) {
      alert(err.message || 'Erreur lors de la réactivation');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ? Cette action est irréversible.')) return;
    setActionLoading(userId);
    try {
      await adminAPI.users.destroy(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  // ── Filtrage local ────────────────────────────────────────
  const filteredUsers = users.filter(user => {
    const nom    = user.nom    ?? '';
    const prenom = user.prenom ?? '';
    const email  = user.email  ?? '';
    const statut = user.suspendu ? 'SUSPENDU' : (user.statut ?? user.status ?? 'ACTIF');

    const matchSearch =
      nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole   = filterRole   === 'ALL' || user.role === filterRole;
    const matchStatus = filterStatus === 'ALL' || statut    === filterStatus;

    return matchSearch && matchRole && matchStatus;
  });

  // ── Styles badges ─────────────────────────────────────────
  const getRoleBadgeStyle = (role) => ({
    CLIENT:  { backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5' },
    ARTISAN: { backgroundColor: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f' },
    ADMIN:   { backgroundColor: 'rgba(220, 38, 38, 0.1)',  color: '#dc2626' },
  }[role] ?? { backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5' });

  const getStatusBadgeStyle = (statut) => ({
    ACTIF:    { backgroundColor: 'rgba(34, 197, 94, 0.1)',  color: '#22c55e' },
    SUSPENDU: { backgroundColor: 'rgba(239, 68, 68, 0.1)',  color: '#ef4444' },
    INACTIF:  { backgroundColor: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' },
  }[statut] ?? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' });

  // ── Rendu statut (basé sur champ suspendu booléen Laravel) ─
  const getStatut = (user) =>
    user.suspendu ? 'SUSPENDU' : (user.statut ?? user.status ?? 'ACTIF');

  // ── États loading / error ─────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="flex items-center gap-2 p-4 text-red-600 bg-red-100 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
      <button onClick={fetchUsers}
        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
        style={{ backgroundColor: '#4a6fa5' }}>
        <RefreshCw className="w-4 h-4" /> Réessayer
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="mx-auto max-w-7xl">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-1 text-3xl font-bold" style={{ color: '#2b2d42' }}>
              Gestion des utilisateurs
            </h1>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef', color: '#2b2d42' }}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="p-6 mb-6 shadow-md rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2" style={{ color: '#6c757d' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 text-sm border rounded-lg outline-none"
              style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
              <option value="ALL">Tous les rôles</option>
              <option value="CLIENT">Clients</option>
              <option value="ARTISAN">Artisans</option>
              <option value="ADMIN">Administrateurs</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm border rounded-lg outline-none"
              style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actifs</option>
              <option value="SUSPENDU">Suspendus</option>
            </select>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          {[
            { label: 'Total',    value: users.length,                                            color: '#2b2d42' },
            { label: 'Clients',  value: users.filter(u => u.role === 'CLIENT').length,           color: '#4a6fa5' },
            { label: 'Artisans', value: users.filter(u => u.role === 'ARTISAN').length,          color: '#ff7e5f' },
            { label: 'Suspendus',value: users.filter(u => u.suspendu).length,                   color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
              <p className="mb-1 text-xs font-medium" style={{ color: '#6c757d' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden shadow-md rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                  {['UTILISATEUR', 'RÔLE', 'STATUT', 'CONTACT', 'INSCRIPTION', 'ACTIONS'].map((h, i) => (
                    <th key={h}
                      className={`px-6 py-4 text-xs font-semibold tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#6c757d' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statut    = getStatut(user);
                  const isLoading = actionLoading === user.id;

                  return (
                    <tr key={user.id}
                      className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: '1px solid #e9ecef', opacity: isLoading ? 0.5 : 1 }}>

                      {/* Utilisateur */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photo_profil ? (
                            <img src={user.photo_profil} alt=""
                              className="object-cover w-10 h-10 rounded-full" />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full"
                              style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                              {user.prenom?.[0] ?? '?'}{user.nom?.[0] ?? '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2b2d42' }}>
                              {user.prenom} {user.nom}
                            </p>
                            <p className="text-xs" style={{ color: '#6c757d' }}>ID : {user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                          style={getRoleBadgeStyle(user.role)}>
                          {user.role}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                          style={getStatusBadgeStyle(statut)}>
                          {statut}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 flex-shrink-0" style={{ color: '#6c757d' }} />
                          <span className="text-xs truncate max-w-[180px]" style={{ color: '#2b2d42' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#6c757d' }}>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR')
                            : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                            disabled={isLoading}
                            className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            {isLoading
                              ? <div className="w-5 h-5 border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
                              : <MoreVertical className="w-5 h-5" style={{ color: '#6c757d' }} />
                            }
                          </button>

                          {showActions === user.id && (
                            <div className="absolute right-0 z-20 w-48 mt-2 rounded-lg shadow-lg"
                              style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>

                              {statut !== 'SUSPENDU' ? (
                                <button onClick={() => handleSuspendre(user.id)}
                                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors rounded-t-lg hover:bg-gray-50">
                                  <UserX className="w-4 h-4" style={{ color: '#ef4444' }} />
                                  <span style={{ color: '#2b2d42' }}>Suspendre</span>
                                </button>
                              ) : (
                                <button onClick={() => handleReactiver(user.id)}
                                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors rounded-t-lg hover:bg-gray-50">
                                  <UserCheck className="w-4 h-4" style={{ color: '#22c55e' }} />
                                  <span style={{ color: '#2b2d42' }}>Réactiver</span>
                                </button>
                              )}

                              <div style={{ borderTop: '1px solid #e9ecef' }}>
                                <button onClick={() => handleDelete(user.id)}
                                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors rounded-b-lg hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                                  <span style={{ color: '#ef4444' }}>Supprimer</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: '#6c757d' }}>
                {searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL'
                  ? 'Aucun utilisateur ne correspond aux filtres.'
                  : 'Aucun utilisateur trouvé.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}