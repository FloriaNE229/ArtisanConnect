<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your application. This is
    | configuration only and will not affect actual CORS handling by the
    | framework.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',      // Vite dev server
        'http://localhost:3000',      // Alternative port
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [
        '#^http://localhost:\d+$#',
        '#^http://127\.0\.0\.1:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Length',
        'X-JSON-Response',
    ],

    'max_age' => 0,

    'supports_credentials' => true,

];
