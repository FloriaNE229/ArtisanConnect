<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'       => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Vérifie existence + mot de passe + rôle ADMIN
        if (
            ! $user ||
            ! Hash::check($request->mot_de_passe, $user->mot_de_passe) ||
            $user->role !== 'ADMIN'
        ) {
            return response()->json([
                'message' => 'Identifiants invalides ou accès non autorisé.'
            ], 401);
        }

        if ($user->suspendu) {
            return response()->json([
                'message' => 'Ce compte est suspendu.'
            ], 403);
        }

        // Révoque les anciens tokens et crée un nouveau
        $user->tokens()->delete();
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'email'  => $user->email,
                'role'   => $user->role,
            ],
        ]);
    }
}