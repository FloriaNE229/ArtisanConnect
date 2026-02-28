<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    use HasFactory;

    protected $table = 'avis';

    protected $fillable = [
        'client_id',
        'atelier_id',
        'service_id',
        'note',
        'commentaire',
    ];

    protected $casts = [
        'note' => 'integer',
    ];

    // -------------------------
    // Boot: validation métier
    // -------------------------

    protected static function booted(): void
    {
        static::creating(function (Avis $avis) {
            // S'assurer que le service est bien terminé avant de poster un avis
            $service = Service::find($avis->service_id);

            if (!$service || $service->statut !== Service::STATUT_TERMINE) {
                throw new \DomainException('Un avis ne peut être posté que sur un service terminé.');
            }

            // Vérifier que la note est entre 1 et 5
            if ($avis->note < 1 || $avis->note > 5) {
                throw new \DomainException('La note doit être comprise entre 1 et 5.');
            }
        });
    }

    // -------------------------
    // Relations
    // -------------------------

    /**
     * Le client auteur de cet avis.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * L'atelier évalué.
     */
    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }

    /**
     * Le service qui a donné lieu à cet avis.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
