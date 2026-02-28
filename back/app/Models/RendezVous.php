<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class RendezVous extends Model
{
    use HasFactory;

    protected $table = 'rendez_vous';

    protected $fillable = [
        'client_id',
        'atelier_id',
        'date_rdv',
        'duree_minutes',
        'statut',
        'message',
    ];

    protected $casts = [
        'date_rdv'       => 'datetime',
        'duree_minutes'  => 'integer',
    ];

    // Statuts disponibles
    const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    const STATUT_ACCEPTE    = 'ACCEPTE';
    const STATUT_REFUSE     = 'REFUSE';
    const STATUT_ANNULE     = 'ANNULE';

    // -------------------------
    // Scopes
    // -------------------------

    public function scopeActifs($query)
    {
        return $query->whereNotIn('statut', [self::STATUT_REFUSE, self::STATUT_ANNULE]);
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', self::STATUT_EN_ATTENTE);
    }

    // -------------------------
    // Relations
    // -------------------------

    /**
     * Le client qui a demandé ce rendez-vous.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * L'atelier concerné par ce rendez-vous.
     */
    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }
}
