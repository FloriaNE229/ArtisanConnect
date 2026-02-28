<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class ServiceImmediat extends Model
{
    use HasFactory;

    protected $table = 'services_immediats';

    protected $fillable = [
        'client_id',
        'domaine',
        'description',
        'localisation',
        'statut',
        'artisan_acceptant_id',
    ];

    // Statuts disponibles
    const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    const STATUT_EN_COURS   = 'EN_COURS';
    const STATUT_TERMINE    = 'TERMINE';
    const STATUT_REFUSE     = 'REFUSE';
    const STATUT_ANNULE     = 'ANNULE';

    // -------------------------
    // Relations
    // -------------------------

    /**
     * Le client qui a demandé ce service immédiat.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * L'artisan qui a accepté ce service immédiat.
     */
    public function artisanAcceptant(): BelongsTo
    {
        return $this->belongsTo(Artisan::class, 'artisan_acceptant_id');
    }
}
