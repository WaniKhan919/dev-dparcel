<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema; 
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Schema::defaultStringLength(191); 
        $this->configureRateLimiting();
    }

    protected function configureRateLimiting(): void
    {
        // Login: 5 attempts per minute, keyed by email + IP
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->input('email') . '|' . $request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many login attempts. Please try again after a minute.',
                ], 429));
        });

        // Signup: 5 attempts per minute per IP
        RateLimiter::for('signup', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many signup attempts. Please try again after a minute.',
                ], 429));
        });

        // Forgot password: 3 per minute, keyed by email — prevents spamming a user's inbox
        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->input('email') . '|' . $request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many password reset requests. Please try again after a minute.',
                ], 429));
        });

        // Reset password: 5 attempts per minute per IP
        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many reset attempts. Please try again after a minute.',
                ], 429));
        });

        // OTP verify: 10 per minute per IP
        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many verification attempts. Please try again after a minute.',
                ], 429));
        });

        // Resend OTP: 3 per minute per IP — prevents OTP spam
        RateLimiter::for('resend-otp', function (Request $request) {
            return Limit::perMinute(3)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Too many resend attempts. Please try again after a minute.',
                ], 429));
        });
    }
}
