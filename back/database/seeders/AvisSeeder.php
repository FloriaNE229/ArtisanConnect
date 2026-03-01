<?php

namespace Database\Seeders;

use App\Models\Atelier;
use App\Models\Avis;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class AvisSeeder extends Seeder
{
    public function run(): void
    {
        $client1  = User::where('email', 'hessouhrebecca@gmail.com')->first();
        $client2  = User::where('email', 'client2@test.com')->first();
        $atelier1 = Atelier::where('nom', 'Forge Koné')->first();
        $atelier2 = Atelier::where('nom', 'Bois & Création Hounsa')->first();

        // Récupérer les services TERMINE
        $serviceTermine1 = Service::where('client_id', $client1->id)
            ->where('atelier_id', $atelier2->id)
            ->where('statut', 'TERMINE')
            ->first();

        $serviceTermine2 = Service::where('client_id', $client2->id)
            ->where('atelier_id', $atelier1->id)
            ->where('statut', 'TERMINE')
            ->first();

        if ($serviceTermine1) {
            Avis::create([
                'client_id'   => $client1->id,
                'atelier_id'  => $atelier2->id,
                'service_id'  => $serviceTermine1->id,
                'note'        => 5,
                'commentaire' => 'Excellent travail ! L\'armoire a été réparée parfaitement, très professionnel et rapide.',
            ]);
        }

        if ($serviceTermine2) {
            Avis::create([
                'client_id'   => $client2->id,
                'atelier_id'  => $atelier1->id,
                'service_id'  => $serviceTermine2->id,
                'note'        => 4,
                'commentaire' => 'Très bon travail sur les grilles. Légèrement en retard sur le délai prévu mais le résultat est impeccable.',
            ]);
        }

        $this->command->info('✅ Avis seedés (2 avis sur services terminés)');
    }
}