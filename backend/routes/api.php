<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\BusinessController as AdminBusinessController;
use App\Http\Controllers\Business\QrCodeController;
use App\Http\Controllers\Business\DashboardController;
use App\Http\Controllers\Public\ReviewSessionController;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public Review Flow
    Route::prefix('public')->middleware(\Illuminate\Session\Middleware\StartSession::class)->group(function () {
        Route::get('/review/{token}', [ReviewSessionController::class, 'show']);
        Route::post('/review/{token}/feedback', [ReviewSessionController::class, 'submitFeedback']);
        Route::post('/review/{token}/generate', [ReviewSessionController::class, 'generateDraft']);
    });

    // Dashboard Actions (Requires Authentication)
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated Auth Routes
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Dashboard Stats & Analytics
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/chart', [DashboardController::class, 'chart']);
        Route::get('/dashboard/funnel', [DashboardController::class, 'funnel']);
        Route::get('/dashboard/sentiment', [DashboardController::class, 'sentiment']);
        Route::get('/dashboard/topics', [DashboardController::class, 'topics']);
        Route::get('/dashboard/recent-feedback', [DashboardController::class, 'recentFeedback']);

        // QR Codes, Team, Business, Subscription Operations
        Route::get('/qr-codes', [DashboardController::class, 'qrCodes']);
        Route::get('/team', [DashboardController::class, 'team']);
        Route::get('/business', [DashboardController::class, 'businessInfo']);
        Route::get('/subscription', [DashboardController::class, 'subscription']);
        Route::get('/branches', [DashboardController::class, 'branches']);


        // Admin Operations
        Route::prefix('admin')->group(function () {
            Route::post('/businesses', [AdminBusinessController::class, 'store']);
        });

        // Tenant Operations
        Route::prefix('business')->group(function () {
            Route::post('/qr-codes', [QrCodeController::class, 'store']);
        });
    });
});
