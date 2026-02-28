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
        return $this->belongsTo(User::class, 'utilisateur_id');
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

    /**
     * Les horaires de travail de cet artisan.
     */
    public function horaires(): HasMany
    {
        return $this->hasMany(Horaire::class, 'artisan_id');
    }

    /**
     * Les périodes d'indisponibilité de cet artisan.
     */
    public function indisponibilites(): HasMany
    {
        return $this->hasMany(Indisponibilite::class, 'artisan_id');
    }

    /**
     * Vérifie si l'artisan est disponible pour une date donnée.
     */
    public function estDisponible(\Carbon\Carbon $date): bool
    {
        // Vérifier les indisponibilités
        $indispo = $this->indisponibilites()
            ->where('date_debut', '<=', $date->toDateString())
            ->where('date_fin', '>=', $date->toDateString())
            ->exists();

        if ($indispo) return false;

        // Vérifier les horaires du jour
        $horaire = $this->horaires()
            ->where('jour_semaine', $date->dayOfWeek)
            ->where('actif', true)
            ->first();

        return $horaire !== null;
    }
}
