<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Artisan extends Model
{
    use HasFactory;

    protected $table = 'artisans';

    protected $fillable = [
        'utilisateur_id',
        'telephone',
    ];

    // -------------------------
    // Relations
    // -------------------------

    /**
     * L'utilisateur lié à cet artisan.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    /**
     * L'atelier appartenant à cet artisan (relation 1-1).
     */
    public function atelier(): HasOne
    {
        return $this->hasOne(Atelier::class, 'artisan_id');
    }

    /**
     * Les services immédiats acceptés par cet artisan.
     */
    public function servicesImmediatsAcceptes(): HasMany
    {
        return $this->hasMany(ServiceImmediat::class, 'artisan_acceptant_id');
    }
}
