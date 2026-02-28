<?php

namespace App\Http\Controllers;

use App\Models\Offre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class OffreController extends Controller
{
    /**
     * Offres publiques d'un atelier.
     * GET /api/ateliers/{id}/offres
     */
    public function index(int $atelierId): JsonResponse
    {
        $offres = Offre::where('atelier_id', $atelierId)
            ->orderBy('titre')
            ->get();

        return response()->json(['offres' => $offres]);
    }

    /**
     * Créer une offre (artisan).
     * POST /api/offres
     */
    public function store(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;

        if (! $atelier) {
            return response()->json(['message' => 'Créez d\'abord votre atelier.'], 422);
        }

        $data = $request->validate([
            'titre'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'prix'        => ['nullable', 'numeric', 'min:0'],
        ]);

        $offre = $atelier->offres()->create($data);

        return response()->json([
            'message' => 'Offre créée.',
            'offre'   => $offre,
        ], 201);
    }

    /**
     * Modifier une offre (artisan).
     * PUT /api/offres/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $offre   = Offre::where('atelier_id', $atelier?->id)->findOrFail($id);

        $data = $request->validate([
            'titre'       => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'prix'        => ['nullable', 'numeric', 'min:0'],
        ]);

        $offre->update($data);

        return response()->json(['message' => 'Offre mise à jour.', 'offre' => $offre->fresh()]);
    }

    /**
     * Supprimer une offre (artisan).
     * DELETE /api/offres/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $offre   = Offre::where('atelier_id', $atelier?->id)->findOrFail($id);
        $offre->delete();

        return response()->json(['message' => 'Offre supprimée.']);
    }
}
