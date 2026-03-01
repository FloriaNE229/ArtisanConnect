<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Indisponibilite extends Model
{
     use HasFactory;

    protected $table = 'indisponibilites';

    protected $fillable = [
        'artisan_id',
        'date_debut',
        'date_fin',
        'motif',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    public function artisan(): BelongsTo
    {
        return $this->belongsTo(Artisan::class, 'artisan_id');
    }
}
