<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RolePermissionController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/verify', [AuthController::class, 'verify']);
Route::post('/resend-code', [AuthController::class, 'resendCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Permissions (Admin only)
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::get('/permission/{id}', [PermissionController::class, 'show']);
    Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Role Permission assignment
    Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'assign']);
    Route::delete('/roles/{role}/permissions/{permission}', [RolePermissionController::class, 'revoke']);

    // User Pofile
    Route::put('/update-profile', [UserController::class, 'updateProfile']);
    Route::put('/update-password', [UserController::class, 'updatePassword']);
});
