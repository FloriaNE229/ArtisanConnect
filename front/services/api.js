// ============================================================
//  DIGITAL ART — API ENDPOINTS
//  Base URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Helpers ────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

async function http(method, path, data = null, isFormData = false) {
  const headers = {};
  const token = getToken();

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  headers["Accept"] = "application/json";

  const config = {
    method,
    headers,
    body: data
      ? isFormData
        ? data
        : JSON.stringify(data)
      : undefined,
  };

  const res = await fetch(`${BASE_URL}${path}`, config);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Crée une vraie Error pour que catch(err) fonctionne correctement
    const err = new Error(json.message || `Erreur ${res.status}`);
    err.status = res.status;
    err.errors = json.errors || null;   // erreurs de validation Laravel (422)
    throw err;
  }
  return json;

}

const get    = (path)         => http("GET",    path);
const post   = (path, data, f) => http("POST",   path, data, f);
const put    = (path, data)   => http("PUT",    path, data);
const patch  = (path, data)   => http("PATCH",  path, data);
const del    = (path)         => http("DELETE", path);


// ============================================================
// 🔓 AUTH
// ============================================================

export const authAPI = {
  /** Inscription client */
  registerClient: (data) => post("/auth/register/client", data),

  /** Inscription artisan */
  registerArtisan: (data) => post("/auth/register/artisan", data),

  /** Connexion */
  login: (data) => post("/auth/login", data),

  /** Utilisateur connecté */
  me: () => get("/auth/me"),

  /** Déconnexion (token actuel) */
  logout: () => post("/auth/logout"),

  /** Déconnexion tous les appareils */
  logoutAll: () => post("/auth/logout-all"),
};


// ============================================================
// 🔑 MOT DE PASSE
// ============================================================

export const passwordAPI = {
  /** Mot de passe oublié */
  forgotPassword: (data) => post("/auth/forgot-password", data),

  /** Réinitialiser le mot de passe */
  resetPassword: (data) => post("/auth/reset-password", data),

  /** Changer le mot de passe (connecté) */
  changerMotDePasse: (data) => post("/profil/changer-mot-de-passe", data),
};


// ============================================================
// 👤 PROFIL
// ============================================================

export const profilAPI = {
  /** Voir son profil */
  show: () => get("/profil"),

  /** Mettre à jour son profil (FormData si photo) */
  update: (data, isFormData = false) => post("/profil", data, isFormData),

  /** Supprimer son compte */
  destroy: () => del("/profil"),

  /** Mettre à jour le profil artisan */
  updateArtisan: (data) => put("/profil/artisan", data),
};


// ============================================================
// 🔔 NOTIFICATIONS
// ============================================================

export const notificationAPI = {
  /** Liste des notifications */
  index: () => get("/notifications"),

  /** Marquer toutes comme lues */
  marquerToutesLues: () => patch("/notifications/lire-tout"),

  /** Marquer une notification comme lue */
  marquerLue: (id) => patch(`/notifications/${id}/lu`),

  /** Supprimer une notification */
  destroy: (id) => del(`/notifications/${id}`),
};


// ============================================================
// 🏛️  ATELIERS  (public + artisan)
// ============================================================

export const atelierAPI = {
  // ── Public ──────────────────────────────────────────────
  /** Liste des ateliers */
  index: () => get("/ateliers"),

  /** Détail d'un atelier */
  show: (id) => get(`/ateliers/${id}`),

  /** Disponibilité d'un atelier */
  disponibilite: (id) => get(`/ateliers/${id}/disponibilite`),

  /** Domaines / catégories disponibles */
  domaines: () => get("/domaines"),

  // ── Artisan ─────────────────────────────────────────────
  /** Mon atelier */
  monAtelier: () => get("/mon-atelier"),

  /** Créer mon atelier (FormData) */
  store: (data) => post("/mon-atelier", data, true),

  /** Mettre à jour mon atelier (FormData) */
  update: (data) => post("/mon-atelier/update", data, true),

  /** Ajouter une image à la galerie (FormData) */
  ajouterImage: (data) => post("/mon-atelier/galerie", data, true),

  /** Supprimer une image de la galerie */
  supprimerImage: (imgId) => del(`/mon-atelier/galerie/${imgId}`),
};


