<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return response()->json([
        'message' => 'Please authenticate via the frontend application.',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000/login')
    ], 401);
})->name('login');
