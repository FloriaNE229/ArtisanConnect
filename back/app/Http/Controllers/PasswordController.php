<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;


class PasswordController extends Controller
{
    /**
     * Envoie un lien de réinitialisation par email.
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:utilisateurs,email'],
        ]);

        // Supprimer un éventuel ancien token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($token),
            'created_at' => now(),
        ]);

        // Envoyer l'email (adapter selon votre config mail)
        $resetUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        Mail::send('emails.reset-password', ['url' => $resetUrl], function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Réinitialisation de votre mot de passe');
        });

        return response()->json([
            'message' => 'Un lien de réinitialisation a été envoyé à votre adresse email.',
        ]);
    }

    /**
     * Réinitialise le mot de passe avec le token reçu.
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => ['required', 'email', 'exists:utilisateurs,email'],
            'token'                 => ['required', 'string'],
            'mot_de_passe'          => ['required', 'confirmed', 'min:8'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 422);
        }

        // Vérifier expiration (60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token expiré. Veuillez refaire une demande.'], 422);
        }

        $user = Utilisateur::where('email', $request->email)->firstOrFail();
        $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);

        // Révoquer tous les tokens Sanctum pour forcer la reconnexion
        $user->tokens()->delete();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.']);
    }

    /**
     * Change le mot de passe depuis le profil (utilisateur connecté).
     * POST /api/profil/changer-mot-de-passe
     */
    public function changerMotDePasse(Request $request): JsonResponse
    {
        $request->validate([
            'ancien_mot_de_passe' => ['required', 'string'],
            'mot_de_passe'        => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->ancien_mot_de_passe, $user->mot_de_passe)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect.'], 422);
        }

        $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);

        // Révoquer tous les autres tokens (garder le courant)
        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
