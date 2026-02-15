<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur admin par défaut
        User::create([
            'nom' => 'Admin',
            'prenom' => 'System',
            'email' => 'admin@digitalart.com',
            'password' => Hash::make('Admin@123456'),
            'role' => 'ADMIN',
            'photo_profil' => null,
            'email_verified_at' => now(),
        ]);

        // Créer un utilisateur CLIENT pour test
        User::create([
            'nom' => 'Client',
            'prenom' => 'Test',
            'email' => 'client@digitalart.com',
            'password' => Hash::make('Client@123456'),
            'role' => 'CLIENT',
            'photo_profil' => null,
            'email_verified_at' => now(),
        ]);

        // Créer un utilisateur ARTISAN pour test
        User::create([
            'nom' => 'Artisan',
            'prenom' => 'Test',
            'email' => 'artisan@digitalart.com',
            'password' => Hash::make('Artisan@123456'),
            'role' => 'ARTISAN',
            'photo_profil' => null,
            'email_verified_at' => now(),
            'specialite' => 'Peinture',
            'experience_level' => 'expert',
        ]);
    }
}
