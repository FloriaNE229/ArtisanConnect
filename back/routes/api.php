<?php

use App\Http\Controllers\Admin\SanctionController;
use App\Http\Controllers\Admin\SignalementController;
use App\Http\Controllers\Admin\ArtisanController as AdminArtisanController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AtelierAdminController;
use App\Http\Controllers\Admin\OffreAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArtisanController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/test', function () {
	return response()->json(['message' => 'API fonctionne!'], 200);
});

// Routes artisans publiques (affichage seulement)
Route::get('/artisans', [ArtisanController::class, 'index']);
Route::get('/artisans/{id}', [ArtisanController::class, 'show']);

// Routes protégées ADMIN
Route::middleware(['auth:api', 'role:ADMIN'])->prefix('admin')->group(function () {
	// Sanctions
	Route::get('/sanctions', [SanctionController::class, 'index']);
	Route::post('/sanctions', [SanctionController::class, 'store']);
	Route::get('/sanctions/{id}', [SanctionController::class, 'show']);
	Route::put('/sanctions/{id}', [SanctionController::class, 'update']);
	Route::delete('/sanctions/{id}', [SanctionController::class, 'destroy']);

	// Signalements
	Route::get('/signalements', [SignalementController::class, 'index']);
	Route::get('/signalements/{id}', [SignalementController::class, 'show']);
	Route::put('/signalements/{id}/resolve', [SignalementController::class, 'resolve']);

	// Gestion des artisans
	Route::get('/artisans-manage', [AdminArtisanController::class, 'index']);
	Route::get('/artisans-manage/{id}', [AdminArtisanController::class, 'show']);
	Route::put('/artisans-manage/{id}/approve', [AdminArtisanController::class, 'approve']);
	Route::put('/artisans-manage/{id}/reject', [AdminArtisanController::class, 'reject']);

	// Gestion des ateliers
	Route::get('/ateliers/pending', [AtelierAdminController::class, 'pending']);
	Route::get('/ateliers', [AtelierAdminController::class, 'all']);
	Route::put('/ateliers/{id}/approve', [AtelierAdminController::class, 'approve']);
	Route::put('/ateliers/{id}/reject', [AtelierAdminController::class, 'reject']);

	// Gestion des offres
	Route::get('/offres/pending', [OffreAdminController::class, 'pending']);
	Route::get('/offres', [OffreAdminController::class, 'all']);
	Route::put('/offres/{id}/approve', [OffreAdminController::class, 'approve']);
	Route::put('/offres/{id}/reject', [OffreAdminController::class, 'reject']);

	// Utilisateurs
	Route::get('/users', [UserController::class, 'index']);
	Route::get('/users/{id}', [UserController::class, 'show']);
	Route::put('/users/{id}', [UserController::class, 'update']);
	Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

