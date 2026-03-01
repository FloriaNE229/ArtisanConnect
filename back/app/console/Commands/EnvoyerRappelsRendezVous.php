<?php

namespace App\Console\Commands;

use App\Mail\RappelRendezVousMail;
use App\Models\RendezVous;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Commande à planifier quotidiennement dans bootstrap/app.php :
 *   ->daily()
 *
 * Elle envoie un email + une notification in-app à tous les clients
 * ayant un RDV accepté le lendemain.
 */
class EnvoyerRappelsRendezVous extends Command
{
    protected $signature   = 'rdv:rappels';
    protected $description = 'Envoie les rappels email pour les rendez-vous du lendemain';

    public function __construct(private NotificationService $notifService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $demain = now()->addDay()->toDateString();

        $rdvs = RendezVous::with(['client', 'atelier'])
            ->whereDate('date_rdv', $demain)
            ->where('statut', 'ACCEPTE')
            ->get();

        if ($rdvs->isEmpty()) {
            $this->info('Aucun rendez-vous à rappeler pour demain.');
            return self::SUCCESS;
        }

        foreach ($rdvs as $rdv) {
            // Email de rappel
            Mail::to($rdv->client->email)->send(new RappelRendezVousMail($rdv));

            // Notification in-app
            $this->notifService->rappelRendezVous($rdv);

            $this->info("Rappel envoyé à {$rdv->client->email} pour le RDV #{$rdv->id}");
        }

        $this->info("✅ {$rdvs->count()} rappel(s) envoyé(s).");
        return self::SUCCESS;
    }
}