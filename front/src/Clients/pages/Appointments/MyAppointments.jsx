import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { rendezVousAPI, authAPI } from "../../../../services/api";
import Card   from "../../components/Common/Card";
import Button from "../../components/Common/Button";

// Helper statut compatible FR/EN
const getStatut = (r) => r.statut ?? r.status ?? "EN_ATTENTE";

const STATUS_STYLES = {
  EN_ATTENTE: { bg: "rgba(251,146,60,0.1)",  color: "#fb923c",        Icon: Clock,        label: "En attente" },
  ACCEPTE:    { bg: "rgba(74,111,165,0.1)",  color: "var(--primary)", Icon: CheckCircle,  label: "Confirmé"   },
  REFUSE:     { bg: "rgba(239,68,68,0.1)",   color: "#ef4444",        Icon: XCircle,      label: "Refusé"     },
  ANNULE:     { bg: "rgba(107,114,128,0.1)", color: "#6b7280",        Icon: XCircle,      label: "Annulé"     },
};

function StatusBadge({ statut }) {
  const s = STATUS_STYLES[statut] ?? STATUS_STYLES.EN_ATTENTE;
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <s.Icon className="w-3 h-3" />{s.label}
    </div>
  );
}

export default function MyAppointments() {
  const [userRole,    setUserRole]    = useState(null);
  const [rdvs,        setRdvs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filterStatut,setFilterStatut]= useState("all");
  const [pagination,  setPagination]  = useState({ current_page: 1, last_page: 1 });

  // ── Récupérer le rôle ─────────────────────────────────────
  useEffect(() => {
    authAPI.me()
      .then(data => setUserRole(data.user?.role ?? data.role))
      .catch(err => setError(err.message || "Impossible de récupérer le profil"));
  }, []);

  // ── Récupérer les rendez-vous ─────────────────────────────
  const fetchRdvs = async (page = 1) => {
    if (!userRole) return;
    setLoading(true);
    setError(null);
    try {
      const data = userRole === "CLIENT"
        ? await rendezVousAPI.index()
        : await rendezVousAPI.indexArtisan();

      // Compatible réponse paginée ou simple liste
      const raw = data.rendez_vous ?? data.data ?? data ?? [];
      if (raw?.data) {
        setRdvs(raw.data);
        setPagination({ current_page: raw.current_page, last_page: raw.last_page });
      } else {
        setRdvs(Array.isArray(raw) ? raw : []);
        setPagination({ current_page: 1, last_page: 1 });
      }
    } catch (err) {
      setError(err.message || "Impossible de récupérer les rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRdvs(); }, [userRole]);

  // ── Actions ───────────────────────────────────────────────
  const handleAnnuler = async (id) => {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    try {
      await rendezVousAPI.annuler(id);
      setRdvs(prev => prev.map(r => r.id === id ? { ...r, statut: "ANNULE" } : r));
    } catch (err) { alert(err.message || "Erreur lors de l'annulation"); }
  };

  const handleAccepter = async (id) => {
    try {
      const res = await rendezVousAPI.accepter(id);
      const updated = res.rendez_vous ?? res;
      setRdvs(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) { alert(err.message || "Erreur lors de l'acceptation"); }
  };

  const handleRefuser = async (id) => {
    if (!window.confirm("Refuser ce rendez-vous ?")) return;
    try {
      const res = await rendezVousAPI.refuser(id);
      const updated = res.rendez_vous ?? res;
      setRdvs(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    } catch (err) { alert(err.message || "Erreur lors du refus"); }
  };

  // ── Filtres ───────────────────────────────────────────────
  const countBy = (val) => rdvs.filter(r => getStatut(r) === val).length;
  const filtered = filterStatut === "all" ? rdvs : rdvs.filter(r => getStatut(r) === filterStatut);

  const now      = new Date();
  const upcoming = filtered.filter(r => new Date(r.date_rdv ?? r.date_heure) >= now);
  const past     = filtered.filter(r => new Date(r.date_rdv ?? r.date_heure) < now);

  const formatDate = (rdv) => {
    const d = new Date(rdv.date_rdv ?? rdv.date_heure);
    return isNaN(d) ? "—" : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatTime = (rdv) => {
    const d = new Date(rdv.date_rdv ?? rdv.date_heure);
    return isNaN(d) ? "—" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  // ── Nom affiché selon le rôle ─────────────────────────────
  const getDisplayName = (rdv) => {
    if (userRole === "CLIENT") {
      return (rdv.atelier?.nom ?? `${rdv.artisan?.prenom ?? ""} ${rdv.artisan?.nom ?? ""}`.trim()) || "Artisan";
    }
    return `${rdv.client?.prenom ?? ""} ${rdv.client?.nom ?? ""}`.trim() || rdv.client?.email || "Client";
  };

  const getAvatar = (rdv) => {
    if (userRole === "CLIENT") return rdv.atelier?.image_url ?? rdv.artisan?.photo_profil ?? null;
    return rdv.client?.photo_profil ?? null;
  };

  const getInitiale = (rdv) => getDisplayName(rdv).charAt(0).toUpperCase();

  // ── Carte rendez-vous ─────────────────────────────────────
  const RdvCard = ({ rdv, dimmed = false }) => {
    const statut = getStatut(rdv);
    return (
      <Card hover className={`p-6 ${dimmed ? "opacity-70" : ""}`}>
        <div className="flex flex-col gap-6 md:flex-row">

          {/* Avatar / Image */}
          <div className="flex-shrink-0 w-full overflow-hidden md:w-28 h-28 rounded-xl"
            style={{ backgroundColor: "var(--gray)" }}>
            {getAvatar(rdv) ? (
              <img src={getAvatar(rdv)} alt={getDisplayName(rdv)}
                className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-3xl font-black text-white"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))" }}>
                {getInitiale(rdv)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="mb-1 text-xl font-bold" style={{ color: "var(--dark)" }}>
                  {getDisplayName(rdv)}
                </h3>
                {userRole === "CLIENT" && rdv.atelier?.domaine && (
                  <p className="mb-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    {rdv.atelier.domaine}
                  </p>
                )}
                {rdv.description ?? rdv.motif ? (
                  <p className="text-sm" style={{ color: "var(--dark)", opacity: 0.7 }}>
                    {rdv.description ?? rdv.motif}
                  </p>
                ) : null}
              </div>
              <StatusBadge statut={statut} />
            </div>

            {/* Infos date / durée / lieu */}
            <div className="grid grid-cols-2 gap-3 p-4 mb-4 md:grid-cols-3 rounded-xl"
              style={{ backgroundColor: "var(--gray)" }}>
              <div className="flex items-center gap-2">
                <Calendar className="flex-shrink-0 w-4 h-4" style={{ color: "var(--primary)" }} />
                <div>
                  <div className="text-xs" style={{ color: "var(--dark)", opacity: 0.6 }}>Date</div>
                  <div className="text-sm font-bold" style={{ color: "var(--dark)" }}>{formatDate(rdv)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="flex-shrink-0 w-4 h-4" style={{ color: "var(--primary)" }} />
                <div>
                  <div className="text-xs" style={{ color: "var(--dark)", opacity: 0.6 }}>Heure</div>
                  <div className="text-sm font-bold" style={{ color: "var(--dark)" }}>{formatTime(rdv)}</div>
                </div>
              </div>
              {rdv.duree_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="flex-shrink-0 w-4 h-4" style={{ color: "var(--accent)" }} />
                  <div>
                    <div className="text-xs" style={{ color: "var(--dark)", opacity: 0.6 }}>Durée</div>
                    <div className="text-sm font-bold" style={{ color: "var(--dark)" }}>{rdv.duree_minutes} min</div>
                  </div>
                </div>
              )}
              {rdv.adresse && (
                <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                  <MapPin className="flex-shrink-0 w-4 h-4" style={{ color: "var(--primary)" }} />
                  <div>
                    <div className="text-xs" style={{ color: "var(--dark)", opacity: 0.6 }}>Lieu</div>
                    <div className="text-sm font-bold" style={{ color: "var(--dark)" }}>{rdv.adresse}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">

              {/* CLIENT — annuler si en attente */}
              {userRole === "CLIENT" && statut === "EN_ATTENTE" && (
                <Button variant="outline" className="!px-4 !py-2 !text-sm"
                  style={{ color: "#ef4444", borderColor: "#ef4444" }}
                  onClick={() => handleAnnuler(rdv.id)}>
                  Annuler
                </Button>
              )}

              {/* CLIENT — laisser un avis si passé et accepté */}
              {userRole === "CLIENT" && statut === "ACCEPTE" && !dimmed === false && (
                <Link to={`/reviews/write/${rdv.atelier?.id ?? rdv.atelier_id}`}>
                  <Button variant="secondary" className="!px-4 !py-2 !text-sm">
                    Laisser un avis
                  </Button>
                </Link>
              )}

              {/* ARTISAN — accepter / refuser */}
              {userRole === "ARTISAN" && statut === "EN_ATTENTE" && (
                <>
                  <Button variant="primary" className="!px-4 !py-2 !text-sm"
                    onClick={() => handleAccepter(rdv.id)}>
                    Accepter
                  </Button>
                  <Button variant="outline" className="!px-4 !py-2 !text-sm"
                    style={{ color: "#ef4444", borderColor: "#ef4444" }}
                    onClick={() => handleRefuser(rdv.id)}>
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // ── Pagination ────────────────────────────────────────────
  const goToPage = (page) => {
    if (page < 1 || page > pagination.last_page) return;
    fetchRdvs(page);
  };

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: "var(--light)" }}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full"
            style={{ backgroundColor: "rgba(74,111,165,0.1)", color: "var(--primary)" }}>
            <Calendar className="w-4 h-4" />
            {rdvs.length} rendez-vous
          </div>

          <h1 className="mb-4 text-4xl font-black md:text-5xl" style={{ color: "var(--dark)" }}>
            Mes
            <span className="text-transparent bg-clip-text"
              style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {" "}rendez-vous
            </span>
          </h1>

          <p className="mb-6 text-lg" style={{ color: "var(--dark)", opacity: 0.7 }}>
            {userRole === "ARTISAN"
              ? "Gérez les rendez-vous de vos clients"
              : "Suivez et gérez vos rendez-vous avec les artisans"}
          </p>

          {userRole === "CLIENT" && (
            <Link to="/appointments/book">
              <Button variant="primary">
                <Calendar className="w-4 h-4" /> Prendre un rendez-vous
              </Button>
            </Link>
          )}
        </div>

        {/* ── Filtres ── */}
        <Card className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all",        label: "Tous",       count: rdvs.length          },
              { value: "EN_ATTENTE", label: "En attente", count: countBy("EN_ATTENTE") },
              { value: "ACCEPTE",    label: "Confirmés",  count: countBy("ACCEPTE")   },
              { value: "REFUSE",     label: "Refusés",    count: countBy("REFUSE")    },
              { value: "ANNULE",     label: "Annulés",    count: countBy("ANNULE")    },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterStatut(f.value)}
                className="px-4 py-2 text-sm font-bold transition-all rounded-lg"
                style={{
                  backgroundColor: filterStatut === f.value ? "var(--primary)" : "white",
                  color:           filterStatut === f.value ? "white" : "var(--dark)",
                  border: `2px solid ${filterStatut === f.value ? "var(--primary)" : "var(--gray-dark)"}`,
                }}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </Card>

        {/* ── États ── */}
        {error && (
          <Card className="py-10 mb-8 text-center">
            <p className="mb-4 font-semibold" style={{ color: "#e74c3c" }}>⚠️ {error}</p>
            <Button onClick={() => fetchRdvs()}>Réessayer</Button>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full border-t-transparent animate-spin"
              style={{ borderColor: "var(--primary)" }} />
          </div>
        ) : !error && filtered.length === 0 ? (
          <Card className="py-20 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
              style={{ backgroundColor: "rgba(74,111,165,0.1)" }}>
              <AlertCircle className="w-10 h-10" style={{ color: "var(--primary)" }} />
            </div>
            <h3 className="mb-3 text-2xl font-bold" style={{ color: "var(--dark)" }}>Aucun rendez-vous</h3>
            <p className="mb-6 text-sm" style={{ color: "var(--dark)", opacity: 0.7 }}>
              {userRole === "ARTISAN"
                ? "Aucun rendez-vous reçu pour l'instant."
                : "Vous n'avez pas encore de rendez-vous planifié."}
            </p>
            {userRole === "CLIENT" && (
              <Link to="/appointments/book"><Button>Prendre un rendez-vous</Button></Link>
            )}
          </Card>
        ) : (
          <div className="space-y-8">

            {/* À venir */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold" style={{ color: "var(--dark)" }}>
                  <Calendar className="w-6 h-6" style={{ color: "var(--primary)" }} />
                  À venir <span className="text-lg font-semibold" style={{ color: "var(--primary)" }}>({upcoming.length})</span>
                </h2>
                <div className="space-y-4">
                  {upcoming.map(rdv => <RdvCard key={rdv.id} rdv={rdv} />)}
                </div>
              </div>
            )}

            {/* Passés */}
            {past.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold"
                  style={{ color: "var(--dark)", opacity: 0.6 }}>
                  <Clock className="w-6 h-6" />
                  Passés <span className="text-lg font-semibold">({past.length})</span>
                </h2>
                <div className="space-y-4">
                  {past.map(rdv => <RdvCard key={rdv.id} rdv={rdv} dimmed />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={pagination.current_page === 1}
              onClick={() => goToPage(pagination.current_page - 1)}
              className="flex items-center justify-center w-10 h-10 font-bold border-2 rounded-xl disabled:opacity-40"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => goToPage(page)}
                className="flex items-center justify-center w-10 h-10 text-sm font-bold border-2 rounded-xl transition-all"
                style={{
                  backgroundColor: page === pagination.current_page ? "var(--primary)" : "white",
                  color:           page === pagination.current_page ? "white" : "var(--dark)",
                  borderColor:     page === pagination.current_page ? "var(--primary)" : "var(--gray-dark)",
                }}>
                {page}
              </button>
            ))}

            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => goToPage(pagination.current_page + 1)}
              className="flex items-center justify-center w-10 h-10 font-bold border-2 rounded-xl disabled:opacity-40"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}