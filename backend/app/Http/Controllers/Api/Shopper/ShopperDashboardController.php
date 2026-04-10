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

    public function shopperPendingOffers()
    {
        try {

            $shopperId = Auth::id();

            $offers = OrderOffer::with([
                    'order:id,user_id,request_number,service_type,total_price',
                    'shipper:id,name',
                    'additionalPrices'
                ])
                ->whereHas('order', function ($query) use ($shopperId) {
                    $query->where('user_id', $shopperId);
                })
                ->whereIn('status', ['pending', 'inprogress'])
                ->latest()
                ->get()
                ->map(function ($offer) {

                    return [
                        'offer_id'        => $offer->id,
                        'order_id'        => $offer->order->id,
                        'request_number'  => $offer->order->request_number,
                        'service_type'    => $offer->order->service_type,
                        'order_total'     => $offer->order->total_price,

                        'shipper_id'      => $offer->shipper->id,
                        'shipper_name'    => $offer->shipper->name,

                        'offer_price'     => $offer->offer_price,
                        'offer_message'   => $offer->message,
                        'offer_status'    => $offer->status,
                        'created_at'      => $offer->created_at->diffForHumans(),
                        'additionalPrices'      => $offer->additionalPrices,
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $offers
            ]);

        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong'
            ], 500);
        }
    }
    public function getShopperCompletedOrders(Request $request)
    {
        try {
            $userId = Auth::id();
            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with([
                    'orderStatus:id,name',
                    'orderDetails.product.customDeclerationProduct'
                ])
                ->where('user_id', $userId)
                ->where('status', '>=', 7)
                ->select(
                    'id',
                    'service_type',
                    'total_aprox_weight',
                    'total_price',
                    'request_number',
                    'tracking_link',
                    'status'
                )
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                    'next_page_url' => $orders->nextPageUrl(),
                    'prev_page_url' => $orders->previousPageUrl(),
                ],
            ], 200);

        } catch (Exception $e) {

            Log::error('Error fetching shopper completed orders', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
}
