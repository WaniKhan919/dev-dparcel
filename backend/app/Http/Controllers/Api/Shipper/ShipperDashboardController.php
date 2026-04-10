<?php

namespace App\Http\Controllers\Api\Shipper;

use App\Http\Controllers\Controller;
use App\Models\CustomDeclaration;
use App\Models\OrderOffer;
use App\Models\WalletTransaction;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ShipperDashboardController extends Controller
{
    public function orderCount()
    {
        try {
            $userId = Auth::id();
            // Count distinct orders where shipper's offer is accepted
            $acceptedOrderCount = OrderOffer::where('user_id', $userId)
                ->where('status', 'accepted')
                ->distinct('order_id')
                ->count('order_id');

            return response()->json([
                'success' => true,
                'data' => [
                    'accepted_orders' => $acceptedOrderCount,
                ],
            ], 200);
        } catch (Exception $e) {
            // Log the error for debugging
            Log::error('Shipper dashboard analytics error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching dashboard data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function balance()
    {
        try {
            $userId = Auth::id();

            // Total credited amount
            $totalCredit = WalletTransaction::where('user_id', $userId)
                ->where('status', 'completed')
                ->where('transaction_type', 'credit')
                ->sum('amount');

            // Total debited amount
            $totalDebit = WalletTransaction::where('user_id', $userId)
                ->where('status', 'completed')
                ->where('transaction_type', 'debit')
                ->sum('amount');

            // Final balance
            $balance = $totalCredit - $totalDebit;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_credit' => number_format($totalCredit, 2, '.', ''),
                    'total_debit'  => number_format($totalDebit, 2, '.', ''),
                    'balance'      => number_format($balance, 2, '.', ''),
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Shipper wallet balance error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching wallet balance.',
            ], 500);
        }
    }
    public function offerCount()
    {
        try {
            $shipperId = Auth::id();

            $acceptedCount = OrderOffer::where('user_id', $shipperId)
                ->where('status', 'accepted')
                ->count();

            $inProgressCount = OrderOffer::where('user_id', $shipperId)
                ->where('status', 'inprogress')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'accepted' => $acceptedCount,
                    'inprogress' => $inProgressCount,
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Shipper offer count error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch offer stats.',
            ], 500);
        }
    }
    public function getShipperCustomDeclarations(Request $request)
    {
        try {
            $shipperId = Auth::id();
            $perPage = (int) $request->get('per_page', 12);

            $declarations = CustomDeclaration::with([
                'order:id,user_id,request_number,request_number,status,tracking_link',
                'toCountry:id,name',
                'toState:id,name',
                'toCity:id,name',
            ])
                ->where('status', 'approved')
                ->whereHas('order.offers', function ($q) use ($shipperId) {
                    $q->where('user_id', $shipperId)
                        ->where('status', 'accepted');
                })
                ->orderBy('id', 'desc') // latest first
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $declarations->items(),
                'meta' => [
                    'current_page' => $declarations->currentPage(),
                    'last_page' => $declarations->lastPage(),
                    'per_page' => $declarations->perPage(),
                    'total' => $declarations->total(),
                    'next_page_url' => $declarations->nextPageUrl(),
                    'prev_page_url' => $declarations->previousPageUrl(),
                ],
            ], 200);
        } catch (\Exception $e) {

            Log::error('Error fetching shipper custom declarations', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get custom declarations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
