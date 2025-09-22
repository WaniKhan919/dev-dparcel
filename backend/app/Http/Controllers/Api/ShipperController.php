<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ShipperRequest;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShipperController extends Controller
{
    public function getRequests(Request $request)
    {
        try {
        $userId = Auth::id();

        $excludedOrders = ShipperRequest::where('user_id', $userId)
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
            
            $shipperRequest = ShipperRequest::create([
                'order_id' => $request->id,          // order id from request
                'user_id'  => Auth::id(),            // logged in user id
                'message'  => $request->message ?? null, // optional message
                'status'   => $request->status,           // fixed status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Request has been accepted from your side',
                'data'    => $shipperRequest
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

            $shipperRequests = ShipperRequest::with(['order.orderDetails.product'])
                ->where('user_id', $userId)
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => $shipperRequests->items(),
                'meta'    => [
                    'current_page'  => $shipperRequests->currentPage(),
                    'last_page'     => $shipperRequests->lastPage(),
                    'per_page'      => $shipperRequests->perPage(),
                    'total'         => $shipperRequests->total(),
                    'next_page_url' => $shipperRequests->nextPageUrl(),
                    'prev_page_url' => $shipperRequests->previousPageUrl(),
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
