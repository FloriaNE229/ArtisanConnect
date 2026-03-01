<?php

namespace App\Mail;

use App\Models\RendezVous;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RappelRendezVousMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly RendezVous $rendezVous,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rappel – Votre rendez-vous de demain',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rappel-rendez-vous',
        );
    }
}