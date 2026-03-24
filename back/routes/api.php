<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\AtelierController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\HoraireController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OeuvreController;
use App\Http\Controllers\OffreController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceImmediatController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminAtelierController;
use App\Http\Controllers\Admin\AdminAvisController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminAuthController;


// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('register/client',  [AuthController::class, 'registerClient']);
    Route::post('register/artisan', [AuthController::class, 'registerArtisan']);
    Route::post('login',            [AuthController::class, 'login']);
    Route::post('forgot-password',   [PasswordController::class, 'forgotPassword']);
    Route::post('reset-password',    [PasswordController::class, 'resetPassword']);
});


// Ateliers & recherche (public)
Route::get('ateliers',                      [AtelierController::class, 'index']);
Route::get('ateliers/{id}',                 [AtelierController::class, 'show']);
Route::get('ateliers/{id}/offres',          [OffreController::class, 'index']);
Route::get('ateliers/{id}/avis',            [AvisController::class, 'index']);
Route::get('ateliers/{id}/horaires',        [HoraireController::class, 'indexPublic']);
Route::get('ateliers/{id}/disponibilite',   [HoraireController::class, 'verifierDisponibilite']);
Route::get('ateliers/{id}/oeuvres',         [OeuvreController::class, 'index']);
Route::get('oeuvres/{id}',                  [OeuvreController::class, 'show']);
Route::get('domaines',                      [AtelierController::class, 'domaines']);

// Routes protégées (auth:api)
Route::middleware('auth:sanctum', 'suspendu')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('me',          [AuthController::class, 'me']);
        Route::post('logout',     [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);
    });

    // Profil (tous les utilisateurs)
    Route::prefix('profil')->group(function () {
        Route::get('/',                     [ProfilController::class, 'show']);
        Route::post('/',                    [ProfilController::class, 'update']);
        Route::delete('/',                  [ProfilController::class, 'destroy']);
        Route::post('changer-mot-de-passe', [PasswordController::class, 'changerMotDePasse']);
    });

    // Notifications (tous les utilisateurs)
    Route::prefix('notifications')->group(function () {
        Route::get('/',                 [NotificationController::class, 'index']);
        Route::patch('lire-tout',       [NotificationController::class, 'marquerToutesLues']);
        Route::patch('{id}/lu',         [NotificationController::class, 'marquerLue']);
        Route::delete('{id}',           [NotificationController::class, 'destroy']);
    });


    Route::get('services-immediats/disponibles', [ServiceImmediatController::class, 'disponibles']);

    // ============================================================
    // ROUTES CLIENT UNIQUEMENT
    // ============================================================

    Route::middleware('role:CLIENT')->group(function () {

        // Rendez-vous
        Route::prefix('rendez-vous-client')->group(function () {
            Route::get('/',                  [RendezVousController::class, 'index']);
            Route::post('/',                 [RendezVousController::class, 'store']);
            Route::get('{id}',               [RendezVousController::class, 'show']);
            Route::patch('{id}/annuler',     [RendezVousController::class, 'annuler']);
        });

        // Services
        Route::prefix('services-client')->group(function () {
            Route::get('/',                  [ServiceController::class, 'index']);
            Route::post('/',                 [ServiceController::class, 'store']);
            Route::get('{id}',               [ServiceController::class, 'show']);
            Route::patch('{id}/annuler',     [ServiceController::class, 'annuler']);
        });

        // Services immédiats
        Route::prefix('services-immediats')->group(function () {
            Route::get('/',                  [ServiceImmediatController::class, 'index']);
            Route::post('/',                 [ServiceImmediatController::class, 'store']);
            Route::get('{id}',               [ServiceImmediatController::class, 'show']);
            Route::patch('{id}/annuler',     [ServiceImmediatController::class, 'annuler']);
        });

        // Avis
        Route::prefix('avis')->group(function () {
            Route::get('mes-avis',           [AvisController::class, 'mesAvis']);
            Route::post('/',                 [AvisController::class, 'store']);
            Route::put('{id}',               [AvisController::class, 'update']);
            Route::delete('{id}',            [AvisController::class, 'destroy']);
        });
    });

    // ============================================================
    // ROUTES ARTISAN UNIQUEMENT
    // ============================================================

    Route::middleware('role:ARTISAN')->group(function () {

        // Profil professionnel artisan
        Route::put('profil/artisan',         [ProfilController::class, 'updateArtisan']);

        // Atelier
        Route::prefix('mon-atelier')->group(function () {
            Route::get('/',                  [AtelierController::class, 'monAtelier']);
            Route::post('/',                 [AtelierController::class, 'store']);
            Route::post('update',            [AtelierController::class, 'update']);
            Route::post('galerie',           [AtelierController::class, 'ajouterImage']);
            Route::delete('galerie/{imgId}', [AtelierController::class, 'supprimerImage']);
        });

        // Horaires & disponibilités
        Route::prefix('horaires')->group(function () {
            Route::get('/',                  [HoraireController::class, 'index']);
            Route::put('/',                  [HoraireController::class, 'upsert']);
            Route::patch('{jour}/toggle',    [HoraireController::class, 'toggleJour']);
        });
        Route::prefix('indisponibilites')->group(function () {
            Route::get('/',                  [HoraireController::class, 'indisponibilites']);
            Route::post('/',                 [HoraireController::class, 'ajouterIndisponibilite']);
            Route::delete('{id}',            [HoraireController::class, 'supprimerIndisponibilite']);
        });

        // Offres
        Route::prefix('offres')->group(function () {
            Route::post('/',                 [OffreController::class, 'store']);
            Route::put('{id}',               [OffreController::class, 'update']);
            Route::delete('{id}',            [OffreController::class, 'destroy']);
        });

        // Oeuvres (galerie)
        Route::prefix('mes-oeuvres')->group(function () {
            Route::get('/',                  [OeuvreController::class, 'mesOeuvres']);
            Route::post('/',                 [OeuvreController::class, 'store']);
            Route::post('{id}',              [OeuvreController::class, 'update']);
            Route::delete('{id}',            [OeuvreController::class, 'destroy']);
            Route::patch('{id}/visibilite',  [OeuvreController::class, 'toggleVisibilite']);
        });

        // Rendez-vous reçus
        Route::prefix('rendez-vous-artisan')->group(function () {
            Route::get('/',                  [RendezVousController::class, 'indexArtisan']);
            Route::patch('{id}/accepter',    [RendezVousController::class, 'accepter']);
            Route::patch('{id}/refuser',     [RendezVousController::class, 'refuser']);
        });

        // Services reçus
        Route::prefix('services-artisan')->group(function () {
            Route::get('/',                  [ServiceController::class, 'indexArtisan']);
            Route::get('{id}',               [ServiceController::class, 'show']);
            Route::patch('{id}/accepter',    [ServiceController::class, 'accepter']);
            Route::patch('{id}/refuser',     [ServiceController::class, 'refuser']);
            Route::patch('{id}/terminer',    [ServiceController::class, 'terminer']);
        });

        // Services immédiats
        Route::prefix('services-immediats')->group(function () {
            Route::patch('{id}/accepter', [ServiceImmediatController::class, 'accepter']);
            Route::patch('{id}/terminer', [ServiceImmediatController::class, 'terminer']);
        });
    });
});

