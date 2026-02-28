<?php

namespace Database\Seeders;

use App\Models\Artisan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Comptes créés pour les tests Postman :
 *
 * CLIENTS :
 *   client1@test.com  / password123
 *   client2@test.com  / password123
 *
 * ARTISANS :
 *   artisan1@test.com / password123
 *   artisan2@test.com / password123
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── CLIENTS ──────────────────────────────────────────

        User::create([
            'nom'          => 'Dupont',
            'prenom'       => 'Marie',
            'email'        => 'hessouhrebecca@gmail.com',
            'mot_de_passe' => Hash::make('password123'),
            'role'         => 'CLIENT',
        ]);

        User::create([
            'nom'          => 'Martin',
            'prenom'       => 'Lucas',
            'email'        => 'client2@test.com',
            'mot_de_passe' => Hash::make('password123'),
            'role'         => 'CLIENT',
        ]);

        // ── ARTISANS ─────────────────────────────────────────

        $artisan1User = User::create([
            'nom'          => 'Koné',
            'prenom'       => 'Ibrahim',
            'email'        => 'artisan1@test.com',
            'mot_de_passe' => Hash::make('password123'),
            'role'         => 'ARTISAN',
        ]);

        Artisan::create([
            'utilisateur_id' => $artisan1User->id,
            'telephone'      => '+22967000001',
        ]);

        $artisan2User = User::create([
            'nom'          => 'Hounsa',
            'prenom'       => 'Agathe',
            'email'        => 'artisan2@test.com',
            'mot_de_passe' => Hash::make('password123'),
            'role'         => 'ARTISAN',
        ]);

        Artisan::create([
            'utilisateur_id' => $artisan2User->id,
            'telephone'      => '+22967000002',
        ]);

        $this->command->info('✅ Utilisateurs seedés (2 clients + 2 artisans)');
    }
}