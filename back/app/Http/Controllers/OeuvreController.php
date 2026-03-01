<?php

namespace App\Http\Controllers;

use App\Models\Oeuvre;
use App\Models\Atelier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class OeuvreController extends Controller
{
     /**
     * Lister les oeuvres d'un atelier (public, visibles uniquement).
     * GET /api/ateliers/{id}/oeuvres
     */
    public function index(int $atelierId): JsonResponse
    {
        $oeuvres = Oeuvre::where('atelier_id', $atelierId)
            ->visibles()
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['oeuvres' => $oeuvres]);
    }

    /**
     * Lister toutes mes oeuvres (artisan, y compris masquées).
     * GET /api/mes-oeuvres
     */
    public function mesOeuvres(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan->atelier;

        if (! $atelier) {
            return response()->json(['message' => 'Vous n\'avez pas encore d\'atelier.'], 404);
        }

        $oeuvres = $atelier->oeuvres()->orderByDesc('created_at')->get();

        return response()->json(['oeuvres' => $oeuvres]);
    }

    /**
     * Ajouter une oeuvre.
     * POST /api/mes-oeuvres
     */
    public function store(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;

        if (! $atelier) {
            return response()->json(['message' => 'Créez d\'abord votre atelier.'], 422);
        }

        $data = $request->validate([
            'titre'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'image'          => ['required', 'image', 'max:5120'], // max 5MB
            'prix_indicatif' => ['nullable', 'numeric', 'min:0'],
            'visible'        => ['boolean'],
        ]);

        $imagePath = $request->file('image')->store('oeuvres', 'public');

        $oeuvre = $atelier->oeuvres()->create([
            'titre'          => $data['titre'],
            'description'    => $data['description'] ?? null,
            'image_url'      => Storage::disk('public')->url($imagePath),
            'prix_indicatif' => $data['prix_indicatif'] ?? null,
            'visible'        => $data['visible'] ?? true,
        ]);

        return response()->json([
            'message' => 'Oeuvre ajoutée avec succès.',
            'oeuvre'  => $oeuvre,
        ], 201);
    }

    /**
     * Détail d'une oeuvre (public).
     * GET /api/oeuvres/{id}
     */
    public function show(int $id): JsonResponse
    {
        $oeuvre = Oeuvre::with('atelier')->findOrFail($id);

        return response()->json(['oeuvre' => $oeuvre]);
    }

    /**
     * Modifier une oeuvre.
     * POST /api/mes-oeuvres/{id}  (POST car multipart avec image optionnelle)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $oeuvre  = Oeuvre::where('atelier_id', $atelier?->id)->findOrFail($id);

        $data = $request->validate([
            'titre'          => ['sometimes', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'image'          => ['sometimes', 'image', 'max:5120'],
            'prix_indicatif' => ['nullable', 'numeric', 'min:0'],
            'visible'        => ['boolean'],
        ]);

        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $oeuvre->image_url);
            Storage::disk('public')->delete($oldPath);

            $imagePath       = $request->file('image')->store('oeuvres', 'public');
            $data['image_url'] = Storage::disk('public')->url($imagePath);
        }

        unset($data['image']);
        $oeuvre->update($data);

        return response()->json([
            'message' => 'Oeuvre mise à jour.',
            'oeuvre'  => $oeuvre->fresh(),
        ]);
    }

    /**
     * Supprimer une oeuvre.
     * DELETE /api/mes-oeuvres/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $oeuvre  = Oeuvre::where('atelier_id', $atelier?->id)->findOrFail($id);

        // Supprimer le fichier image
        $oldPath = str_replace(Storage::disk('public')->url(''), '', $oeuvre->image_url);
        Storage::disk('public')->delete($oldPath);

        $oeuvre->delete();

        return response()->json(['message' => 'Oeuvre supprimée.']);
    }

    /**
     * Basculer la visibilité d'une oeuvre.
     * PATCH /api/mes-oeuvres/{id}/visibilite
     */
    public function toggleVisibilite(Request $request, int $id): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $oeuvre  = Oeuvre::where('atelier_id', $atelier?->id)->findOrFail($id);

        $oeuvre->update(['visible' => ! $oeuvre->visible]);

        return response()->json([
            'message' => $oeuvre->visible ? 'Oeuvre rendue visible.' : 'Oeuvre masquée.',
            'oeuvre'  => $oeuvre,
        ]);
    }
}