// ── Auth Admin (public) ───────────────────────────────────
Route::post('admin/login', [AdminAuthController::class, 'login']);

//ROUTES ADMIN UNIQUEMENT
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // ── Dashboard ─────────────────────────────────────────────
    Route::get('dashboard',                [AdminDashboardController::class, 'index']);
    Route::get('dashboard/inscriptions',   [AdminDashboardController::class, 'inscriptions']);
    Route::get('dashboard/services-evolution', [AdminDashboardController::class, 'servicesEvolution']);

    // ── Gestion des utilisateurs ──────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/',                    [AdminUserController::class, 'index']);
        Route::get('{id}',                 [AdminUserController::class, 'show']);
        Route::patch('{id}/suspendre',     [AdminUserController::class, 'suspendre']);
        Route::patch('{id}/reactiver',     [AdminUserController::class, 'reactiver']);
        Route::patch('{id}/role',          [AdminUserController::class, 'changerRole']);
        Route::delete('{id}',              [AdminUserController::class, 'destroy']);
    });

    // ── Gestion des ateliers ──────────────────────────────────
    Route::prefix('ateliers')->group(function () {
        Route::get('/',                    [AdminAtelierController::class, 'index']);
        Route::get('{id}',                 [AdminAtelierController::class, 'show']);
        Route::patch('{id}/suspendre',     [AdminAtelierController::class, 'suspendre']);
        Route::patch('{id}/reactiver',     [AdminAtelierController::class, 'reactiver']);
        Route::delete('{id}',              [AdminAtelierController::class, 'destroy']);
    });

    // ── Modération des avis ───────────────────────────────────
    Route::prefix('avis')->group(function () {
        Route::get('/',                    [AdminAvisController::class, 'index']);
        Route::delete('{id}',              [AdminAvisController::class, 'destroy']);
    });

    // ── Supervision services ──────────────────────────────────
    Route::get('services',                 [AdminServiceController::class, 'indexServices']);
    Route::delete('services/{id}',         [AdminServiceController::class, 'destroyService']);

    // ── Supervision rendez-vous ───────────────────────────────
    Route::get('rendez-vous',              [AdminServiceController::class, 'indexRendezVous']);
    Route::delete('rendez-vous/{id}',      [AdminServiceController::class, 'destroyRendezVous']);

    // ── Supervision services immédiats ────────────────────────
    Route::get('services-immediats',       [AdminServiceController::class, 'indexServicesImmediats']);

    // ── Notifications admin ───────────────────────────────────
    Route::post('notifications/envoyer',   [AdminNotificationController::class, 'envoyer']);
    Route::post('notifications/broadcast', [AdminNotificationController::class, 'broadcast']);
});