import { useState, useEffect } from 'react';
import { Filter, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
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
      EN_ATTENTE: { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c',        Icon: Clock,        label: 'En attente' },
      ACCEPTE:    { bg: 'rgba(74,111,165,0.1)',  color: 'var(--primary)', Icon: CheckCircle,  label: 'Accepté'    },
      REFUSE:     { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444',        Icon: XCircle,      label: 'Refusé'     },
      TERMINE:    { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',        Icon: CheckCircle,  label: 'Terminé'    },
      ANNULE:     { bg: 'rgba(107,114,128,0.1)', color: '#6b7280',        Icon: XCircle,      label: 'Annulé'     },
    };
    const s = styles[statut] ?? styles.EN_ATTENTE;
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full"
        style={{ backgroundColor: s.bg, color: s.color }}>
        <s.Icon className="w-3 h-3" />{s.label}
      </div>
    );
  };

  // ── Filtres
  const countBy = (val) => services.filter(s => getStatut(s) === val).length;
  const filteredServices = filterStatus === 'all'
    ? services
    : services.filter(s => getStatut(s) === filterStatus);

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: 'var(--light)' }}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full"
            style={{ backgroundColor: 'rgba(74,111,165,0.1)', color: 'var(--primary)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
            {filteredServices.length} demande{filteredServices.length > 1 ? 's' : ''}
          </div>

          <h1 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: 'var(--dark)' }}>
            {isArtisan ? 'Demandes reçues' : 'Mes demandes'}
            <span className="text-transparent bg-clip-text"
              style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}de services
            </span>
          </h1>

          <p className="mb-6 text-lg" style={{ color: 'var(--dark)', opacity: 0.7 }}>
            {isArtisan ? 'Gérez les demandes de vos clients' : 'Suivez l\'état de vos demandes de services'}
          </p>

          {!isArtisan && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/services/request" className="flex-1">
                <Button variant="primary" className="w-full">Nouvelle demande de service</Button>
              </Link>
              <Link to="/services/immediate" className="flex-1">
                <Button variant="secondary" className="w-full">Service immédiat</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <span className="font-bold" style={{ color: 'var(--dark)' }}>Filtrer par statut</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all',        label: 'Tous',       count: services.length },
              { value: 'EN_ATTENTE', label: 'En attente', count: countBy('EN_ATTENTE') },
              { value: 'ACCEPTE',    label: 'Acceptés',   count: countBy('ACCEPTE')   },
              { value: 'TERMINE',    label: 'Terminés',   count: countBy('TERMINE')   },
              { value: 'ANNULE',     label: 'Annulés',    count: countBy('ANNULE')    },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterStatus(f.value)}
                className="px-4 py-2 text-sm font-bold transition-all rounded-lg"
                style={{
                  backgroundColor: filterStatus === f.value ? 'var(--primary)' : 'white',
                  color:           filterStatus === f.value ? 'white' : 'var(--dark)',
                  border: `2px solid ${filterStatus === f.value ? 'var(--primary)' : 'var(--gray-dark)'}`,
                }}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </Card>

        {/* Erreur */}
        {error && (
          <Card className="py-10 mb-8 text-center">
            <p className="mb-4 font-semibold" style={{ color: '#e74c3c' }}>⚠️ {error}</p>
            <Button onClick={fetchServices}>Réessayer</Button>
          </Card>
        )}

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full border-t-transparent animate-spin"
              style={{ borderColor: 'var(--primary)' }} />
          </div>
        ) : !error && filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map(service => {
              const statut = getStatut(service);
              return (
                <Card key={service.id} hover className="p-6">
                  <div className="flex flex-col gap-6 md:flex-row">

                    {/* Avatar */}
                    <div className="flex-shrink-0 w-full h-32 overflow-hidden md:w-32 rounded-xl"
                      style={{ backgroundColor: 'var(--gray)' }}>
                      {(() => {
                        const person = isArtisan ? service.client : service.artisan;
                        const photo  = person?.photo_profil ?? person?.photo ?? person?.image;
                        const nom    = person?.prenom ?? person?.name ?? '?';
                        return photo ? (
                          <img src={photo} alt={nom} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-3xl font-black text-white"
                            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
                            {nom.charAt(0).toUpperCase()}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Infos */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="mb-1 text-xl font-bold" style={{ color: 'var(--dark)' }}>
                            {service.titre ?? service.title ?? 'Demande de service'}
                          </h3>
                          <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                            {isArtisan
                              ? `${service.client?.prenom ?? ''} ${service.client?.nom ?? ''}`.trim() || service.client?.email
                              : `${service.artisan?.prenom ?? ''} ${service.artisan?.nom ?? ''}`.trim() || service.artisan?.email
                            }
                            {!isArtisan && service.artisan?.specialite ? ` — ${service.artisan.specialite}` : ''}
                          </p>
                          {service.description && (
                            <p className="mb-2 text-sm" style={{ color: 'var(--dark)', opacity: 0.7 }}>
                              {service.description}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(statut)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                        <div>
                          <div className="mb-1 text-xs" style={{ color: 'var(--dark)', opacity: 0.6 }}>Date demande</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                            {service.created_at ? new Date(service.created_at).toLocaleDateString('fr-FR') : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs" style={{ color: 'var(--dark)', opacity: 0.6 }}>Budget estimé</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                            {service.budget ? `${Number(service.budget).toLocaleString('fr-FR')} FCFA` : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs" style={{ color: 'var(--dark)', opacity: 0.6 }}>Urgence</div>
                          <div className="text-sm font-bold" style={{ color: service.urgent ? '#ef4444' : 'var(--dark)' }}>
                            {service.urgent ? 'Urgent' : 'Normal'}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs" style={{ color: 'var(--dark)', opacity: 0.6 }}>Référence</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--dark)' }}>#{service.id}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link to={`/service/${service.id}`}>
                          <Button variant="outline" className="!px-4 !py-2 !text-sm">
                            <Eye className="w-4 h-4" /> Détails
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
                          <Button variant="outline" className="!px-4 !py-2 !text-sm"
                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                            onClick={() => handleCancel(service.id)}>
                            Annuler
                          </Button>
                        )}

                        {isArtisan && statut === 'EN_ATTENTE' && (
                          <>
                            <Button variant="primary" className="!px-4 !py-2 !text-sm"
                              onClick={() => handleAccepter(service.id)}>
                              Accepter
                            </Button>
                            <Button variant="outline" className="!px-4 !py-2 !text-sm"
                              style={{ color: '#ef4444', borderColor: '#ef4444' }}
                              onClick={() => handleRefuser(service.id)}>
                              Refuser
                            </Button>
                          </>
                        )}

                        {isArtisan && statut === 'ACCEPTE' && (
                          <Button variant="secondary" className="!px-4 !py-2 !text-sm"
                            onClick={() => handleTerminer(service.id)}>
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
          <Card className="py-20 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
              style={{ backgroundColor: 'rgba(255,126,95,0.1)' }}>
              <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="mb-3 text-2xl font-bold" style={{ color: 'var(--dark)' }}>Aucune demande</h3>
            <p className="mb-6 text-sm" style={{ color: 'var(--dark)', opacity: 0.7 }}>
              {isArtisan
                ? 'Aucune demande de service reçue pour l\'instant.'
                : 'Vous n\'avez pas encore de demande de service.'}
            </p>
            {!isArtisan && (
              <Link to="/services/request"><Button>Faire une demande</Button></Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}