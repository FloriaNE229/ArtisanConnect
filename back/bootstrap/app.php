<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
            // ── Enregistrement des alias de middleware ───────────
            $middleware->alias([
                'role' => \App\Http\Middleware\CheckRole::class,
            ]);

            // ── Sanctum : stateful domains (utile pour SPA) ─────
            // Commenter si API mobile pure (pas de cookie)
            //$middleware->statefulApi();    
    })
    ->withExceptions(function (Exceptions $exceptions): void {
         // Retourner du JSON pour les erreurs d'auth (pas de redirect)
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Non authentifié. Veuillez vous connecter.',
                ], 401);
            }
        });
    })->create();
