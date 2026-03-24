import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Store,
  Star,
  Calendar,
  TrendingUp,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { adminAPI } from '../../../services/api'; 

// ─── Composant carte statistique ────────────────────────────
const StatCard = ({ icon, title, value, color, bgColor, trend }) => {
  const Icon = icon;
  return (
    <div className="p-6 transition-all shadow-md rounded-xl hover:shadow-lg"
      style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium" style={{ color: '#6c757d' }}>
            {title}
          </p>
          <h3 className="text-3xl font-bold" style={{ color: '#2b2d42' }}>
            {(value ?? 0).toLocaleString()}
          </h3>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                +{trend}%
              </span>
              <span className="text-xs" style={{ color: '#6c757d' }}>
                ce mois
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

// ─── Composant ligne d'activité récente ─────────────────────
const ActivityRow = ({ label, date, badge, badgeColor }) => (
  <div className="flex items-center justify-between py-3"
    style={{ borderBottom: '1px solid #f1f3f5' }}>
    <div>
      <p className="text-sm font-medium" style={{ color: '#2b2d42' }}>{label}</p>
      <p className="text-xs" style={{ color: '#adb5bd' }}>{date}</p>
    </div>
    {badge && (
      <span className="px-2 py-1 text-xs font-semibold rounded-full"
        style={{ backgroundColor: badgeColor + '22', color: badgeColor }}>
        {badge}
      </span>
    )}
  </div>
);

// ─── Composant barre de service populaire ───────────────────
const ServiceBar = ({ label, count, max, color }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <span className="text-sm" style={{ color: '#2b2d42' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>{count}</span>
    </div>
    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#e9ecef' }}>
      <div className="h-2 rounded-full transition-all"
        style={{ width: `${(count / max) * 100}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ─── Skeleton loader ────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

// ============================================================
// 🏠 ADMIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const [stats, setStats]               = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [evolution, setEvolution]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [refreshing, setRefreshing]     = useState(false);

  // ── Chargement des données ────────────────────────────────
  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // Appels parallèles vers les 3 endpoints admin dashboard
      const [dashData, inscData, evolData] = await Promise.all([
        adminAPI.dashboard.index(),
        adminAPI.dashboard.inscriptions().catch(() => []),
        adminAPI.dashboard.servicesEvolution().catch(() => []),
      ]);

      setStats(dashData);
      setInscriptions(Array.isArray(inscData) ? inscData : inscData?.data ?? []);
      setEvolution(Array.isArray(evolData) ? evolData : evolData?.data ?? []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Calcul du max pour les barres ────────────────────────
  const maxEvol = evolution.length
    ? Math.max(...evolution.map(e => e.count ?? e.total ?? 0))
    : 1;

  const barColors = ['#4a6fa5', '#ff7e5f', '#22c55e', '#f59e0b', '#a855f7'];

  // ── État de chargement ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // ── État d'erreur ─────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ backgroundColor: '#f8f9fa' }}>
        <div className="flex items-center gap-2 p-4 text-red-600 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => fetchAll()}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4a6fa5' }}>
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );
  }

  // ── Rendu principal ───────────────────────────────────────
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="mx-auto max-w-7xl">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-1 text-3xl font-bold" style={{ color: '#2b2d42' }}>
              Tableau de bord
            </h1>
            <p className="text-sm" style={{ color: '#6c757d' }}>
              Vue d'ensemble de la plateforme ArtisanConnect
            </p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef', color: '#2b2d42' }}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Alerte artisans en attente */}
        {(stats?.artisans_en_attente ?? 0) > 0 && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ffc107' }} />
            <p className="text-sm font-medium" style={{ color: '#2b2d42' }}>
              {stats.artisans_en_attente} artisan{stats.artisans_en_attente > 1 ? 's' : ''} en attente de vérification
            </p>
          </div>
        )}

        {/* Statistiques principales — 4 cartes */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            title="Total Clients"
            value={stats?.total_clients}
            color="#4a6fa5"
            bgColor="rgba(74, 111, 165, 0.1)"
          />
          <StatCard
            icon={Briefcase}
            title="Total Artisans"
            value={stats?.total_artisans}
            color="#ff7e5f"
            bgColor="rgba(255, 126, 95, 0.1)"
          />
          <StatCard
            icon={Store}
            title="Ateliers Actifs"
            value={stats?.total_ateliers}
            color="#22c55e"
            bgColor="rgba(34, 197, 94, 0.1)"
          />
          <StatCard
            icon={Star}
            title="Total Avis"
            value={stats?.total_avis}
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.1)"
          />
        </div>

        {/* Statistiques secondaires — 3 cartes */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5" style={{ color: '#ffc107' }} />
              <h3 className="font-semibold" style={{ color: '#2b2d42' }}>
                Vérifications en attente
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#2b2d42' }}>
              {stats?.artisans_en_attente ?? 0}
            </p>
          </div>

          <div className="p-6 shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5" style={{ color: '#4a6fa5' }} />
              <h3 className="font-semibold" style={{ color: '#2b2d42' }}>
                Services en cours
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#2b2d42' }}>
              {stats?.services_en_cours ?? 0}
            </p>
          </div>

          <div className="p-6 shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5" style={{ color: '#22c55e' }} />
              <h3 className="font-semibold" style={{ color: '#2b2d42' }}>
                RDV aujourd'hui
              </h3>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#2b2d42' }}>
              {stats?.rdv_aujourd_hui ?? 0}
            </p>
          </div>
        </div>

        {/* Sections activité récente + services populaires */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Activité récente (inscriptions) */}
          <div className="p-6 shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5" style={{ color: '#4a6fa5' }} />
              <h3 className="text-lg font-bold" style={{ color: '#2b2d42' }}>
                Inscriptions récentes
              </h3>
            </div>

            {inscriptions.length === 0 ? (
              <p className="text-sm" style={{ color: '#adb5bd' }}>
                Aucune inscription récente.
              </p>
            ) : (
              inscriptions.slice(0, 6).map((item, i) => (
                <ActivityRow
                  key={i}
                  label={item.name || item.label || item.email || `Utilisateur #${item.id}`}
                  date={
                    item.created_at
                      ? new Date(item.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : item.date ?? '—'
                  }
                  badge={item.role ?? item.type ?? null}
                  badgeColor={
                    item.role === 'artisan' ? '#ff7e5f'
                    : item.role === 'client' ? '#4a6fa5'
                    : '#22c55e'
                  }
                />
              ))
            )}
          </div>

          {/* Services populaires (évolution) */}
          <div className="p-6 shadow-md rounded-xl"
            style={{ backgroundColor: 'white', border: '1px solid #e9ecef' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: '#ff7e5f' }} />
              <h3 className="text-lg font-bold" style={{ color: '#2b2d42' }}>
                Évolution des services
              </h3>
            </div>

            {evolution.length === 0 ? (
              <p className="text-sm" style={{ color: '#adb5bd' }}>
                Aucune donnée d'évolution disponible.
              </p>
            ) : (
              evolution.slice(0, 6).map((item, i) => (
                <ServiceBar
                  key={i}
                  label={item.label || item.mois || item.month || item.name || `Période ${i + 1}`}
                  count={item.count ?? item.total ?? 0}
                  max={maxEvol}
                  color={barColors[i % barColors.length]}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}