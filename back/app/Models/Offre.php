<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offre extends Model
{
    use HasFactory;

    protected $table = 'offres';

    protected $fillable = [
        'atelier_id',
        'titre',
        'description',
        'prix',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
    ];

    // -------------------------
    // Relations
    // -------------------------

    /**
     * L'atelier qui propose cette offre.
     */
    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }

    /**
     * Les services liés à cette offre.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'offre_id');
    }
}
