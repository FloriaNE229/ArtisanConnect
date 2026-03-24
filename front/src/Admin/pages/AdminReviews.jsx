import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Star, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function AdminReviews() {
  const [avis, setAvis]                 = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterNote, setFilterNote]     = useState('ALL');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [deletingId, setDeletingId]     = useState(null);

  // ── Chargement ────────────────────────────────────────────
  const fetchAvis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.avis.index();
      setAvis(data.data ?? data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAvis(); }, [fetchAvis]);

  // ── Suppression ───────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis définitivement ?')) return;
    setDeletingId(id);
    try {
      await adminAPI.avis.destroy(id);
      setAvis(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtrage local ────────────────────────────────────────
  const filteredAvis = avis.filter(a => {
    const nom        = `${a.client?.prenom ?? a.user?.prenom ?? ''} ${a.client?.nom ?? a.user?.nom ?? ''}`.toLowerCase();
    const commentaire = (a.commentaire ?? a.contenu ?? '').toLowerCase();
    const atelierNom  = (a.atelier?.nom ?? '').toLowerCase();
    const term        = searchTerm.toLowerCase();

    const matchSearch = nom.includes(term) || commentaire.includes(term) || atelierNom.includes(term);
    const matchNote   = filterNote === 'ALL' || a.note === Number(filterNote);

    return matchSearch && matchNote;
  });

  // ── Stats ─────────────────────────────────────────────────
  const noteMoyenne = avis.length > 0
    ? (avis.reduce((acc, a) => acc + (a.note ?? 0), 0) / avis.length).toFixed(1)
    : null;

  // ── Rendu étoiles ─────────────────────────────────────────
  const Stars = ({ note }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="w-4 h-4"
          style={{ color: i <= note ? '#f59e0b' : '#e5e7eb', fill: i <= note ? '#f59e0b' : 'none' }} />
      ))}
    </div>
  );

  // ── Couleur badge note ────────────────────────────────────
  const getNoteColor = (note) => {
    if (note >= 4) return '#22c55e';
    if (note >= 3) return '#f59e0b';
    return '#ef4444';
  };

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
      <button onClick={fetchAvis}
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
              Modération des avis
            </h1>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              {avis.length} avis au total
            </p>
          </div>
          <button onClick={fetchAvis}
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
                placeholder="Rechercher par client, commentaire, atelier…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2" style={{ color: '#6c757d' }} />
              <select
                value={filterNote}
                onChange={(e) => setFilterNote(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg outline-none appearance-none"
                style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
                <option value="ALL">Toutes les notes</option>
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>{'★'.repeat(n)} {n} étoile{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          {[
            { label: 'Total avis',    value: avis.length,                            color: '#2b2d42',  suffix: '' },
            { label: 'Note moyenne',  value: noteMoyenne ?? '—',                     color: '#f59e0b',  suffix: noteMoyenne ? ' / 5' : '' },
            { label: '5 étoiles',     value: avis.filter(a => a.note === 5).length,  color: '#22c55e',  suffix: '' },
            { label: '1-2 étoiles',   value: avis.filter(a => a.note <= 2).length,   color: '#ef4444',  suffix: '' },
          ].map(({ label, value, color, suffix }) => (
            <div key={label} className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
              <p className="mb-1 text-xs font-medium" style={{ color: '#6c757d' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>
                {value}{suffix}
              </p>
            </div>
          ))}
        </div>

        {/* Liste des avis */}
        <div className="space-y-4">
          {filteredAvis.map((a) => {
            const isDeleting  = deletingId === a.id;
            const prenom      = a.client?.prenom ?? a.user?.prenom ?? '?';
            const nom         = a.client?.nom    ?? a.user?.nom    ?? 'Anonyme';
            const commentaire = a.commentaire    ?? a.contenu      ?? '(sans commentaire)';

            return (
              <div key={a.id}
                className="p-6 shadow-md rounded-xl transition-all"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  opacity: isDeleting ? 0.5 : 1,
                }}>
                <div className="flex items-start justify-between gap-4">

                  {/* Contenu avis */}
                  <div className="flex-1 min-w-0">

                    {/* Header : avatar + nom + date + étoiles */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white rounded-full w-9 h-9"
                        style={{ background: 'linear-gradient(135deg, #4a6fa5, #3a5784)' }}>
                        {prenom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#2b2d42' }}>
                          {prenom} {nom}
                        </p>
                        <p className="text-xs" style={{ color: '#adb5bd' }}>
                          {a.created_at
                            ? new Date(a.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit', month: 'long', year: 'numeric',
                              })
                            : '—'}
                        </p>
                      </div>

                      {/* Note étoiles + chiffre */}
                      <div className="flex items-center gap-2 ml-auto">
                        <Stars note={a.note} />
                        <span className="text-sm font-bold" style={{ color: getNoteColor(a.note) }}>
                          {a.note}/5
                        </span>
                      </div>
                    </div>

                    {/* Commentaire */}
                    <p className="mb-2 text-sm leading-relaxed" style={{ color: '#2b2d42' }}>
                      {commentaire}
                    </p>

                    {/* Atelier concerné */}
                    {a.atelier?.nom && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md"
                        style={{ backgroundColor: 'rgba(74, 111, 165, 0.08)', color: '#4a6fa5' }}>
                        Atelier : <span className="font-medium">{a.atelier.nom}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={isDeleting}
                    className="flex-shrink-0 p-2 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isDeleting
                      ? <div className="w-4 h-4 border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
                      : <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                    }
                  </button>
                </div>
              </div>
            );
          })}

          {filteredAvis.length === 0 && (
            <div className="p-12 text-center shadow-md rounded-xl"
              style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
              <p className="text-sm" style={{ color: '#6c757d' }}>
                {searchTerm || filterNote !== 'ALL'
                  ? 'Aucun avis ne correspond aux filtres.'
                  : 'Aucun avis trouvé.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}