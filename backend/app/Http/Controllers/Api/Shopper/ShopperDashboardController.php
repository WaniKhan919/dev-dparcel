<?php

namespace App\Http\Controllers\Api\Shopper;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderOffer;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ShopperDashboardController extends Controller
{
    public function recordCount()
    {
        try {
            $userId = Auth::id(); // currently logged-in shopper

            // Total orders for this user
            $totalOrders = Order::where('user_id', $userId)->count();

            // Total Ship For Me orders for this user
            $shipForMe = Order::where('user_id', $userId)
                ->where('service_type', 'ship_for_me')
                ->count();

            // Total Buy For Me orders for this user
            $buyForMe = Order::where('user_id', $userId)
                ->where('service_type', 'buy_for_me')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $totalOrders,
                    'ship_for_me' => $shipForMe,
                    'buy_for_me' => $buyForMe,
                ],
            ], 200);
        } catch (Exception $e) {
            // Log the error for debugging
            Log::error('Shopper dashboard analytics error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching dashboard data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function offerStats()
    {
        try {
            $userId = Auth::id(); // logged-in shopper

            // Get shopper's order IDs
            $orderIds = Order::where('user_id', $userId)->pluck('id');

            // Count accepted offers
            $acceptedOffers = OrderOffer::whereIn('order_id', $orderIds)
                ->where('status', 'accepted')
                ->count();

            // Count in-progress offers
            $inProgressOffers = OrderOffer::whereIn('order_id', $orderIds)
                ->where('status', 'inprogress')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'accepted_offers' => $acceptedOffers,
                    'inprogress_offers' => $inProgressOffers,
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Shopper offer stats error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch offer statistics.',
            ], 500);
        }
    }
}
