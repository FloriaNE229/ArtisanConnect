<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Horaire extends Model
{
    use HasFactory;

    protected $table = 'horaires';

    protected $fillable = [
        'artisan_id',
        'jour_semaine',
        'heure_debut',
        'heure_fin',
        'actif',
    ];

    protected $casts = [
        'actif'        => 'boolean',
        'jour_semaine' => 'integer',
    ];

    const JOURS = [
        0 => 'Dimanche',
        1 => 'Lundi',
        2 => 'Mardi',
        3 => 'Mercredi',
        4 => 'Jeudi',
        5 => 'Vendredi',
        6 => 'Samedi',
    ];

    public function getNomJourAttribute(): string
    {
        return self::JOURS[$this->jour_semaine] ?? 'Inconnu';
    }

    public function artisan(): BelongsTo
    {
        return $this->belongsTo(Artisan::class, 'artisan_id');
    }
}
