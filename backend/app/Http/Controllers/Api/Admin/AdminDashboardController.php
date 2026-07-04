<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderOffer;
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
            $shipForMe = Order::whereHas('shippingType', function ($q) {
                    $q->where('slug', 'ship_for_me');
                })
                ->count();;

            // Total Buy For Me orders
            $buyForMe = Order::whereHas('shippingType', function ($q) {
                    $q->where('slug', 'buy_for_me');
                })
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
            Log::error('Admin dashboard analytics error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching dashboard data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function pendingOffers(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            $offers = OrderOffer::with([
                'shipper:id,name,email',
                'order.user:id,name,email',
                'order.shippingType:id,name,slug',
                'order.shipFromCountry:id,name',
                'order.shipToCountry:id,name',
                'additionalPrices',
            ])
                ->where('admin_approval_status', 'pending')
                ->orderByDesc('id')
                ->paginate($perPage);

            $data = $offers->map(function ($offer) {
                $totalOffer = (float) $offer->offer_price
                    + $offer->additionalPrices->sum(fn($p) => (float) $p->price);

                return [
                    'id'                    => encrypt($offer->id),
                    'offer_price'           => $offer->offer_price,
                    'total_offer_price'     => round($totalOffer, 2),
                    'admin_approval_status' => $offer->admin_approval_status,
                    'shipper'               => $offer->shipper ? [
                        'name'  => $offer->shipper->name,
                        'email' => $offer->shipper->email,
                    ] : null,
                    'additional_prices'     => $offer->additionalPrices->map(fn($p) => [
                        'title' => $p->title,
                        'price' => $p->price,
                    ])->values(),
                    'order' => $offer->order ? [
                        'request_number'  => $offer->order->request_number,
                        'service_type'    => $offer->order->shippingType?->slug,
                        'ship_from'       => $offer->order->shipFromCountry?->name,
                        'ship_to'         => $offer->order->shipToCountry?->name,
                        'ship_to_city'    => $offer->order->ship_to_city,
                        'ship_to_address' => $offer->order->ship_to_address,
                        'shopper'         => $offer->order->user ? [
                            'name'  => $offer->order->user->name,
                            'email' => $offer->order->user->email,
                        ] : null,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data'    => $data,
                'meta'    => [
                    'current_page'  => $offers->currentPage(),
                    'last_page'     => $offers->lastPage(),
                    'per_page'      => $offers->perPage(),
                    'total'         => $offers->total(),
                    'next_page_url' => $offers->nextPageUrl(),
                    'prev_page_url' => $offers->previousPageUrl(),
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load pending offers.',
                'error'   => $e->getMessage(),
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
