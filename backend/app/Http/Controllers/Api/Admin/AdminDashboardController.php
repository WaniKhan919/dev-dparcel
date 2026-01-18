<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\WalletTransaction;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    public function recordCount()
    {
        try {
            // Total orders
            $totalOrders = Order::count();

            // Total Ship For Me orders
            $shipForMe = Order::where('service_type', 'ship_for_me')->count();

            // Total Buy For Me orders
            $buyForMe = Order::where('service_type', 'buy_for_me')->count();

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
            Log::error('Admin dashboard analytics error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching dashboard data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function currentBalance()
    {
        try {
            $user = Auth::user();

            if (!$user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can access this data.'
                ], 403);
            }

            // 1. Total Commission (only from completed transactions)
            $totalCommission = WalletTransaction::where('status', 'completed')
                ->sum('commission');

            // 2. Total Master Account Amount (pending + reversed amounts)
            $masterAmount = WalletTransaction::whereIn('status', ['pending', 'reversed'])
                ->sum('amount');

            return response()->json([
                'success' => true,
                'total_commission' => number_format($totalCommission, 2),
                'master_account_amount' => number_format($masterAmount, 2),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load admin wallet data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
