<?php

use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RolePermissionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Permissions (Admin only)
Route::get('/permissions', [PermissionController::class, 'index']);
Route::post('/permissions', [PermissionController::class, 'store']);
Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

// Role Permission assignment
Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'assign']);
Route::delete('/roles/{role}/permissions/{permission}', [RolePermissionController::class, 'revoke']);

//Verfiy account
Route::post('/verify', [AuthController::class, 'verify']);
Route::post('/resend-code', [AuthController::class, 'resendCode']);

//Forgot password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);