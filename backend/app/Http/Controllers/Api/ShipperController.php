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
            // Prepare data for email template
            $order = Order::with('user')->where('id',$request->id)->first();
            $emailData = [
                'user_name'      => $order->user->name,
                'order_number'   => $order->request_number,
                'request_number'=> $order->request_number,
                'offer_price'    => $orderOffer->offer_price,
                'offer_message'  => $orderOffer->message,
                'service_type'   => ucfirst(str_replace('_', ' ', $order->service_type)),
                'dashboard_url'  => env('REACT_APP') . '/shopper/view/request'
            ];

            // Use your existing sendEmail helper
            sendEmail($order->user->email, 'Your Order has been Placed Successfully!', 'emails.shopper.orders.offer-send', $emailData);

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
    public function getCurrentOffers(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = (int) $request->get('per_page', 10);
            $status  = $request->get('status'); // 👈 filter from frontend

            // Base query
            $ordersQuery = Order::with([
                'orderServices.service',
                'orderDetails.product',
                'user',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name'
            ])
            ->whereHas('offers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('id');

            // Apply filter directly on orders.status
            if ($status) {
                $ordersQuery->where('status', $status);
            }

            // Paginate
            $orders = $ordersQuery->paginate($perPage);

            // Transform collection
            $orders->getCollection()->transform(function ($order) {
                return [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'service_type' => $order->service_type,
                    'total_aprox_weight' => $order->total_aprox_weight,
                    'total_price' => $order->total_price,
                    'tracking_number' => $order->tracking_number,
                    'request_number' => $order->request_number,
                    'status' => $order->status,
                    'ship_from_country' => $order->shipFromCountry?->name,
                    'ship_from_state' => $order->shipFromState?->name,
                    'ship_from_city' => $order->shipFromCity?->name,
                    'ship_to_country' => $order->shipToCountry?->name,
                    'ship_to_state' => $order->shipToState?->name,
                    'ship_to_city' => $order->shipToCity?->name,
                    'order_details' => $order->orderDetails,
                    'order_services' => $order->orderServices,
                    'user' => $order->user,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
                'meta' => [
                    'current_page'  => $orders->currentPage(),
                    'last_page'     => $orders->lastPage(),
                    'per_page'      => $orders->perPage(),
                    'total'         => $orders->total(),
                    'next_page_url' => $orders->nextPageUrl(),
                    'prev_page_url' => $orders->previousPageUrl(),
                ],
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
