<?php

namespace Database\Seeders;

use App\Models\Atelier;
use App\Models\Offre;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $client1  = User::where('email', 'hessouhrebecca@gmail.com')->first();
        $client2  = User::where('email', 'client2@test.com')->first();
        $atelier1 = Atelier::where('nom', 'Forge Koné')->first();
        $atelier2 = Atelier::where('nom', 'Bois & Création Hounsa')->first();
        $offre1   = Offre::where('atelier_id', $atelier1->id)->first();
        $offre2   = Offre::where('atelier_id', $atelier2->id)->first();

        // EN_ATTENTE (peut être accepté/refusé depuis Postman)
        Service::create([
            'client_id'   => $client1->id,
            'atelier_id'  => $atelier1->id,
            'offre_id'    => $offre1->id,
            'description' => 'Je voudrais un portail sur mesure pour ma villa, environ 3m de large.',
            'statut'      => 'EN_ATTENTE',
        ]);

        // ACCEPTE (peut être terminé depuis Postman)
        Service::create([
            'client_id'   => $client2->id,
            'atelier_id'  => $atelier2->id,
            'offre_id'    => $offre2->id,
            'description' => 'Cuisine en L de 5m pour appartement.',
            'statut'      => 'ACCEPTE',
        ]);

        // TERMINE – sera utilisé pour l'AvisSeeder
        Service::create([
            'client_id'   => $client1->id,
            'atelier_id'  => $atelier2->id,
            'offre_id'    => null,
            'description' => 'Réparation d\'une armoire abîmée.',
            'statut'      => 'TERMINE',
        ]);

        // TERMINE – second avis possible
        Service::create([
            'client_id'   => $client2->id,
            'atelier_id'  => $atelier1->id,
            'offre_id'    => null,
            'description' => 'Pose de grilles aux fenêtres du salon.',
            'statut'      => 'TERMINE',
        ]);

        // REFUSE (historique)
        Service::create([
            'client_id'   => $client1->id,
            'atelier_id'  => $atelier1->id,
            'offre_id'    => null,
            'description' => 'Mobilier complet jardin.',
            'statut'      => 'REFUSE',
        ]);

        // ANNULE (historique)
        Service::create([
            'client_id'   => $client2->id,
            'atelier_id'  => $atelier2->id,
            'offre_id'    => $offre2->id,
            'description' => 'Finalement annulé par le client.',
            'statut'      => 'ANNULE',
        ]);

        $this->command->info('✅ Services seedés (EN_ATTENTE, ACCEPTE, TERMINE x2, REFUSE, ANNULE)');
    }
}