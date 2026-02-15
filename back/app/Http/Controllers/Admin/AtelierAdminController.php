<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Atelier;
use Illuminate\Http\Request;

class AtelierAdminController extends Controller
{
    // Récupérer les ateliers en attente
    public function pending()
    {
        $ateliers = Atelier::where('verification_status', 'pending')->get();
        return response()->json($ateliers, 200);
    }

    // Approuver un atelier
    public function approve(Request $request, $id)
    {
        $atelier = Atelier::findOrFail($id);

        $atelier->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Atelier approuvé',
            'atelier' => $atelier,
        ], 200);
    }

    // Rejeter un atelier
    public function reject(Request $request, $id)
    {
        $atelier = Atelier::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $atelier->update([
            'verification_status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Atelier rejeté',
            'reason' => $validated['reason'],
            'atelier' => $atelier,
        ], 200);
    }

    // Récupérer tous les ateliers
    public function all()
    {
        $ateliers = Atelier::all();
        return response()->json($ateliers, 200);
    }
}
