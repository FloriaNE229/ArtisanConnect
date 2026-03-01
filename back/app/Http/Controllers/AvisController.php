<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class AvisController extends Controller
{
    /**
     * Avis publics d'un atelier.
     * GET /api/ateliers/{id}/avis
     */
    public function index(int $atelierId): JsonResponse
    {
        $avis = Avis::with('client:id,nom,prenom,photo_profil')
            ->where('atelier_id', $atelierId)
            ->orderByDesc('created_at')
            ->paginate(10);

        $stats = Avis::where('atelier_id', $atelierId)
            ->selectRaw('AVG(note) as moyenne, COUNT(*) as total')
            ->first();

        return response()->json([
            'avis'    => $avis,
            'stats'   => [
                'moyenne' => round($stats->moyenne ?? 0, 1),
                'total'   => $stats->total ?? 0,
            ],
        ]);
    }

    /**
     * Poster un avis après un service terminé.
     * POST /api/avis
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'service_id'  => ['required', 'integer', 'exists:services,id'],
            'note'        => ['required', 'integer', 'between:1,5'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ]);

        $service = Service::findOrFail($data['service_id']);

        // Vérifier que le service appartient bien au client connecté
        if ($service->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Ce service ne vous appartient pas.'], 403);
        }

        // Vérifier que le service est terminé
        if ($service->statut !== Service::STATUT_TERMINE) {
            return response()->json(['message' => 'Vous ne pouvez évaluer qu\'un service terminé.'], 422);
        }

        // Vérifier qu'un avis n'existe pas déjà pour ce service
        $dejaEvalue = Avis::where('client_id', $request->user()->id)
            ->where('service_id', $data['service_id'])
            ->exists();

        if ($dejaEvalue) {
            return response()->json(['message' => 'Vous avez déjà évalué ce service.'], 422);
        }

        $avis = Avis::create([
            'client_id'   => $request->user()->id,
            'atelier_id'  => $service->atelier_id,
            'service_id'  => $data['service_id'],
            'note'        => $data['note'],
            'commentaire' => $data['commentaire'] ?? null,
        ]);

        return response()->json([
            'message' => 'Avis posté avec succès.',
            'avis'    => $avis->load('client:id,nom,prenom'),
        ], 201);
    }

    /**
     * Modifier un avis (seul l'auteur peut le faire).
     * PUT /api/avis/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $avis = Avis::where('client_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'note'        => ['sometimes', 'integer', 'between:1,5'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ]);

        $avis->update($data);

        return response()->json([
            'message' => 'Avis mis à jour.',
            'avis'    => $avis->fresh(),
        ]);
    }

    /**
     * Supprimer un avis (seul l'auteur).
     * DELETE /api/avis/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $avis = Avis::where('client_id', $request->user()->id)->findOrFail($id);
        $avis->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    /**
     * Mes avis (client connecté).
     * GET /api/mes-avis
     */
    public function mesAvis(Request $request): JsonResponse
    {
        $avis = Avis::with('atelier:id,nom,image_principale')
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['avis' => $avis]);
    }
}
