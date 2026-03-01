<?php

namespace App\Http\Controllers;

use App\Models\Horaire;
use App\Models\Indisponibilite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class HoraireController extends Controller
{
    /**
     * Récupérer tous les horaires de l'artisan connecté.
     * GET /api/horaires
     */
    public function index(Request $request): JsonResponse
    {
        $artisan  = $request->user()->artisan;
        $horaires = $artisan->horaires()->orderBy('jour_semaine')->get();

        return response()->json(['horaires' => $horaires]);
    }

    /**
     * Récupérer les horaires d'un atelier (public).
     * GET /api/ateliers/{id}/horaires
     */
    public function indexPublic(int $atelierId): JsonResponse
    {
        $horaires = Horaire::whereHas('artisan.atelier', fn($q) => $q->where('id', $atelierId))
            ->where('actif', true)
            ->orderBy('jour_semaine')
            ->get();

        return response()->json(['horaires' => $horaires]);
    }

    /**
     * Créer ou mettre à jour les horaires (upsert par jour).
     * PUT /api/horaires
     *
     * Body attendu:
     * {
     *   "horaires": [
     *     { "jour_semaine": 1, "heure_debut": "08:00", "heure_fin": "17:00", "actif": true },
     *     { "jour_semaine": 6, "heure_debut": "09:00", "heure_fin": "12:00", "actif": true }
     *   ]
     * }
     */
    public function upsert(Request $request): JsonResponse
    {
        $artisan = $request->user()->artisan;

        $data = $request->validate([
            'horaires'                  => ['required', 'array', 'min:1'],
            'horaires.*.jour_semaine'   => ['required', 'integer', 'between:0,6'],
            'horaires.*.heure_debut'    => ['required', 'date_format:H:i'],
            'horaires.*.heure_fin'      => ['required', 'date_format:H:i', 'after:horaires.*.heure_debut'],
            'horaires.*.actif'          => ['boolean'],
        ]);

        $saved = [];
        foreach ($data['horaires'] as $h) {
            $saved[] = Horaire::updateOrCreate(
                ['artisan_id' => $artisan->id, 'jour_semaine' => $h['jour_semaine']],
                [
                    'heure_debut' => $h['heure_debut'],
                    'heure_fin'   => $h['heure_fin'],
                    'actif'       => $h['actif'] ?? true,
                ]
            );
        }

        return response()->json([
            'message'  => 'Horaires mis à jour avec succès.',
            'horaires' => $saved,
        ]);
    }

    /**
     * Activer / désactiver un jour.
     * PATCH /api/horaires/{jour}
     */
    public function toggleJour(Request $request, int $jour): JsonResponse
    {
        $artisan = $request->user()->artisan;

        $horaire = Horaire::where('artisan_id', $artisan->id)
            ->where('jour_semaine', $jour)
            ->firstOrFail();

        $horaire->update(['actif' => ! $horaire->actif]);

        return response()->json([
            'message' => $horaire->actif ? 'Jour activé.' : 'Jour désactivé.',
            'horaire' => $horaire,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // INDISPONIBILITÉS
    // ─────────────────────────────────────────────────────────

    /**
     * Lister les indisponibilités de l'artisan.
     * GET /api/indisponibilites
     */
    public function indisponibilites(Request $request): JsonResponse
    {
        $artisan = $request->user()->artisan;

        $indispos = $artisan->indisponibilites()
            ->where('date_fin', '>=', now()->toDateString())
            ->orderBy('date_debut')
            ->get();

        return response()->json(['indisponibilites' => $indispos]);
    }

    /**
     * Ajouter une période d'indisponibilité.
     * POST /api/indisponibilites
     */
    public function ajouterIndisponibilite(Request $request): JsonResponse
    {
        $artisan = $request->user()->artisan;

        $data = $request->validate([
            'date_debut' => ['required', 'date', 'after_or_equal:today'],
            'date_fin'   => ['required', 'date', 'after_or_equal:date_debut'],
            'motif'      => ['nullable', 'string', 'max:255'],
        ]);

        $indispo = $artisan->indisponibilites()->create($data);

        return response()->json([
            'message'        => 'Indisponibilité ajoutée.',
            'indisponibilite'=> $indispo,
        ], 201);
    }

    /**
     * Supprimer une indisponibilité.
     * DELETE /api/indisponibilites/{id}
     */
    public function supprimerIndisponibilite(Request $request, int $id): JsonResponse
    {
        $artisan  = $request->user()->artisan;
        $indispo  = Indisponibilite::where('artisan_id', $artisan->id)->findOrFail($id);

        $indispo->delete();

        return response()->json(['message' => 'Indisponibilité supprimée.']);
    }

    /**
     * Vérifier la disponibilité d'un artisan pour une date (public).
     * GET /api/ateliers/{id}/disponibilite?date=2024-06-15
     */
    public function verifierDisponibilite(Request $request, int $atelierId): JsonResponse
    {
        $request->validate(['date' => ['required', 'date', 'after_or_equal:today']]);

        $date    = \Carbon\Carbon::parse($request->date);
        $atelier = \App\Models\Atelier::findOrFail($atelierId);
        $artisan = $atelier->artisan;

        $disponible = $artisan->estDisponible($date);

        // Créneaux déjà pris ce jour
        $creneauxPris = [];
        if ($disponible) {
            $creneauxPris = \App\Models\RendezVous::where('atelier_id', $atelierId)
                ->whereDate('date_rdv', $date)
                ->whereNotIn('statut', ['REFUSE', 'ANNULE'])
                ->pluck('date_rdv')
                ->map(fn($d) => $d->format('H:i'))
                ->toArray();
        }

        return response()->json([
            'disponible'   => $disponible,
            'date'         => $date->toDateString(),
            'creneaux_pris'=> $creneauxPris,
        ]);
    }
}