// ============================================================
// ⏰ HORAIRES & DISPONIBILITÉS  (artisan)
// ============================================================

export const horaireAPI = {
  // ── Public ──────────────────────────────────────────────
  /** Horaires publics d'un atelier */
  indexPublic: (atelierId) => get(`/ateliers/${atelierId}/horaires`),

  /** Vérifier la disponibilité d'un atelier */
  verifierDisponibilite: (atelierId) => get(`/ateliers/${atelierId}/disponibilite`),

  // ── Artisan ─────────────────────────────────────────────
  /** Mes horaires */
  index: () => get("/horaires"),

  /** Créer / mettre à jour les horaires */
  upsert: (data) => put("/horaires", data),

  /** Activer / désactiver un jour */
  toggleJour: (jour) => patch(`/horaires/${jour}/toggle`),

  /** Liste de mes indisponibilités */
  indisponibilites: () => get("/indisponibilites"),

  /** Ajouter une indisponibilité */
  ajouterIndisponibilite: (data) => post("/indisponibilites", data),

  /** Supprimer une indisponibilité */
  supprimerIndisponibilite: (id) => del(`/indisponibilites/${id}`),
};


// ============================================================
// 🎁 OFFRES
// ============================================================

export const offreAPI = {
  /** Offres d'un atelier (public) */
  index: (atelierId) => get(`/ateliers/${atelierId}/offres`),

  // ── Artisan ─────────────────────────────────────────────
  /** Créer une offre */
  store: (data) => post("/offres", data),

  /** Modifier une offre */
  update: (id, data) => put(`/offres/${id}`, data),

  /** Supprimer une offre */
  destroy: (id) => del(`/offres/${id}`),
};


// ============================================================
// 🖼️  ŒUVRES
// ============================================================

export const oeuvreAPI = {
  // ── Public ──────────────────────────────────────────────
  /** Œuvres d'un atelier */
  index: (atelierId) => get(`/ateliers/${atelierId}/oeuvres`),

  /** Détail d'une œuvre */
  show: (id) => get(`/oeuvres/${id}`),

  // ── Artisan ─────────────────────────────────────────────
  /** Mes œuvres */
  mesOeuvres: () => get("/mes-oeuvres"),

  /** Créer une œuvre (FormData) */
  store: (data) => post("/mes-oeuvres", data, true),

  /** Modifier une œuvre (FormData) */
  update: (id, data) => post(`/mes-oeuvres/${id}`, data, true),

  /** Supprimer une œuvre */
  destroy: (id) => del(`/mes-oeuvres/${id}`),

  /** Basculer la visibilité */
  toggleVisibilite: (id) => patch(`/mes-oeuvres/${id}/visibilite`),
};


// ============================================================
// ⭐ AVIS
// ============================================================

export const avisAPI = {
  // ── Public ──────────────────────────────────────────────
  /** Avis d'un atelier */
  index: (atelierId) => get(`/ateliers/${atelierId}/avis`),

  // ── Client ──────────────────────────────────────────────
  /** Mes avis */
  mesAvis: () => get("/avis/mes-avis"),

  /** Laisser un avis */
  store: (data) => post("/avis", data),

  /** Modifier un avis */
  update: (id, data) => put(`/avis/${id}`, data),

  /** Supprimer un avis */
  destroy: (id) => del(`/avis/${id}`),
};


// ============================================================
// 📅 RENDEZ-VOUS
// ============================================================

export const rendezVousAPI = {
  // ── Client ──────────────────────────────────────────────
  /** Mes rendez-vous */
  index: () => get("/rendez-vous"),

  /** Prendre un rendez-vous */
  store: (data) => post("/rendez-vous", data),

  /** Détail d'un rendez-vous */
  show: (id) => get(`/rendez-vous/${id}`),

  /** Annuler un rendez-vous */
  annuler: (id) => patch(`/rendez-vous/${id}/annuler`),

  // ── Artisan ─────────────────────────────────────────────
  /** Rendez-vous reçus */
  indexArtisan: () => get("/rendez-vous"),

  /** Accepter un rendez-vous */
  accepter: (id) => patch(`/rendez-vous/${id}/accepter`),

  /** Refuser un rendez-vous */
  refuser: (id) => patch(`/rendez-vous/${id}/refuser`),
};


