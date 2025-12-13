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
}
