<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


class Oeuvre extends Model
{
    use HasFactory;

    protected $table = 'oeuvres';

    protected $fillable = [
        'atelier_id',
        'titre',
        'description',
        'image_url',
        'prix_indicatif',
        'visible',
    ];

    protected $casts = [
        'prix_indicatif' => 'decimal:2',
        'visible'        => 'boolean',
    ];

    public function scopeVisibles(Builder $query): Builder
    {
        return $query->where('visible', true);
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class, 'atelier_id');
    }
}
