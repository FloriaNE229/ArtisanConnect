import { useState, useEffect, useCallback } from 'react';
import {
  Search, MoreVertical, Trash2, MapPin,
  Star, ShieldOff, ShieldCheck, RefreshCw, AlertCircle,
} from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function AdminAteliers() {
  const [ateliers, setAteliers]         = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showActions, setShowActions]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // ── Ferme le menu si on clique ailleurs ──────────────────
  useEffect(() => {
    const close = () => setShowActions(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── Chargement ────────────────────────────────────────────
  const fetchAteliers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.ateliers.index();
      setAteliers(data.data ?? data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des ateliers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAteliers(); }, [fetchAteliers]);

  // ── Helpers statut ────────────────────────────────────────
  // Ton modèle Atelier utilise probablement un champ booléen "suspendu"
  // ou un enum "statut". On gère les deux cas.
  const getStatut = (atelier) => {
    if (atelier.suspendu) return 'SUSPENDU';
    return atelier.statut ?? atelier.status ?? 'ACTIF';
  };

  // ── Actions ───────────────────────────────────────────────
  const handleSuspendre = async (id) => {
    if (!window.confirm('Suspendre cet atelier ?')) return;
    setActionLoading(id);
    try {
      await adminAPI.ateliers.suspendre(id);
      setAteliers(prev => prev.map(a =>
        a.id === id ? { ...a, suspendu: true, statut: 'SUSPENDU', status: 'SUSPENDU' } : a
      ));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suspension');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleReactiver = async (id) => {
    if (!window.confirm('Réactiver cet atelier ?')) return;
    setActionLoading(id);
    try {
      await adminAPI.ateliers.reactiver(id);
      setAteliers(prev => prev.map(a =>
        a.id === id ? { ...a, suspendu: false, statut: 'ACTIF', status: 'ACTIF' } : a
      ));
    } catch (err) {
      alert(err.message || 'Erreur lors de la réactivation');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet atelier ? Cette action est irréversible.')) return;
    setActionLoading(id);
    try {
      await adminAPI.ateliers.destroy(id);
      setAteliers(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
      setShowActions(null);
    }
  };

  // ── Filtrage local ────────────────────────────────────────
  const filteredAteliers = ateliers.filter(atelier => {
    const statut     = getStatut(atelier);
    const artisanNom = atelier.artisan_nom ?? atelier.artisan?.user?.nom ?? '';

    const matchSearch =
      (atelier.nom  ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisanNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (atelier.ville ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || statut === filterStatus;

    return matchSearch && matchStatus;
  });

  // ── Styles badges ─────────────────────────────────────────
  const getStatusBadgeStyle = (statut) => ({
    ACTIF:    { backgroundColor: 'rgba(34, 197, 94, 0.1)',   color: '#22c55e' },
    SUSPENDU: { backgroundColor: 'rgba(239, 68, 68, 0.1)',   color: '#ef4444' },
    INACTIF:  { backgroundColor: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' },
  }[statut] ?? { backgroundColor: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' });

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
      <button onClick={fetchAteliers}
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
              Gestion des ateliers
            </h1>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              {ateliers.length} atelier{ateliers.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button onClick={fetchAteliers}
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
                placeholder="Rechercher par nom, artisan, ville…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm border rounded-lg outline-none"
              style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIF">Actifs</option>
              <option value="SUSPENDU">Suspendus</option>
              <option value="INACTIF">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          {[
            { label: 'Total ateliers', value: ateliers.length,                                       color: '#2b2d42' },
            { label: 'Actifs',         value: ateliers.filter(a => getStatut(a) === 'ACTIF').length,    color: '#22c55e' },
            { label: 'Suspendus',      value: ateliers.filter(a => getStatut(a) === 'SUSPENDU').length, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
              <p className="mb-1 text-xs font-medium" style={{ color: '#6c757d' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAteliers.map((atelier) => {
            const statut     = getStatut(atelier);
            const artisanNom = atelier.artisan_nom ?? atelier.artisan?.user?.nom ?? 'Inconnu';
            const isLoading  = actionLoading === atelier.id;

            return (
              <div key={atelier.id}
                className="p-6 transition-all shadow-md rounded-xl hover:shadow-lg"
                style={{ backgroundColor: 'white', border: '1px solid #e9ecef', opacity: isLoading ? 0.6 : 1 }}>

                {/* Header carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-bold truncate" style={{ color: '#2b2d42' }}>
                      {atelier.nom}
                    </h3>
                    <p className="mb-2 text-sm" style={{ color: '#6c757d' }}>
                      Par {artisanNom}
                    </p>
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                      style={getStatusBadgeStyle(statut)}>
                      {statut}
                    </span>
                  </div>

                  {/* Bouton menu */}
                  <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowActions(showActions === atelier.id ? null : atelier.id)}
                      disabled={isLoading}
                      className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50">
                      {isLoading
                        ? <div className="w-5 h-5 border-2 border-gray-400 rounded-full border-t-transparent animate-spin" />
                        : <MoreVertical className="w-5 h-5" style={{ color: '#6c757d' }} />
                      }
                    </button>

                    {/* Dropdown actions */}
                    {showActions === atelier.id && (
                      <div className="absolute right-0 z-20 w-48 mt-2 overflow-hidden rounded-lg shadow-lg"
                        style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>

                        {statut !== 'SUSPENDU' ? (
                          <button onClick={() => handleSuspendre(atelier.id)}
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50">
                            <ShieldOff className="w-4 h-4" style={{ color: '#ef4444' }} />
                            <span style={{ color: '#2b2d42' }}>Suspendre</span>
                          </button>
                        ) : (
                          <button onClick={() => handleReactiver(atelier.id)}
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-gray-50">
                            <ShieldCheck className="w-4 h-4" style={{ color: '#22c55e' }} />
                            <span style={{ color: '#2b2d42' }}>Réactiver</span>
                          </button>
                        )}

                        <div style={{ borderTop: '1px solid #e9ecef' }}>
                          <button onClick={() => handleDelete(atelier.id)}
                            className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors hover:bg-red-50">
                            <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                            <span style={{ color: '#ef4444' }}>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Infos atelier */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="flex-shrink-0 w-4 h-4" style={{ color: '#6c757d' }} />
                    <span className="text-sm truncate" style={{ color: '#2b2d42' }}>
                      {[atelier.ville, atelier.domaine].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </div>

                  {atelier.note_moyenne != null && (
                    <div className="flex items-center gap-2">
                      <Star className="flex-shrink-0 w-4 h-4" style={{ color: '#f59e0b' }} />
                      <span className="text-sm font-medium" style={{ color: '#2b2d42' }}>
                        {Number(atelier.note_moyenne).toFixed(1)}
                        <span className="ml-1 font-normal" style={{ color: '#6c757d' }}>
                          ({atelier.nombre_avis ?? 0} avis)
                        </span>
                      </span>
                    </div>
                  )}

                  {atelier.created_at && (
                    <p className="text-xs" style={{ color: '#adb5bd' }}>
                      Créé le {new Date(atelier.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* État vide */}
        {filteredAteliers.length === 0 && (
          <div className="p-12 text-center shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              {searchTerm || filterStatus !== 'ALL'
                ? 'Aucun atelier ne correspond aux filtres.'
                : 'Aucun atelier trouvé.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}