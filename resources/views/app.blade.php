<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Sistem Informasi Asrama UBT (Roemah 54)') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 text-slate-800">
        {{-- Inertia Root Container --}}
        @inertia

        {{-- Dual Compatibility JSON Script Tag untuk Inertia v2 / v3 Core --}}
        <script data-page="app" type="application/json">{!! json_encode($page ?? ['component' => 'Auth/Login', 'props' => []]) !!}</script>

        {{-- Fallback SPA Container --}}
        <div id="root"></div>

        <noscript>
            <div class="p-8 text-center text-slate-800">
                <h2 class="text-xl font-bold">JavaScript Diperlukan</h2>
                <p class="mt-2 text-sm text-slate-600">Silakan aktifkan JavaScript di peramban Anda untuk menggunakan Sistem Informasi Asrama UBT.</p>
            </div>
        </noscript>
    </body>
</html>
