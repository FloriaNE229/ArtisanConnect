<?php

namespace Database\Seeders;

use App\Models\Atelier;
use App\Models\User;
use App\Models\RendezVous;
use Illuminate\Database\Seeder;

class RendezVousSeeder extends Seeder
{
    public function run(): void
    {
        $client1   = User::where('email', 'hessouhrebecca@gmail.com')->first();
        $client2   = User::where('email', 'client2@test.com')->first();
        $atelier1  = Atelier::where('nom', 'Forge Koné')->first();
        $atelier2  = Atelier::where('nom', 'Bois & Création Hounsa')->first();

        // RDV EN_ATTENTE (peut être accepté ou refusé depuis Postman)
        RendezVous::create([
            'client_id'     => $client1->id,
            'atelier_id'    => $atelier1->id,
            'date_rdv'      => now()->addDays(3)->setTime(10, 0),
            'duree_minutes' => 60,
            'statut'        => 'EN_ATTENTE',
            'message'       => 'Bonjour, je souhaite un devis pour un portail.',
        ]);

        // RDV ACCEPTE (pour tester le rappel email et l'annulation client)
        RendezVous::create([
            'client_id'     => $client1->id,
            'atelier_id'    => $atelier2->id,
            'date_rdv'      => now()->addDay()->setTime(14, 0), // demain = rappel envoyé
            'duree_minutes' => 90,
            'statut'        => 'ACCEPTE',
            'message'       => 'Pour la pose d\'un parquet dans le salon.',
        ]);

        // RDV ACCEPTE dans le futur (pour tester l'annulation)
        RendezVous::create([
            'client_id'     => $client2->id,
            'atelier_id'    => $atelier1->id,
            'date_rdv'      => now()->addDays(7)->setTime(9, 0),
            'duree_minutes' => 60,
            'statut'        => 'ACCEPTE',
            'message'       => 'Réparation de grilles de fenêtre.',
        ]);

        // RDV REFUSE (historique)
        RendezVous::create([
            'client_id'     => $client2->id,
            'atelier_id'    => $atelier2->id,
            'date_rdv'      => now()->subDays(5)->setTime(11, 0),
            'duree_minutes' => 60,
            'statut'        => 'REFUSE',
            'message'       => 'Cuisine complète.',
        ]);

        // RDV ANNULE (historique)
        RendezVous::create([
            'client_id'     => $client1->id,
            'atelier_id'    => $atelier1->id,
            'date_rdv'      => now()->subDays(2)->setTime(15, 0),
            'duree_minutes' => 45,
            'statut'        => 'ANNULE',
            'message'       => 'Finalement annulé.',
        ]);

        $this->command->info('✅ Rendez-vous seedés (EN_ATTENTE, ACCEPTE, REFUSE, ANNULE)');
    }
}