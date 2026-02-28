<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class ProfilController extends Controller
{
    /**
     * Récupérer son propre profil.
     * GET /api/profil
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('artisan.atelier.horaires', 'artisan.indisponibilites');

        return response()->json(['user' => $user]);
    }

    /**
     * Mettre à jour les infos communes (nom, prénom, photo).
     * PUT /api/profil
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'nom'          => ['sometimes', 'string', 'max:100'],
            'prenom'       => ['sometimes', 'string', 'max:100'],
            'photo_profil' => ['sometimes', 'image', 'max:2048'], // fichier image max 2MB
        ]);

        if ($request->hasFile('photo_profil')) {
            // Supprimer l'ancienne photo
            if ($user->photo_profil) {
                Storage::disk('public')->delete($user->photo_profil);
            }
            $data['photo_profil'] = $request->file('photo_profil')->store('profils', 'public');
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * Mettre à jour le profil professionnel de l'artisan.
     * PUT /api/profil/artisan
     */
    public function updateArtisan(Request $request): JsonResponse
    {
        $user    = $request->user();
        $artisan = $user->artisan;

        if (! $artisan) {
            return response()->json(['message' => 'Profil artisan introuvable.'], 404);
        }

        $data = $request->validate([
            'telephone' => ['sometimes', 'string', 'max:20', 'unique:artisans,telephone,' . $artisan->id],
        ]);

        $artisan->update($data);

        // Mettre à jour l'atelier si des données atelier sont fournies
        if ($request->hasAny(['nom', 'description', 'localisation', 'domaine'])) {
            $atelierData = $request->validate([
                'nom'         => ['sometimes', 'string', 'max:255'],
                'description' => ['sometimes', 'string'],
                'localisation'=> ['sometimes', 'string', 'max:255'],
                'domaine'     => ['sometimes', 'string', 'max:150'],
            ]);

            if ($artisan->atelier) {
                $artisan->atelier->update($atelierData);
            }
        }

        // Mettre à jour l'image principale de l'atelier
        if ($request->hasFile('image_principale') && $artisan->atelier) {
            $request->validate(['image_principale' => ['image', 'max:4096']]);

            if ($artisan->atelier->image_principale) {
                Storage::disk('public')->delete($artisan->atelier->image_principale);
            }

            $path = $request->file('image_principale')->store('ateliers', 'public');
            $artisan->atelier->update(['image_principale' => $path]);
        }

        return response()->json([
            'message' => 'Profil artisan mis à jour avec succès.',
            'artisan' => $artisan->fresh(['atelier']),
        ]);
    }

    /**
     * Supprimer son compte.
     * DELETE /api/profil
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'mot_de_passe' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! \Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé avec succès.']);
    }
}