// ============================================================
// 🛠️  SERVICES
// ============================================================

export const serviceAPI = {
  // ── Client ──────────────────────────────────────────────
  /** Mes services */
  index: () => get("/services"),

  /** Commander un service */
  store: (data) => post("/services", data),

  /** Détail d'un service */
  show: (id) => get(`/services/${id}`),

  /** Annuler un service */
  annuler: (id) => patch(`/services/${id}/annuler`),

  // ── Artisan ─────────────────────────────────────────────
  /** Services reçus */
  indexArtisan: () => get("/services"),

  /** Accepter un service */
  accepter: (id) => patch(`/services/${id}/accepter`),

  /** Refuser un service */
  refuser: (id) => patch(`/services/${id}/refuser`),

  /** Terminer un service */
  terminer: (id) => patch(`/services/${id}/terminer`),
};


// ============================================================
// ⚡ SERVICES IMMÉDIATS
// ============================================================

export const serviceImmediatAPI = {
  // ── Public / connecté ───────────────────────────────────
  /** Artisans disponibles en ce moment */
  disponibles: () => get("/services-immediats/disponibles"),

  // ── Client ──────────────────────────────────────────────
  /** Mes services immédiats */
  index: () => get("/services-immediats"),

  /** Demander un service immédiat */
  store: (data) => post("/services-immediats", data),

  /** Détail d'un service immédiat */
  show: (id) => get(`/services-immediats/${id}`),

  /** Annuler un service immédiat */
  annuler: (id) => patch(`/services-immediats/${id}/annuler`),

  // ── Artisan ─────────────────────────────────────────────
  /** Accepter un service immédiat */
  accepter: (id) => patch(`/services-immediats/${id}/accepter`),

  /** Terminer un service immédiat */
  terminer: (id) => patch(`/services-immediats/${id}/terminer`),
};


// ============================================================
// 🛡️  ADMIN
// ============================================================

export const adminAPI = {

  // ── Dashboard ─────────────────────────────────────────
  dashboard: {
    index: () => get("/admin/dashboard"),
    inscriptions: () => get("/admin/dashboard/inscriptions"),
    servicesEvolution: () => get("/admin/dashboard/services-evolution"),
  },

  // ── Utilisateurs ──────────────────────────────────────
  users: {
    index: () => get("/admin/users"),
    show: (id) => get(`/admin/users/${id}`),
    suspendre: (id) => patch(`/admin/users/${id}/suspendre`),
    reactiver: (id) => patch(`/admin/users/${id}/reactiver`),
    changerRole: (id, data) => patch(`/admin/users/${id}/role`, data),
    destroy: (id) => del(`/admin/users/${id}`),
  },

  // ── Ateliers ──────────────────────────────────────────
  ateliers: {
    index: () => get("/admin/ateliers"),
    show: (id) => get(`/admin/ateliers/${id}`),
    suspendre: (id) => patch(`/admin/ateliers/${id}/suspendre`),
    reactiver: (id) => patch(`/admin/ateliers/${id}/reactiver`),
    destroy: (id) => del(`/admin/ateliers/${id}`),
  },

  // ── Avis ──────────────────────────────────────────────
  avis: {
    index: () => get("/admin/avis"),
    destroy: (id) => del(`/admin/avis/${id}`),
  },

  // ── Services ──────────────────────────────────────────
  services: {
    index: () => get("/admin/services"),
    destroy: (id) => del(`/admin/services/${id}`),
  },

  // ── Rendez-vous ───────────────────────────────────────
  rendezVous: {
    index: () => get("/admin/rendez-vous"),
    destroy: (id) => del(`/admin/rendez-vous/${id}`),
  },

  // ── Services immédiats ────────────────────────────────
  servicesImmediats: {
    index: () => get("/admin/services-immediats"),
  },

  // ── Notifications ─────────────────────────────────────
  notifications: {
    envoyer: (data) => post("/admin/notifications/envoyer", data),
    broadcast: (data) => post("/admin/notifications/broadcast", data),
  },
};