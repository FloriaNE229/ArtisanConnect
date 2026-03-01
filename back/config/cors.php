<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',   // Vite (React par défaut)
        'http://localhost:3000',   // Create React App
        'http://localhost:4173',   // Vite preview
        // 'https://ton-domaine-production.com',  // ← ajouter en prod
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,  // ← obligatoire pour Sanctum
];