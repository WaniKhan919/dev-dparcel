<?php

namespace App\Http\Controllers\Api\Shopper;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShopperOrderController extends Controller
{
    public function getOrderDetail($id)
    {
        try {

            $order = Order::with([
                'orderStatus',
                'orderDetails.product.approvedProductTracking',
                'orderServices.service',
                'acceptedOffer.additionalPrices',
                'acceptedOffer.shipper',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => new OrderResource($order)
            ]);

        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to get order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function markOrderCompleted(Request $request, $orderId)
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);
            $order->status = 9;
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order marked as completed successfully.',
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);

        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Mark order completed error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while updating order status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
