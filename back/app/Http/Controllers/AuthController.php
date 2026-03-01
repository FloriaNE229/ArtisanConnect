<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // -------------------------------------------------------------------------
    // REGISTER
    // -------------------------------------------------------------------------

    /**
     * Inscription d'un CLIENT.
     */
    public function registerClient(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'          => ['required', 'string', 'max:100'],
            'prenom'       => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'unique:users,email'],
            'mot_de_passe' => ['required', 'confirmed', Password::min(8)],
            'photo_profil' => ['nullable', 'url', 'max:500'],
        ]);

        $user = User::create([
            'nom'          => $data['nom'],
            'prenom'       => $data['prenom'],
            'email'        => $data['email'],
            'mot_de_passe' => Hash::make($data['mot_de_passe']),
            'photo_profil' => $data['photo_profil'] ?? null,
            'role'         => 'CLIENT',
        ]);

        $token = $user->createToken('auth_token', ['role:client'])->plainTextToken;

        return response()->json([
            'message' => 'Compte client créé avec succès.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201);
    }

    /**
     * Inscription d'un ARTISAN (crée aussi le profil artisan).
     */
    public function registerArtisan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'          => ['required', 'string', 'max:100'],
            'prenom'       => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'unique:users,email'],
            'mot_de_passe' => ['required', 'confirmed', Password::min(8)],
            'photo_profil' => ['nullable', 'url', 'max:500'],
            'telephone'    => ['required', 'string', 'max:20', 'unique:artisans,telephone'],
        ]);

        // Transaction pour garantir l'atomicité
        $user = \DB::transaction(function () use ($data) {
            $user = User::create([
                'nom'          => $data['nom'],
                'prenom'       => $data['prenom'],
                'email'        => $data['email'],
                'mot_de_passe' => Hash::make($data['mot_de_passe']),
                'photo_profil' => $data['photo_profil'] ?? null,
                'role'         => 'ARTISAN',
            ]);

            $user->artisan()->create([
                'telephone' => $data['telephone'],
            ]);

            return $user;
        });

        $token = $user->createToken('auth_token', ['role:artisan'])->plainTextToken;

        return response()->json([
            'message' => 'Compte artisan créé avec succès.',
            'token'   => $token,
            'user'    => $this->formatUser($user->load('artisan')),
        ], 201);
    }

    // -------------------------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------------------------

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'        => ['required', 'email'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['mot_de_passe'], $user->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Révoque les anciens tokens pour n'avoir qu'une session active
        $user->tokens()->delete();

        $abilities = match ($user->role) {
            'CLIENT'  => ['role:client'],
            'ARTISAN' => ['role:artisan'],
            default   => [],
        };

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'user'    => $this->formatUser($user->load('artisan.atelier')),
        ]);
    }

    // -------------------------------------------------------------------------
    // LOGOUT
    // -------------------------------------------------------------------------

    public function logout(Request $request): JsonResponse
    {
        // Révoque uniquement le token courant
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * Révoque TOUS les tokens (déconnexion de tous les appareils).
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnecté de tous les appareils.']);
    }

    // -------------------------------------------------------------------------
    // ME
    // -------------------------------------------------------------------------

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()->load('artisan.atelier')),
        ]);
    }

    // -------------------------------------------------------------------------
    // PRIVATE HELPERS
    // -------------------------------------------------------------------------

    private function formatUser(User $user): array
    {
        $data = [
            'id'           => $user->id,
            'nom'          => $user->nom,
            'prenom'       => $user->prenom,
            'email'        => $user->email,
            'role'         => $user->role,
            'photo_profil' => $user->photo_profil,
            'created_at'   => $user->created_at,
        ];

        if ($user->relationLoaded('artisan') && $user->artisan) {
            $data['artisan'] = [
                'id'        => $user->artisan->id,
                'telephone' => $user->artisan->telephone,
                'atelier'   => $user->artisan->relationLoaded('atelier')
                    ? $user->artisan->atelier
                    : null,
            ];
        }

        return $data;
    }
}
