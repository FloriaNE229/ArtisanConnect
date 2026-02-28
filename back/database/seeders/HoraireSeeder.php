<?php

namespace Database\Seeders;

use App\Models\Artisan;
use Illuminate\Database\Seeder;

class HoraireSeeder extends Seeder
{
    public function run(): void
    {
        $artisan1 = Artisan::whereHas('utilisateur', fn($q) => $q->where('email', 'artisan1@test.com'))->first();
        $artisan2 = Artisan::whereHas('utilisateur', fn($q) => $q->where('email', 'artisan2@test.com'))->first();

        // Artisan 1 : Lun-Sam 08h-18h
        $joursArtisan1 = [
            ['jour_semaine' => 1, 'heure_debut' => '08:00', 'heure_fin' => '18:00', 'actif' => true],
            ['jour_semaine' => 2, 'heure_debut' => '08:00', 'heure_fin' => '18:00', 'actif' => true],
            ['jour_semaine' => 3, 'heure_debut' => '08:00', 'heure_fin' => '18:00', 'actif' => true],
            ['jour_semaine' => 4, 'heure_debut' => '08:00', 'heure_fin' => '18:00', 'actif' => true],
            ['jour_semaine' => 5, 'heure_debut' => '08:00', 'heure_fin' => '18:00', 'actif' => true],
            ['jour_semaine' => 6, 'heure_debut' => '08:00', 'heure_fin' => '13:00', 'actif' => true], // Sam matin
            ['jour_semaine' => 0, 'heure_debut' => '08:00', 'heure_fin' => '12:00', 'actif' => false], // Dim fermé
        ];

        foreach ($joursArtisan1 as $h) {
            $artisan1->horaires()->create($h);
        }

        // Artisan 2 : Lun-Ven 07h30-17h30
        $joursArtisan2 = [
            ['jour_semaine' => 1, 'heure_debut' => '07:30', 'heure_fin' => '17:30', 'actif' => true],
            ['jour_semaine' => 2, 'heure_debut' => '07:30', 'heure_fin' => '17:30', 'actif' => true],
            ['jour_semaine' => 3, 'heure_debut' => '07:30', 'heure_fin' => '17:30', 'actif' => true],
            ['jour_semaine' => 4, 'heure_debut' => '07:30', 'heure_fin' => '17:30', 'actif' => true],
            ['jour_semaine' => 5, 'heure_debut' => '07:30', 'heure_fin' => '17:30', 'actif' => true],
            ['jour_semaine' => 6, 'heure_debut' => '08:00', 'heure_fin' => '12:00', 'actif' => false], // Sam fermé
            ['jour_semaine' => 0, 'heure_debut' => '08:00', 'heure_fin' => '12:00', 'actif' => false], // Dim fermé
        ];

        foreach ($joursArtisan2 as $h) {
            $artisan2->horaires()->create($h);
        }

        // Indisponibilité pour artisan 2 (vacances dans 2 semaines)
        $artisan2->indisponibilites()->create([
            'date_debut' => now()->addWeeks(2)->toDateString(),
            'date_fin'   => now()->addWeeks(2)->addDays(6)->toDateString(),
            'motif'      => 'Congés annuels',
        ]);

        $this->command->info('✅ Horaires et indisponibilités seedés');
    }
}