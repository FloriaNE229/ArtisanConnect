<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArtisanProfileController extends Controller
{
    // Mettre à jour le profil de l'artisan
    public function updateProfile(Request $request)
    {
        $artisan = Auth::user();

        $validated = $request->validate([
            'bio' => 'nullable|string',
            'specialite' => 'nullable|string',
            'experience_level' => 'nullable|string',
            'verification_documents' => 'nullable|string',
        ]);

        $artisan->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'artisan' => $artisan,
        ], 200);
    }

    // Récupérer le profil de l'artisan connecté
    public function getProfile()
    {
        $artisan = Auth::user();
        return response()->json($artisan, 200);
    }
}
