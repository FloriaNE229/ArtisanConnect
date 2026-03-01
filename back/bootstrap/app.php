<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        // Commenter si API mobile pure (pas de SPA cookie)
        $middleware->statefulApi();
    })
    ->withSchedule(function (Schedule $schedule) {
        // Rappels RDV envoyés chaque jour à 8h00
        $schedule->command('rdv:rappels')->dailyAt('08:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Retourner JSON pour toutes les erreurs d'auth sur /api/*
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Non authentifié. Veuillez vous connecter.',
                ], 401);
            }
        });

    })->create();