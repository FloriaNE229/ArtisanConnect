<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Atelier extends Model
{
    use HasFactory;

    protected $table = 'ateliers';

    protected $fillable = [
        'artisan_id',
        'nom',
        'description',
        'image_principale',
        'localisation',
        'domaine',
    ];

    // -------------------------
    // Relations
    // -------------------------

    /**
     * L'artisan propriétaire de cet atelier.
     */
    public function artisan(): BelongsTo
    {
        return $this->belongsTo(Artisan::class, 'artisan_id');
    }

    /**
     * Les offres proposées par cet atelier.
     */
    public function offres(): HasMany
    {
        return $this->hasMany(Offre::class, 'atelier_id');
    }

    /**
     * La galerie photos de cet atelier.
     */
    public function galerie(): HasMany
    {
        return $this->hasMany(GalerieAtelier::class, 'atelier_id');
    }

    /**
     * Les rendez-vous planifiés pour cet atelier.
     */
    public function rendezVous(): HasMany
    {
        return $this->hasMany(RendezVous::class, 'atelier_id');
    }

    /**
     * Les services demandés pour cet atelier.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'atelier_id');
    }

    /**
     * Les avis reçus par cet atelier.
     */
    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class, 'atelier_id');
    }

    /**
     * Les oeuvres de la galerie de l'atelier.
     */
    public function oeuvres(): HasMany
    {
        return $this->hasMany(Oeuvre::class, 'atelier_id');
    }

    /**
     * Note moyenne calculée sur les avis.
     */
    public function noteMoyenne(): float
    {
        return (float) $this->avis()->avg('note') ?? 0;
    }
}
