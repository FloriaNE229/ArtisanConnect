<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Confirmation rendez-vous</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .header { padding: 32px; text-align: center; }
        .header.accepte { background: #1b5e20; }
        .header.refuse  { background: #b71c1c; }
        .header.annule  { background: #4a4a4a; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .body { padding: 32px; color: #333; line-height: 1.7; }
        .card { background: #f8f9fa; border-radius: 4px; padding: 16px 20px; margin: 24px 0; }
        .card p { margin: 4px 0; font-size: 15px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
        .badge.accepte { background: #e8f5e9; color: #1b5e20; }
        .badge.refuse  { background: #ffebee; color: #b71c1c; }
        .badge.annule  { background: #eeeeee; color: #4a4a4a; }
        .footer { background: #f4f4f4; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
<div class="wrapper">
    @php
        $cssClass = strtolower($statut);
        $emoji = match($statut) { 'ACCEPTE' => '✅', 'REFUSE' => '❌', default => '🚫' };
        $titre = match($statut) {
            'ACCEPTE' => 'Rendez-vous confirmé',
            'REFUSE'  => 'Rendez-vous refusé',
            default   => 'Rendez-vous annulé',
        };
    @endphp

    <div class="header {{ $cssClass }}">
        <h1>{{ $emoji }} {{ $titre }}</h1>
    </div>
    <div class="body">
        <p>Bonjour <strong>{{ $rendezVous->client->prenom }}</strong>,</p>

        <span class="badge {{ $cssClass }}">{{ $titre }}</span>

        @if($statut === 'ACCEPTE')
        <p>Bonne nouvelle ! L'atelier <strong>{{ $rendezVous->atelier->nom }}</strong> a confirmé votre rendez-vous.</p>
        @elseif($statut === 'REFUSE')
        <p>Malheureusement, l'atelier <strong>{{ $rendezVous->atelier->nom }}</strong> n'est pas en mesure d'honorer votre rendez-vous.</p>
        @else
        <p>Votre rendez-vous avec l'atelier <strong>{{ $rendezVous->atelier->nom }}</strong> a été annulé.</p>
        @endif

        <div class="card">
            <p>🏭 <strong>Atelier :</strong> {{ $rendezVous->atelier->nom }}</p>
            <p>📍 <strong>Localisation :</strong> {{ $rendezVous->atelier->localisation }}</p>
            <p>🕐 <strong>Date & heure :</strong> {{ $rendezVous->date_rdv->format('d/m/Y à H:i') }}</p>
        </div>

        @if($statut === 'REFUSE')
        <p>Vous pouvez choisir un autre créneau ou un autre artisan via l'application.</p>
        @endif
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Artisan Platform. Tous droits réservés.
    </div>
</div>
</body>
</html>