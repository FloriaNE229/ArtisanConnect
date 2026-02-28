<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Rappel rendez-vous</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .header { background: #16213e; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .body { padding: 32px; color: #333; line-height: 1.7; }
        .card { background: #f8f9fa; border-left: 4px solid #e94560; border-radius: 4px; padding: 16px 20px; margin: 24px 0; }
        .card p { margin: 4px 0; font-size: 15px; }
        .card strong { color: #1a1a2e; }
        .footer { background: #f4f4f4; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>📅 Rappel de rendez-vous</h1>
    </div>
    <div class="body">
        <p>Bonjour <strong>{{ $rendezVous->client->prenom }}</strong>,</p>
        <p>Nous vous rappelons que vous avez un rendez-vous <strong>demain</strong> :</p>

        <div class="card">
            <p>🏭 <strong>Atelier :</strong> {{ $rendezVous->atelier->nom }}</p>
            <p>📍 <strong>Localisation :</strong> {{ $rendezVous->atelier->localisation }}</p>
            <p>🕐 <strong>Date & heure :</strong> {{ $rendezVous->date_rdv->format('d/m/Y à H:i') }}</p>
            <p>⏱ <strong>Durée estimée :</strong> {{ $rendezVous->duree_minutes }} minutes</p>
            @if($rendezVous->message)
            <p>💬 <strong>Votre message :</strong> {{ $rendezVous->message }}</p>
            @endif
        </div>

        <p>Pensez à vous préparer à l'avance. En cas d'empêchement, annulez via l'application le plus tôt possible.</p>
        <p>À demain !</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Artisan Platform. Tous droits réservés.
    </div>
</div>
</body>
</html>