<?php

namespace App\Http\Controllers\Api\Shipper;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;

class ShipperOrderController extends Controller
{
    public function attchTrackingLink(Request $request, $orderId)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'tracking_link' => 'required|url|max:2048',
            ]);

            DB::beginTransaction();

            $order = Order::findOrFail($orderId);
            $order->tracking_link = $validated['tracking_link'];
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tracking link attached successfully.',
                'data' => [
                    'order_id' => $order->id,
                    'tracking_link' => $order->tracking_link,
                ],
            ], 200);
        } catch (ValidationException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('Attach tracking link error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while attaching tracking link.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    public function getOrderDetailForShipper($id)
    {
        try {
            $userId  = Auth::id();
            $orderId = decrypt($id);

            $order = Order::with([
                'shippingType:id,title,slug',
                'orderStatus',
                'orderDetails.product',
                'orderServices.service',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name',
                'offers' => function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                    ->with('additionalPrices.service');
                }
            ])->findOrFail($orderId);

            // Is shipper ki offer
            $myOffer       = $order->offers->first();
            $offerPrice    = $myOffer ? (float) $myOffer->offer_price : 0;
            $servicesTotal = $myOffer
                ? $myOffer->additionalPrices->sum(fn($p) => (float) $p->price)
                : 0;

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'                 => encrypt($order->id),
                    'request_number'     => $order->request_number,
                    'order_status'       => $order->orderStatus?->name,
                    'total_aprox_weight' => $order->total_aprox_weight,

                    'shipping_type_id'   => $order->shipping_type_id,
                    'shipping_type'      => $order->shippingType?->title,
                    'shipping_type_slug' => $order->shippingType?->slug,

                    'ship_from_country'  => $order->shipFromCountry?->name,
                    'ship_from_state'    => $order->shipFromState?->name,
                    'ship_from_city'     => $order->shipFromCity?->name,
                    'ship_to_country'    => $order->shipToCountry?->name,
                    'ship_to_state'      => $order->shipToState?->name,
                    'ship_to_city'       => $order->shipToCity?->name,

                    'price_breakdown'    => [
                        'initial_price'  => (float) $order->total_price,
                        'offer_price'    => $offerPrice,
                        'services_total' => $servicesTotal,
                        'stripe_fee'     => (float) $order->stripe_fee,
                        'service_fee'    => (float) $order->service_fee,
                        'grand_total'    => (float) $order->grand_total,
                        'total_payable'  => (float) $order->grand_total + $offerPrice + $servicesTotal,
                    ],

                    'my_offer'           => $myOffer ? [
                        'id'             => $myOffer->id,
                        'status'         => $myOffer->status,
                        'offer_price'    => $offerPrice,
                        'services'       => $myOffer->additionalPrices->map(fn($p) => [
                            'id'         => $p->id,
                            'service_id' => $p->service_id,
                            'title'      => $p->service?->title ?? $p->title,
                            'price'      => (float) $p->price,
                        ]),
                        'services_total' => $servicesTotal,
                        'total'          => $offerPrice + $servicesTotal,
                    ] : null,

                    'order_details'      => $order->orderDetails,
                    'order_services'     => $order->orderServices,
                    'user'               => $order->user,
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order detail',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
