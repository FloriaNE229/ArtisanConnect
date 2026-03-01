<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,   // 2 clients + 2 artisans
            AtelierSeeder::class,        // 2 ateliers avec offres + galerie + oeuvres
            HoraireSeeder::class,        // horaires des 2 artisans
            RendezVousSeeder::class,     // RDV dans différents statuts
            ServiceSeeder::class,        // Services dans différents statuts
            AvisSeeder::class,           // Avis sur les services terminés
        ]);
    }
}
