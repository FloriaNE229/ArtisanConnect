<?php

namespace App\Mail;

use App\Models\RendezVous;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConfirmationRendezVousMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param string $statut 'ACCEPTE' | 'REFUSE' | 'ANNULE'
     */
    public function __construct(
        public readonly RendezVous $rendezVous,
        public readonly string     $statut,
    ) {}

    public function envelope(): Envelope
    {
        $sujet = match ($this->statut) {
            'ACCEPTE' => 'Votre rendez-vous a été confirmé ✅',
            'REFUSE'  => 'Votre rendez-vous a été refusé ❌',
            'ANNULE'  => 'Votre rendez-vous a été annulé',
            default   => 'Mise à jour de votre rendez-vous',
        };

        return new Envelope(subject: $sujet);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.confirmation-rendez-vous',
        );
    }
}