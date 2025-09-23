<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ShopperRequest;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShipperController extends Controller
{
    public function getRequests(Request $request)
    {
        try {
        $userId = Auth::id();

        $excludedOrders = ShopperRequest::where('user_id', $userId)
            ->whereIn('status', ['accepted', 'rejected', 'cancelled', 'ignored'])
            ->pluck('order_id');

        $orders = Order::with(['orderDetails.product', 'user'])
            ->whereNotIn('id', $excludedOrders)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders,
        ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get request',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function confirmRequest(Request $request)
    {
        try {
            
            $shopperRequest = ShopperRequest::create([
                'order_id' => $request->id,          // order id from request
                'user_id'  => Auth::id(),            // logged in user id
                'message'  => $request->message ?? null, // optional message
                'status'   => $request->status,           // fixed status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Request has been accepted from your side',
                'data'    => $shopperRequest
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

            $shopperRequests = ShopperRequest::with(['order.orderDetails.product'])
                ->where('user_id', $userId)
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => $shopperRequests->items(),
                'meta'    => [
                    'current_page'  => $shopperRequests->currentPage(),
                    'last_page'     => $shopperRequests->lastPage(),
                    'per_page'      => $shopperRequests->perPage(),
                    'total'         => $shopperRequests->total(),
                    'next_page_url' => $shopperRequests->nextPageUrl(),
                    'prev_page_url' => $shopperRequests->previousPageUrl(),
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
