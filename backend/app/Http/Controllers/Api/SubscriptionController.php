<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShipperLevel;
use App\Models\ShipperSubscription;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Make sure the user is a shipper
            if (!$user->hasRole('shipper')) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Fetch all shipper levels with current user's active subscription (if any)
            $levels = ShipperLevel::with([
                'subscriptions' => function ($query) use ($user) {
                    $query->where('shipper_id', $user->id)
                        ->where('status', 'active')
                        ->latest('start_date');
                }
            ])->get();

            return response()->json([
                'success' => true,
                'data' => $levels,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Something went wrong while fetching subscriptions.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
    public function subscribe(Request $request)
    {
        try {
            $request->validate([
                'shipper_level_id' => 'required|exists:shipper_levels,id',
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string',
                'stripe_payment_intent' => 'required|string',
                'stripe_payment_method' => 'required|string',
                // 'status' => 'required|in:active,pending,expired',
            ]);

            
            $userId = Auth::id();
            
            ShipperSubscription::where('shipper_id', $userId)
                ->where('shipper_level_id', $request->shipper_level_id)
                ->where('status', 'active')
                ->update(['status' => 'expired', 'end_date' => Carbon::now()]);

            $level = ShipperLevel::findOrFail($request->shipper_level_id);
            $durationDays = $level->duration_days ?? 30;

            $subscription = ShipperSubscription::create([
                'shipper_id' => $userId,
                'shipper_level_id' => $request->shipper_level_id,
                'amount' => $request->amount,
                'status' => $request->status,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addDays($durationDays),
                'currency' => $request->currency,
                'stripe_payment_intent' => $request->stripe_payment_intent,
                'stripe_payment_method' => $request->stripe_payment_method,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription activated successfully!',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to store subscription',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
    public function shipperActiveSubscription()
    {
        try {
            $user = Auth::user();
            $activeSubscription = $user->activeSubscription()->first();

            if ($activeSubscription) {
                return response()->json([
                    'success' => true,
                    'data' => $activeSubscription,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription found.',
                ]);
            }

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Something went wrong while fetching subscriptions.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
