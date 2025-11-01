<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function userProfile(Request $request)
    {
        try {
            $user = $request->user()->load([
                'city.state.country'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile fetched successfully',
                'data'    => [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone,
                    'status'     => $user->status,
                    'city'       => $user->city?->only(['id', 'name']),
                    'state'      => $user->city?->state?->only(['id', 'name']),
                    'country'    => $user->city?->state?->country?->only(['id', 'name']),
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'  => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $request->user()->id,
                'phone' => 'nullable|string|max:20',
                'city_id'   => 'nullable|exists:cities,id',
            ]);

            $user = $request->user();
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data'    => $user->only(['name', 'email', 'phone', 'status']),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function updatePassword(Request $request)
    {
        try {
            $request->validate([
                'old_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed', // requires new_password_confirmation
            ]);

            $user = $request->user();

            // Check old password
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Old password is incorrect',
                ], 400);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
