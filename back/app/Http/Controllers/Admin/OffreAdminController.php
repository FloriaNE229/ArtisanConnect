<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offre;
use Illuminate\Http\Request;

class OffreAdminController extends Controller
{
    // Récupérer les offres en attente
    public function pending()
    {
        $offres = Offre::where('verification_status', 'pending')->get();
        return response()->json($offres, 200);
    }

    // Approuver une offre
    public function approve(Request $request, $id)
    {
        $offre = Offre::findOrFail($id);

        $offre->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Offre approuvée',
            'offre' => $offre,
        ], 200);
    }

    // Rejeter une offre
    public function reject(Request $request, $id)
    {
        $offre = Offre::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $offre->update([
            'verification_status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Offre rejetée',
            'reason' => $validated['reason'],
            'offre' => $offre,
        ], 200);
    }

    // Récupérer toutes les offres
    public function all()
    {
        $offres = Offre::all();
        return response()->json($offres, 200);
    }
}
