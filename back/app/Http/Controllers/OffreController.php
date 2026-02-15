<?php

namespace App\Http\Controllers;

use App\Models\Offre;
use App\Models\Atelier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OffreController extends Controller
{
    // Récupérer les offres de l'atelier de l'artisan
    public function index()
    {
        $offres = Offre::whereHas('atelier', function ($query) {
            $query->where('user_id', Auth::id());
        })->get();

        return response()->json($offres, 200);
    }

    // Créer une nouvelle offre
    public function store(Request $request)
    {
        $validated = $request->validate([
            'atelier_id' => 'required|exists:atelier,id',
            'titre' => 'required|string|max:150',
            'prix' => 'required|integer|min:0',
            'description' => 'required|string',
        ]);

        // Vérifier que l'atelier appartient à l'artisan
        $atelier = Atelier::findOrFail($validated['atelier_id']);
        if ($atelier->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $offre = Offre::create([
            'verification_status' => 'pending',
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Offre créée avec succès. En attente d\'approbation admin.',
            'offre' => $offre,
        ], 201);
    }

    // Afficher une offre spécifique
    public function show($id)
    {
        $offre = Offre::findOrFail($id);

        // Vérifier les droits
        if ($offre->atelier->user_id !== Auth::id() && Auth::user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($offre, 200);
    }

    // Mettre à jour une offre
    public function update(Request $request, $id)
    {
        $offre = Offre::findOrFail($id);

        if ($offre->atelier->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'titre' => 'string|max:150',
            'prix' => 'integer|min:0',
            'description' => 'string',
        ]);

        // Réinitialiser le statut à "pending" après modification
        $offre->update([
            'verification_status' => 'pending',
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Offre mise à jour. En attente d\'approbation admin.',
            'offre' => $offre,
        ], 200);
    }

    // Supprimer une offre
    public function destroy($id)
    {
        $offre = Offre::findOrFail($id);

        if ($offre->atelier->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $offre->delete();
        return response()->json(['message' => 'Offre supprimée'], 200);
    }
}
