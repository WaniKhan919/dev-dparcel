<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderOffer;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShipperController extends Controller
{
    public function getRequests(Request $request)
    {
        try {
            $user = Auth::user();

            $data = $user->subscriptionsWithOrders();

            // If no subscriptions or orders
            if ($data['orders']->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No orders available for your subscription level.'
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => $data['orders'],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function confirmRequest(Request $request)
    {
        try {

            $orderOffer = OrderOffer::create([
                'order_id' => $request->id,          // order id from request
                'user_id'  => Auth::id(),            // logged in user id
                'message'  => $request->message ?? null, // optional message
                'status'   => $request->status,           // fixed status
                'offer_price'   => $request->offerPrice,           // fixed status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Offer has been sent from your side',
                'data'    => $orderOffer
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm request',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function getMyOffers(Request $request)
    {
        try {
            $userId = Auth::id();

            $perPage = (int) $request->get('per_page', 10);

            $orderOffers = OrderOffer::with([
                                'order.orderDetails.product',
                                'order.shipFromCountry:id,name',
                                'order.shipFromState:id,name',
                                'order.shipFromCity:id,name',
                                'order.shipToCountry:id,name',
                                'order.shipToState:id,name',
                                'order.shipToCity:id,name',
                            ])
                            ->where('user_id', $userId)
                            ->orderBy('id', 'desc')
                            ->paginate($perPage);


            return response()->json([
                'success' => true,
                'data'    => $orderOffers->items(),
                'meta'    => [
                    'current_page'  => $orderOffers->currentPage(),
                    'last_page'     => $orderOffers->lastPage(),
                    'per_page'      => $orderOffers->perPage(),
                    'total'         => $orderOffers->total(),
                    'next_page_url' => $orderOffers->nextPageUrl(),
                    'prev_page_url' => $orderOffers->previousPageUrl(),
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get requests',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function getNewOffers(Request $request){
        try {
            $user = Auth::user();

            $orderIds = OrderOffer::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'inprogress', 'accepted'])
                ->pluck('order_id');

            if ($orderIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No active orders found.'
                ], 200);
            }

            $orders = Order::with([
                    'orderDetails.product',
                    'user',
                    'shipFromCountry',
                    'shipFromState',
                    'shipFromCity',
                    'shipToCountry',
                    'shipToState',
                    'shipToCity'
                ])
                ->whereIn('id', $orderIds)
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'user_id' => $order->user_id,
                        'service_type' => $order->service_type,
                        'total_aprox_weight' => $order->total_aprox_weight,
                        'total_price' => $order->total_price,
                        'tracking_number' => $order->tracking_number,
                        'request_number' => $order->request_number,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                        'ship_from_country' => $order->shipFromCountry?->name,
                        'ship_from_state' => $order->shipFromState?->name,
                        'ship_from_city' => $order->shipFromCity?->name,
                        'ship_to_country' => $order->shipToCountry?->name,
                        'ship_to_state' => $order->shipToState?->name,
                        'ship_to_city' => $order->shipToCity?->name,
                        'order_details' => $order->orderDetails,
                        'user' => $order->user,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $orders,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get active requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
