<?php

/**
 * STANDALONE LIVE CRUD TEST RUNNER (LARAGON MYSQL)
 * File: database/test_live_crud.php
 * 
 * Penggunaan langsung:
 * php database/test_live_crud.php
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$status = $kernel->call('asrama:test-live-crud');

exit($status);
