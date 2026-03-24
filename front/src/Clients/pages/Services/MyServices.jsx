import { useState, useEffect } from 'react';
import {
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ListChecks,
  CalendarDays,
  Wallet,
  Siren,
  Hash,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card   from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { useAuth }    from '../../components/Auth/AuthContext';
import { serviceAPI } from '../../../../services/api';

// Laravel renvoie `statut` (FR), pas `status` (EN)
const getStatut = (s) => s.statut ?? s.status ?? 'EN_ATTENTE';

export default function MyServices() {
  const { user } = useAuth();
  const isArtisan = user?.role === 'ARTISAN';

  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error,        setError]        = useState(null);

  // ── GET /api/services ──────────────────────────────────────
  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = isArtisan
        ? await serviceAPI.indexArtisan() // ARTISAN : indexArtisan()
        : await serviceAPI.index();       // CLIENT  : index()

      // Récupérer la liste réelle des services
      let list = [];
      if (Array.isArray(data.services)) {
        list = data.services;
      } else if (data.services?.data) {
        list = data.services.data; // Laravel pagination
      }
      setServices(list);
    } catch (err) {
      if (err.status === 404) setServices([]);
      else setError(err.message || 'Erreur lors du chargement des services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [isArtisan]);

  // ── Actions ────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette demande ?')) return;
    try { await serviceAPI.annuler(id); fetchServices(); }
    catch (err) { alert(err.message || 'Erreur lors de l\'annulation.'); }
  };

  const handleAccepter = async (id) => {
    try { await serviceAPI.accepter(id); fetchServices(); }
    catch (err) { alert(err.message || 'Erreur lors de l\'acceptation.'); }
  };

  const handleRefuser = async (id) => {
    if (!window.confirm('Refuser cette demande ?')) return;
    try { await serviceAPI.refuser(id); fetchServices(); }
    catch (err) { alert(err.message || 'Erreur lors du refus.'); }
  };

  const handleTerminer = async (id) => {
    if (!window.confirm('Marquer ce service comme terminé ?')) return;
    try { await serviceAPI.terminer(id); fetchServices(); }
    catch (err) { alert(err.message || 'Erreur lors de la clôture.'); }
  };

  // ── Badge statut ───────────────────────────────────────────
  const getStatusBadge = (statut) => {
    const styles = {
      EN_ATTENTE: { bg: 'bg-amber-50',   color: 'text-amber-600',   Icon: Clock,       label: 'En attente' },
      ACCEPTE:    { bg: 'bg-blue-50',    color: 'text-blue-600',    Icon: CheckCircle, label: 'Accepté'    },
      REFUSE:     { bg: 'bg-red-50',     color: 'text-red-600',     Icon: XCircle,     label: 'Refusé'     },
      TERMINE:    { bg: 'bg-emerald-50', color: 'text-emerald-600', Icon: CheckCircle, label: 'Terminé'    },
      ANNULE:     { bg: 'bg-slate-100',  color: 'text-slate-600',   Icon: XCircle,     label: 'Annulé'     },
    };
    const s = styles[statut] ?? styles.EN_ATTENTE;
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${s.bg} ${s.color}`}>
        <s.Icon className="w-3 h-3" />
        {s.label}
      </div>
    );
  };

  // ── Filtres
  const countBy = (val) => services.filter(s => getStatut(s) === val).length;
  const filteredServices = filterStatus === 'all'
    ? services
    : services.filter(s => getStatut(s) === filterStatus);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold text-blue-700 border border-blue-100 rounded-full bg-blue-50">
            <ListChecks className="w-4 h-4" />
            {filteredServices.length} demande{filteredServices.length > 1 ? 's' : ''}
          </div>

          <h1 className="mb-4 text-4xl font-black text-slate-900 md:text-5xl">
            {isArtisan ? 'Demandes reçues' : 'Mes demandes'}{' '}
            <span className="text-blue-600">de services</span>
          </h1>

          <p className="mb-6 text-lg text-slate-600">
            {isArtisan ? 'Gérez les demandes de vos clients' : 'Suivez l\'état de vos demandes de services'}
          </p>
        </div>

        {/* Filtres */}
        <Card className="p-6 mb-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800">Filtrer par statut</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all',        label: 'Tous',       count: services.length },
              { value: 'EN_ATTENTE', label: 'En attente', count: countBy('EN_ATTENTE') },
              { value: 'ACCEPTE',    label: 'Acceptés',   count: countBy('ACCEPTE')   },
              { value: 'TERMINE',    label: 'Terminés',   count: countBy('TERMINE')   },
              { value: 'ANNULE',     label: 'Annulés',    count: countBy('ANNULE')    },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-2 text-sm font-bold transition-all rounded-xl border-2 ${
                  filterStatus === f.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </Card>

        {/* Erreur */}
        {error && (
          <Card className="py-10 mb-8 text-center bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="mb-4 font-semibold text-red-600">{error}</p>
            <Button onClick={fetchServices}>
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </Card>
        )}

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          </div>
        ) : !error && filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map(service => {
              const statut = getStatut(service);
              return (
                <Card key={service.id} hover className="p-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
                  <div className="flex flex-col gap-6 md:flex-row">

                    {/* Avatar */}
                    <div className="flex-shrink-0 w-full h-32 overflow-hidden border md:w-32 rounded-2xl bg-slate-100 border-slate-200">
                      {(() => {
                        const person = isArtisan ? service.client : service.artisan;
                        const photo  = person?.photo_profil ?? person?.photo ?? person?.image;
                        const nom    = person?.prenom ?? person?.name ?? '?';
                        return photo ? (
                          <img src={photo} alt={nom} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-3xl font-black text-white bg-blue-600">
                            {nom.charAt(0).toUpperCase()}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Infos */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="mb-1 text-xl font-bold text-slate-900">
                            {service.titre ?? service.title ?? 'Demande de service'}
                          </h3>

                          <p className="mb-2 text-sm font-semibold text-blue-600">
                            {isArtisan
                              ? `${service.client?.prenom ?? ''} ${service.client?.nom ?? ''}`.trim() || service.client?.email
                              : `${service.artisan?.prenom ?? ''} ${service.artisan?.nom ?? ''}`.trim() || service.artisan?.email
                            }
                            {!isArtisan && service.artisan?.specialite ? ` — ${service.artisan.specialite}` : ''}
                          </p>

                          {service.description && (
                            <p className="mb-2 text-sm leading-6 text-slate-600">
                              {service.description}
                            </p>
                          )}
                        </div>

                        {getStatusBadge(statut)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-5 md:grid-cols-4">
                        <div className="p-3 border rounded-xl bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                            <CalendarDays className="w-4 h-4" />
                            Date demande
                          </div>
                          <div className="text-sm font-bold text-slate-800">
                            {service.created_at ? new Date(service.created_at).toLocaleDateString('fr-FR') : '—'}
                          </div>
                        </div>

                        <div className="p-3 border rounded-xl bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                            <Wallet className="w-4 h-4" />
                            Budget estimé
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            {service.budget ? `${Number(service.budget).toLocaleString('fr-FR')} FCFA` : '—'}
                          </div>
                        </div>

                        <div className="p-3 border rounded-xl bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                            <Siren className="w-4 h-4" />
                            Urgence
                          </div>
                          <div className={`text-sm font-bold ${service.urgent ? 'text-red-600' : 'text-slate-800'}`}>
                            {service.urgent ? 'Urgent' : 'Normal'}
                          </div>
                        </div>

                        <div className="p-3 border rounded-xl bg-slate-50 border-slate-200">
                          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                            <Hash className="w-4 h-4" />
                            Référence
                          </div>
                          <div className="text-sm font-bold text-slate-800">#{service.id}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link to={`/service/${service.id}`}>
                          <Button variant="outline" className="!px-4 !py-2 !text-sm">
                            <Eye className="w-4 h-4" />
                            Détails
                          </Button>
                        </Link>

                        {!isArtisan && statut === 'TERMINE' && !service.reviewed && (
                          <Link to={`/reviews/write/${service.atelier?.id ?? service.atelier_id}`}>
                            <Button variant="secondary" className="!px-4 !py-2 !text-sm">
                              Laisser un avis
                            </Button>
                          </Link>
                        )}

                        {!isArtisan && statut === 'EN_ATTENTE' && (
                          <Button
                            variant="outline"
                            className="!px-4 !py-2 !text-sm !text-red-600 !border-red-600 hover:!bg-red-50"
                            onClick={() => handleCancel(service.id)}
                          >
                            Annuler
                          </Button>
                        )}

                        {isArtisan && statut === 'EN_ATTENTE' && (
                          <>
                            <Button
                              variant="primary"
                              className="!px-4 !py-2 !text-sm"
                              onClick={() => handleAccepter(service.id)}
                            >
                              Accepter
                            </Button>

                            <Button
                              variant="outline"
                              className="!px-4 !py-2 !text-sm !text-red-600 !border-red-600 hover:!bg-red-50"
                              onClick={() => handleRefuser(service.id)}
                            >
                              Refuser
                            </Button>
                          </>
                        )}

                        {isArtisan && statut === 'ACCEPTE' && (
                          <Button
                            variant="secondary"
                            className="!px-4 !py-2 !text-sm"
                            onClick={() => handleTerminer(service.id)}
                          >
                            Marquer terminé
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : !error && (
          <Card className="py-20 text-center bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>

            <h3 className="mb-3 text-2xl font-bold text-slate-900">Aucune demande</h3>

            <p className="mb-6 text-sm text-slate-600">
              {isArtisan
                ? 'Aucune demande de service reçue pour l\'instant.'
                : 'Vous n\'avez pas encore de demande de service.'}
            </p>

            
          </Card>
        )}
      </div>
    </div>
  );
}
