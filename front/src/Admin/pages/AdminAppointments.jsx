import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Calendar, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const STATUS_CONFIG = {
  EN_ATTENTE: { label: 'En attente', bg: 'rgba(251, 146, 60, 0.1)',  color: '#fb923c' },
  ACCEPTE:    { label: 'Accepté',    bg: 'rgba(74, 111, 165, 0.1)',  color: '#4a6fa5' },
  REFUSE:     { label: 'Refusé',     bg: 'rgba(239, 68, 68, 0.1)',   color: '#ef4444' },
  ANNULE:     { label: 'Annulé',     bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' },
};

export default function AdminAppointments() {
  const [rdvs, setRdvs]                 = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [deletingId, setDeletingId]     = useState(null);

  // ── Chargement ────────────────────────────────────────────
  const fetchRdvs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.rendezVous.index();
      setRdvs(data.data ?? data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRdvs(); }, [fetchRdvs]);

  // ── Suppression ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce rendez-vous définitivement ?')) return;
    setDeletingId(id);
    try {
      await adminAPI.rendezVous.destroy(id);
      setRdvs(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtrage local ────────────────────────────────────────
  const filteredRdvs = rdvs.filter(r => {
    const clientNom  = `${r.client?.prenom ?? ''} ${r.client?.nom ?? ''}`.toLowerCase();
    const artisanNom = `${r.artisan?.user?.prenom ?? ''} ${r.artisan?.user?.nom ?? ''}`.toLowerCase();
    const term       = searchTerm.toLowerCase();

    const matchSearch  = clientNom.includes(term) || artisanNom.includes(term);
    const matchStatut  = filterStatut === 'ALL' || r.statut === filterStatut;

    return matchSearch && matchStatut;
  });

  const getStatusStyle = (statut) => ({
    backgroundColor: STATUS_CONFIG[statut]?.bg    ?? 'rgba(156,163,175,0.1)',
    color:           STATUS_CONFIG[statut]?.color  ?? '#9ca3af',
  });

  // ── Format date ───────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Avatar initiales ──────────────────────────────────────
  const Avatar = ({ prenom, nom, gradient }) => (
    <div className="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full flex-shrink-0"
      style={{ background: gradient }}>
      {prenom?.[0] ?? '?'}{nom?.[0] ?? ''}
    </div>
  );

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
      <button onClick={fetchRdvs}
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
              Supervision des rendez-vous
            </h1>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              {rdvs.length} rendez-vous au total
            </p>
          </div>
          <button onClick={fetchRdvs}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef', color: '#2b2d42' }}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="p-6 mb-6 shadow-md rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2" style={{ color: '#6c757d' }} />
              <input
                type="text"
                placeholder="Rechercher par client ou artisan…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2" style={{ color: '#6c757d' }} />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none appearance-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
                <option value="ALL">Tous les statuts</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          {[
            { label: 'Total',      value: rdvs.length,                                          color: '#2b2d42' },
            { label: 'En attente', value: rdvs.filter(r => r.statut === 'EN_ATTENTE').length,   color: '#fb923c' },
            { label: 'Acceptés',   value: rdvs.filter(r => r.statut === 'ACCEPTE').length,      color: '#4a6fa5' },
            { label: 'Refusés',    value: rdvs.filter(r => r.statut === 'REFUSE').length,       color: '#ef4444' },
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
                  {['ID', 'CLIENT', 'ARTISAN', 'DATE RDV', 'STATUT', 'CRÉÉ LE', 'ACTIONS'].map((h, i) => (
                    <th key={h}
                      className={`px-6 py-4 text-xs font-semibold tracking-wider ${i === 6 ? 'text-right' : 'text-left'}`}
                      style={{ color: '#6c757d' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRdvs.map((r) => {
                  const isDeleting = deletingId === r.id;
                  return (
                    <tr key={r.id}
                      className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: '1px solid #e9ecef', opacity: isDeleting ? 0.5 : 1 }}>

                      {/* ID */}
                      <td className="px-6 py-4 font-mono text-sm" style={{ color: '#6c757d' }}>
                        #{r.id}
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            prenom={r.client?.prenom}
                            nom={r.client?.nom}
                            gradient="linear-gradient(135deg, #4a6fa5, #3a5784)"
                          />
                          <span className="text-sm" style={{ color: '#2b2d42' }}>
                            {r.client?.prenom} {r.client?.nom ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Artisan */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            prenom={r.artisan?.user?.prenom}
                            nom={r.artisan?.user?.nom}
                            gradient="linear-gradient(135deg, #ff7e5f, #e05f40)"
                          />
                          <span className="text-sm" style={{ color: '#2b2d42' }}>
                            {r.artisan?.user?.prenom} {r.artisan?.user?.nom ?? '—'}
                          </span>
                        </div>
                      </td>

                      {/* Date RDV */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#6c757d' }} />
                          <span className="text-sm whitespace-nowrap" style={{ color: '#2b2d42' }}>
                            {formatDate(r.date_heure)}
                          </span>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap"
                          style={getStatusStyle(r.statut)}>
                          {STATUS_CONFIG[r.statut]?.label ?? r.statut ?? '—'}
                        </span>
                      </td>

                      {/* Créé le */}
                      <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: '#6c757d' }}>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={isDeleting}
                          className="p-2 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isDeleting
                            ? <div className="w-4 h-4 border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
                            : <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                          }
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRdvs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm" style={{ color: '#6c757d' }}>
                {searchTerm || filterStatut !== 'ALL'
                  ? 'Aucun rendez-vous ne correspond aux filtres.'
                  : 'Aucun rendez-vous trouvé.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}