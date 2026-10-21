<?php

return [

    'name' => env('APP_NAME', 'Portal SI-GABUNG 54'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://asrama-ubt.test'),

    'timezone' => env('APP_TIMEZONE', 'Asia/Jakarta'),

    'locale' => env('APP_LOCALE', 'id'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'id_ID'),

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Clean UI & Testing Mode Settings
    |--------------------------------------------------------------------------
    |
    | 'ui_mode' controls the visual presentation density.
    | Options: 'standard' (full features, banners, dev tools) or 'clean' (minimal testing).
    | 'test_mode' activates UAT-focused flows and suppresses non-essential widgets.
    |
    */
    'ui_mode' => env('APP_UI_MODE', 'standard'),

    'test_mode' => (bool) env('TEST_MODE', false),

];
