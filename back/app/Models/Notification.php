<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'destinataire_id',
        'type',
        'message',
        'reference_id',
        'reference_type',
        'lu',
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    // Types disponibles
    const TYPE_NOUVEAU_RDV      = 'NOUVEAU_RDV';
    const TYPE_RDV_ACCEPTE      = 'RDV_ACCEPTE';
    const TYPE_RDV_REFUSE       = 'RDV_REFUSE';
    const TYPE_RDV_ANNULE       = 'RDV_ANNULE';
    const TYPE_NOUVEAU_SERVICE  = 'NOUVEAU_SERVICE';
    const TYPE_SERVICE_ACCEPTE  = 'SERVICE_ACCEPTE';
    const TYPE_SERVICE_REFUSE   = 'SERVICE_REFUSE';
    const TYPE_SERVICE_TERMINE  = 'SERVICE_TERMINE';
    const TYPE_SERVICE_IMMEDIAT = 'SERVICE_IMMEDIAT';
    const TYPE_ARTISAN_EN_ROUTE = 'ARTISAN_EN_ROUTE';

    // -------------------------
    // Scopes
    // -------------------------

    public function scopeNonLues(Builder $query): Builder
    {
        return $query->where('lu', false);
    }

    public function scopePourUtilisateur(Builder $query, int $userId): Builder
    {
        return $query->where('destinataire_id', $userId);
    }

    // -------------------------
    // Helpers
    // -------------------------

    public function marquerCommeLue(): void
    {
        $this->update(['lu' => true]);
    }

    // -------------------------
    // Relations
    // -------------------------

    /**
     * L'utilisateur destinataire de cette notification.
     */
    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}
