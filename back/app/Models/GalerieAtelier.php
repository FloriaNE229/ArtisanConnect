<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class GalerieAtelier extends Model
{
    use HasFactory;

    protected $table = 'galerie_atelier';

    protected $fillable = [
        'atelier_id',
        'image_url',
    ];

    // -------------------------
    // Relations
    // -------------------------

    /**
     * L'atelier auquel appartient cette image.
     */
    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }
}
