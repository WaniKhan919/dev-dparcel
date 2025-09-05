<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use App\Mail\VerifyUserMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /** * Login API */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            // Find user
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }

            // Check password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Check if user is verified
            if (!$user->is_verified) {
                return response()->json([
                    'message' => 'Your account is not verified. Please verify before login.',
                ], 403);
            }

            // Check if user is active
            if ($user->status !== 'active') {
                return response()->json([
                    'message' => 'Your account is inactive. Contact support.',
                ], 403);
            }

            // Create Sanctum token (without ID part)
            $plainToken = $user->createToken('auth_token');
            $tokenParts = explode('|', $plainToken->plainTextToken);
            $onlyToken  = $tokenParts[1];

            return response()->json([
                'message' => 'Login successfully',
                'user'    => [
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'roles'  => $user->roles->pluck('name'),
                ],
                'token'   => $onlyToken,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong during login',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /*** Signup API */
    public function signup(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|confirmed|min:8',
                'role'     => 'required|string|exists:roles,name',
                'phone'    => 'nullable|string|max:20',
            ]);

            // generate verification code
            $verificationCode = rand(100000, 999999);

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone'    => $validated['phone'] ?? null,
                'status'   => 'inactive', // until verified
                'is_verified' => false,
                'verification_code' => $verificationCode,
                'verification_code_expires_at' => now()->addMinutes(15)->toDateTimeString(),
            ]);

            // find role
            $role = Role::where('name', $validated['role'])->firstOrFail();

            // attach role
            $user->roles()->attach($role);

            // send code (email/SMS placeholder)
            Mail::to($user->email)->send(new VerifyUserMail($user->name, $verificationCode));

            return response()->json([
                'message' => 'User registered successfully. Please verify your account using the code sent.',
                'user_id' => $user->id, // frontend can use this for verification step
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong during signup',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required',
                'code'  => 'required',
            ]);

            $user = User::where('id', $request->user_id)->first();

            if (! $user) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            if ($user->is_verified) {
                return response()->json(['message' => 'User already verified.']);
            }

            if ($user->verification_code != $request->code) {
                return response()->json(['error' => 'Invalid verification code.'], 400);
            }
            $now = now();
            $expiresAt = Carbon::parse($user->verification_code_expires_at);

            if ($now > $expiresAt) {
                return response()->json(['error' => 'Verification code expired.'], 400);
            }


            $user->update([
                'is_verified'       => true,
                'status'            => 'active',
                'verification_code' => null,
                'verification_expires_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Account verified successfully.',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Something went wrong during verification.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function resendCode(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            if ($user->is_verified) {
                return response()->json(['message' => 'User already verified.']);
            }

            $newCode = rand(100000, 999999);

            $user->update([
                'verification_code'       => $newCode,
                'verification_expires_at' => Carbon::now()->addMinutes(15),
            ]);

            // TODO: Send new code via email/SMS
            Mail::to($user->email)->send(new VerifyUserMail($user->name, $newCode));

            return response()->json([
                'message' => 'New verification code sent.',
            ]);

        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Something went wrong while resending code.',
                'details' => $e->getMessage()
            ], 500);
        }
    } 

    // Forgot password
    public function forgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $request->email)->firstOrFail();

            // generate reset token
            $token = Str::random(64);

            $user->update([
                'reset_token' => $token,
                'reset_token_expires_at' => Carbon::now()->addMinutes(15),
            ]);

            // send mail (stub)
            Mail::to($user->email)->send(new ResetPasswordMail($user->name, $token));

            return response()->json([
                'message' => 'Password reset link sent to your email.',
                'reset_token' => $token, // For testing only
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong while requesting reset password',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // Reset password
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token'    => 'required|string',
                'password' => 'required|confirmed|min:8',
            ]);

            $user = User::where('reset_token', $request->token)
                        ->where('reset_token_expires_at', '>', Carbon::now())
                        ->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Invalid or expired token',
                ], 400);
            }

            // set new password
            $user->update([
                'password' => Hash::make($request->password),
                'reset_token' => null,
                'reset_token_expires_at' => null,
            ]);

            return response()->json([
                'message' => 'Password has been reset successfully',
            ]);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong while resetting password',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /*** Logout API */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong during logout',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
