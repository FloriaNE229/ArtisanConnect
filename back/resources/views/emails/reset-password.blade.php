<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Réinitialisation de mot de passe</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .header { background: #1a1a2e; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }
        .body { padding: 32px; color: #333; line-height: 1.7; }
        .body p { margin: 0 0 16px; }
        .btn-wrap { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #e94560; color: #fff; text-decoration: none;
               padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; }
        .expiry { font-size: 13px; color: #888; text-align: center; margin-top: 8px; }
        .footer { background: #f4f4f4; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; }
        .url-fallback { word-break: break-all; font-size: 12px; color: #888; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🔑 Artisan Platform</h1>
    </div>
    <div class="body">
        <p>Bonjour <strong>{{ $prenom }}</strong>,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en définir un nouveau :</p>

        <div class="btn-wrap">
            <a href="{{ $resetUrl }}" class="btn">Réinitialiser mon mot de passe</a>
        </div>
        <p class="expiry">⏱ Ce lien expire dans <strong>60 minutes</strong>.</p>

        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre mot de passe ne sera pas modifié.</p>

        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p class="url-fallback">{{ $resetUrl }}</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Artisan Platform. Tous droits réservés.
    </div>
</div>
</body>
</html>