<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $fillable = [
        'client_id',
        'atelier_id',
        'offre_id',
        'description',
        'statut',
    ];

    // Statuts disponibles
    const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    const STATUT_ACCEPTE    = 'ACCEPTE';
    const STATUT_REFUSE     = 'REFUSE';
    const STATUT_TERMINE    = 'TERMINE';
    const STATUT_ANNULE     = 'ANNULE';

    // -------------------------
    // Scopes
    // -------------------------

    public function scopeTermines($query)
    {
        return $query->where('statut', self::STATUT_TERMINE);
    }

    // -------------------------
    // Relations
    // -------------------------

    /**
     * Le client qui a demandé ce service.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * L'atelier concerné par ce service.
     */
    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }

    /**
     * L'offre associée à ce service (optionnel).
     */
    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class, 'offre_id');
    }

    /**
     * L'avis posté suite à ce service (1-1, uniquement si terminé).
     */
    public function avis(): HasOne
    {
        return $this->hasOne(Avis::class, 'service_id');
    }
}
