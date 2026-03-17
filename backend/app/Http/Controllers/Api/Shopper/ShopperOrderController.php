<?php

namespace App\Http\Controllers\Api\Shopper;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;

class ShopperOrderController extends Controller
{
    public function getOrderDetail($id)
    {
        try {

            $order = Order::with([
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
}
