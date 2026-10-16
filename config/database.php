<?php

return [

    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'asrama_ubt_db'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // Koneksi Database SIMABA (PMB Calon Mahasiswa Baru)
        'simaba' => [
            'driver' => 'mysql',
            'url' => env('DB_SIMABA_URL'),
            'host' => env('DB_SIMABA_HOST', '127.0.0.1'),
            'port' => env('DB_SIMABA_PORT', '3306'),
            'database' => env('DB_SIMABA_DATABASE', 'u540633926_simaba'),
            'username' => env('DB_SIMABA_USERNAME', 'root'),
            'password' => env('DB_SIMABA_PASSWORD', ''),
            'unix_socket' => env('DB_SIMABA_SOCKET', ''),
            'charset' => env('DB_SIMABA_CHARSET', 'utf8mb4'),
            'collation' => env('DB_SIMABA_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

];
