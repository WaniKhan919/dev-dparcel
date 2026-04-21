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
                ->whereHas('shippingType', function ($q) {
                    $q->where('slug', 'ship_for_me');
                })
                ->count();

            // Total Buy For Me orders for this user
            $buyForMe = Order::where('user_id', $userId)
                ->whereHas('shippingType', function ($q) {
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
                'order:id,user_id,request_number,shipping_type_id,total_price,stripe_fee,service_fee,grand_total',
                'order.shippingType:id,title,slug',
                'shipper:id,name',
                'additionalPrices:id,order_offer_id,service_id,title,price',
                'additionalPrices.service:id,title'
            ])
                ->whereHas('order', function ($query) use ($shopperId) {
                    $query->where('user_id', $shopperId);
                })
                ->whereIn('status', ['pending', 'inprogress'])
                ->latest()
                ->get()
                ->map(function ($offer) {
                    $order = $offer->order;

                    $initialPrice = (float) $order->total_price;
                    $stripeFee    = (float) $order->stripe_fee;
                    $serviceFee   = (float) $order->service_fee;
                    $grandTotal   = (float) $order->grand_total;

                    // 🔹 Split additional prices
                    $selectedServices = collect($offer->additionalPrices)
                        ->whereNotNull('service_id');

                    $additionalServices = collect($offer->additionalPrices)
                        ->whereNull('service_id');

                    $selectedServicesTotal = $selectedServices->sum(fn($i) => (float) $i->price);
                    $additionalServicesTotal = $additionalServices->sum(fn($i) => (float) $i->price);

                    $offer_price = (float) $offer->offer_price;

                    // 🔹 Final total
                    $finalTotal = $grandTotal + $selectedServicesTotal + $additionalServicesTotal + $offer_price;

                    return [
                        'offer_id'        => $offer->id,
                        'order_id'        => $order->id,
                        'request_number'  => $order->request_number,
                        'shipping_type'   => $order->shippingType,

                        'shipper_id'      => $offer->shipper->id,
                        'shipper_name'    => $offer->shipper->name,

                        'offer_price'     => (float) $offer->offer_price,
                        'offer_status'    => $offer->status,
                        'created_at'      => $offer->created_at->diffForHumans(),

                        // PRICE BREAKDOWN
                        'price_breakdown' => [
                            'initial_price' => $initialPrice,
                            'stripe_fee'    => $stripeFee,
                            'service_fee'   => $serviceFee,
                            'grand_total'   => $grandTotal,

                            'selected_services' => [
                                'items' => $selectedServices->values(),
                                'total' => $selectedServicesTotal,
                            ],

                            'additional_services' => [
                                'items' => $additionalServices->values(),
                                'total' => $additionalServicesTotal,
                            ],

                            // FIXED
                            'total_payable' => $finalTotal,
                        ],
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $offers
            ]);
        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e
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
