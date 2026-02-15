<?php

namespace App\Http\Controllers;

use App\Models\Atelier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AtelierController extends Controller
{
    // Récupérer les ateliers de l'artisan connecté
    public function index()
    {
        $ateliers = Atelier::where('user_id', Auth::id())->get();
        return response()->json($ateliers, 200);
    }

    // Créer un nouvel atelier
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:150',
            'image_principale' => 'nullable|string',
            'description' => 'required|string',
            'domaine' => 'required|string|max:100',
            'localisation' => 'required|string|max:255',
        ]);

        $atelier = Atelier::create([
            'user_id' => Auth::id(),
            'verification_status' => 'pending',
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Atelier créé avec succès. En attente d\'approbation admin.',
            'atelier' => $atelier,
        ], 201);
    }

    // Afficher un atelier spécifique
    public function show($id)
    {
        $atelier = Atelier::findOrFail($id);
        
        // Vérifier que c'est l'atelier de l'artisan connecté
        if ($atelier->user_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($atelier, 200);
    }

    // Mettre à jour un atelier
    public function update(Request $request, $id)
    {
        $atelier = Atelier::findOrFail($id);

        if ($atelier->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom' => 'string|max:150',
            'image_principale' => 'nullable|string',
            'description' => 'string',
            'domaine' => 'string|max:100',
            'localisation' => 'string|max:255',
        ]);

        // Réinitialiser le statut à "pending" après modification
        $atelier->update([
            'verification_status' => 'pending',
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Atelier mis à jour. En attente d\'approbation admin.',
            'atelier' => $atelier,
        ], 200);
    }

    // Supprimer un atelier
    public function destroy($id)
    {
        $atelier = Atelier::findOrFail($id);

        if ($atelier->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $atelier->delete();
        return response()->json(['message' => 'Atelier supprimé'], 200);
    }
}
