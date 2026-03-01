<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'photo_profil',
        'role',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    /**
     * Surcharge pour que l'auth Laravel utilise 'mot_de_passe' au lieu de 'password'.
     */
    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    protected $casts = [
        'role' => 'string',
    ];

    // -------------------------
    // Helpers
    // -------------------------

    public function isClient(): bool
    {
        return $this->role === 'CLIENT';
    }

    public function isArtisan(): bool
    {
        return $this->role === 'ARTISAN';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    // -------------------------
    // Relations
    // -------------------------

    /**
     * Un utilisateur ARTISAN possède un profil artisan.
     */
    public function artisan(): HasOne
    {
        return $this->hasOne(Artisan::class, 'utilisateur_id');
    }

    /**
     * Les rendez-vous demandés par ce client.
     */
    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class, 'client_id');
    }

    /**
     * Les services demandés par ce client.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'client_id');
    }

    /**
     * Les services immédiats demandés par ce client.
     */
    public function servicesImmediats(): HasMany
    {
        return $this->hasMany(ServiceImmediat::class, 'client_id');
    }

    /**
     * Les avis postés par ce client.
     */
    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class, 'client_id');
    }

    /**
     * Les notifications reçues par cet utilisateur.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'destinataire_id');
    }
}
