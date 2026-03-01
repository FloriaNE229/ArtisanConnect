<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\RendezVous;
use App\Models\Service;
use App\Models\ServiceImmediat;
use App\Models\User;

class NotificationService
{
    /**
     * Crée une notification en base.
     */
    public function envoyer(
        int    $destinataireId,
        string $type,
        string $message,
        ?int   $referenceId   = null,
        ?string $referenceType = null
    ): Notification {
        return Notification::create([
            'destinataire_id' => $destinataireId,
            'type'            => $type,
            'message'         => $message,
            'reference_id'    => $referenceId,
            'reference_type'  => $referenceType,
            'lu'              => false,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // RENDEZ-VOUS
    // ─────────────────────────────────────────────────────────

    public function nouveauRendezVous(RendezVous $rdv): void
    {
        $artisanUserId = $rdv->atelier->artisan->utilisateur_id;
        $clientNom     = $rdv->client->prenom . ' ' . $rdv->client->nom;

        $this->envoyer(
            $artisanUserId,
            Notification::TYPE_NOUVEAU_RDV,
            "Nouvelle demande de rendez-vous de {$clientNom} le " . $rdv->date_rdv->format('d/m/Y à H:i') . '.',
            $rdv->id,
            'rendez_vous'
        );
    }

    public function rdvAccepte(RendezVous $rdv): void
    {
        $this->envoyer(
            $rdv->client_id,
            Notification::TYPE_RDV_ACCEPTE,
            "Votre rendez-vous du " . $rdv->date_rdv->format('d/m/Y à H:i') . " a été accepté par l'atelier « {$rdv->atelier->nom} ».",
            $rdv->id,
            'rendez_vous'
        );
    }

    public function rdvRefuse(RendezVous $rdv): void
    {
        $this->envoyer(
            $rdv->client_id,
            Notification::TYPE_RDV_REFUSE,
            "Votre rendez-vous du " . $rdv->date_rdv->format('d/m/Y à H:i') . " a été refusé par l'atelier « {$rdv->atelier->nom} ».",
            $rdv->id,
            'rendez_vous'
        );
    }

    public function rdvAnnule(RendezVous $rdv, bool $parClient = true): void
    {
        if ($parClient) {
            // Notifier l'artisan
            $destinataire = $rdv->atelier->artisan->utilisateur_id;
            $clientNom    = $rdv->client->prenom . ' ' . $rdv->client->nom;
            $message      = "{$clientNom} a annulé son rendez-vous du " . $rdv->date_rdv->format('d/m/Y à H:i') . '.';
        } else {
            // Notifier le client
            $destinataire = $rdv->client_id;
            $message      = "L'atelier « {$rdv->atelier->nom} » a annulé votre rendez-vous du " . $rdv->date_rdv->format('d/m/Y à H:i') . '.';
        }

        $this->envoyer($destinataire, Notification::TYPE_RDV_ANNULE, $message, $rdv->id, 'rendez_vous');
    }

    public function rappelRendezVous(RendezVous $rdv): void
    {
        $this->envoyer(
            $rdv->client_id,
            Notification::TYPE_NOUVEAU_RDV,
            "Rappel : vous avez un rendez-vous demain le " . $rdv->date_rdv->format('d/m/Y à H:i') . " à l'atelier « {$rdv->atelier->nom} ».",
            $rdv->id,
            'rendez_vous'
        );
    }

    // ─────────────────────────────────────────────────────────
    // SERVICES
    // ─────────────────────────────────────────────────────────

    public function nouveauService(Service $service): void
    {
        $artisanUserId = $service->atelier->artisan->utilisateur_id;
        $clientNom     = $service->client->prenom . ' ' . $service->client->nom;

        $this->envoyer(
            $artisanUserId,
            Notification::TYPE_NOUVEAU_SERVICE,
            "Nouvelle demande de service de {$clientNom}.",
            $service->id,
            'services'
        );
    }

    public function serviceAccepte(Service $service): void
    {
        $this->envoyer(
            $service->client_id,
            Notification::TYPE_SERVICE_ACCEPTE,
            "Votre demande de service a été acceptée par l'atelier « {$service->atelier->nom} ».",
            $service->id,
            'services'
        );
    }

    public function serviceRefuse(Service $service): void
    {
        $this->envoyer(
            $service->client_id,
            Notification::TYPE_SERVICE_REFUSE,
            "Votre demande de service a été refusée par l'atelier « {$service->atelier->nom} ».",
            $service->id,
            'services'
        );
    }

    public function serviceTermine(Service $service): void
    {
        $this->envoyer(
            $service->client_id,
            Notification::TYPE_SERVICE_TERMINE,
            "Votre service avec l'atelier « {$service->atelier->nom} » est terminé. N'hésitez pas à laisser un avis !",
            $service->id,
            'services'
        );
    }

    // ─────────────────────────────────────────────────────────
    // SERVICE IMMÉDIAT
    // ─────────────────────────────────────────────────────────

    public function serviceImmediatDisponible(ServiceImmediat $si, int $artisanUserId): void
    {
        $clientNom = $si->client->prenom . ' ' . $si->client->nom;

        $this->envoyer(
            $artisanUserId,
            Notification::TYPE_SERVICE_IMMEDIAT,
            "Nouvelle demande de service immédiat ({$si->domaine}) de {$clientNom} à « {$si->localisation} ».",
            $si->id,
            'services_immediats'
        );
    }

    public function artisanEnRoute(ServiceImmediat $si): void
    {
        $artisanNom = $si->artisanAcceptant->utilisateur->prenom . ' ' . $si->artisanAcceptant->utilisateur->nom;

        $this->envoyer(
            $si->client_id,
            Notification::TYPE_ARTISAN_EN_ROUTE,
            "L'artisan {$artisanNom} est en route pour votre service immédiat.",
            $si->id,
            'services_immediats'
        );
    }
}