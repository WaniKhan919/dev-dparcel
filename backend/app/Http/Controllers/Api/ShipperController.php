<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderOfferResource;
use App\Models\Order;
use App\Models\OrderOffer;
use App\Models\OrderTracking;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function sendRequest(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'order_id'          => 'required|string',
                'offer_price'       => 'required|numeric|min:0',
                'services'          => 'nullable|array',
                'services.*.service_id' => 'nullable|integer|exists:services,id',
                'services.*.title'  => 'nullable|string',
                'services.*.price'  => 'required_with:services.*|numeric|min:0',
            ]);

            $orderId = decrypt($request->order_id);

            // Create main offer
            $orderOffer = OrderOffer::create([
                'order_id'    => $orderId,
                'user_id'     => Auth::id(),
                'message'     => $request->message ?? null,
                'status'      => 'pending',
                'offer_price' => $request->offer_price,
            ]);

            // Store services in order_offer_prices
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $service) {
                    $orderOffer->additionalPrices()->create([
                        'service_id' => $service['service_id'] ?? null, // selected → id store, additional → null
                        'title'      => $service['title'] ?? null,       // selected → null, additional → title store
                        'price'      => $service['price'],
                    ]);
                }
            }

            // Order tracking
            $order = Order::with('user')->findOrFail($orderId);

            OrderTracking::create([
                'order_id'  => $orderId,
                'status_id' => 2, // Offer Placed
            ]);

            // Email
            $emailData = [
                'user_name'      => $order->user->name,
                'request_number' => $order->request_number,
                'offer_price'    => $orderOffer->offer_price,
                'dashboard_url'  => env('REACT_APP') . '/shopper/view/request',
            ];

            sendEmail(
                $order->user->email,
                'An Offer is placed against your order!',
                'emails.shopper.orders.offer-send',
                $emailData
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Offer has been sent successfully',
                'data'    => $orderOffer->load('additionalPrices'),
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to send offer',
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
                'additionalPrices',
                'order.orderServices.Service',
                'order.orderStatus:id,name',
                'order.shippingType:id,title,slug',
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

            // ✅ modify data here
            $data = collect($orderOffers->items())->map(function ($offer) {

                $offerPrice = (float) $offer->offer_price;

                $additionalSum = collect($offer->additionalPrices)
                    ->sum(function ($item) {
                        return (float) $item->price;
                    });

                $totalOfferPrice = $offerPrice + $additionalSum;

                $orderTotal = (float) optional($offer->order)->total_price;

                $totalPayablePrice = $orderTotal + $totalOfferPrice;

                // add new fields
                $offer->price_breakdown = [
                    'offer_price' => $offerPrice,
                    'additional_total' => $additionalSum,
                    'total_offer_price' => $totalOfferPrice,
                    'order_price' => $orderTotal,
                    'total_payable_price' => $totalPayablePrice,
                ];

                return $offer;
            });

            return response()->json([
                'success' => true,
                'data'    => OrderOfferResource::collection($data),
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
            $user    = Auth::user();
            $perPage = (int) $request->get('per_page', 10);
            $status  = $request->get('status');

            $orders = Order::with([
                'shippingType:id,title,slug',
                'orderServices.service',
                'orderDetails.product',
                'user',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name',
                'orderStatus:id,name',
                'offers' => function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                    ->with('additionalPrices.service');
                },
            ])
                ->whereHas('offers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderByDesc('id')
                ->paginate($perPage);

            $orders->getCollection()->transform(function ($order) use ($user) {

                $myOffer = $order->offers->first();

                $offerPrice    = $myOffer ? (float) $myOffer->offer_price : 0;
                $servicesTotal = $myOffer
                    ? $myOffer->additionalPrices->sum(fn($p) => (float) $p->price)
                    : 0;

                $shippingType = $order->shippingType;

                return [
                    'id'                 => encrypt($order->id),
                    'request_number'     => $order->request_number,
                    'order_status'       => $order->orderStatus->name,
                    'total_aprox_weight' => $order->total_aprox_weight,

                    // Shipping type
                    'shipping_type_id'   => $order->shipping_type_id,
                    'shipping_type'      => $shippingType?->title,
                    'shipping_type_slug' => $shippingType?->slug,

                    // Location
                    'ship_from_country'  => $order->shipFromCountry?->name,
                    'ship_from_state'    => $order->shipFromState?->name,
                    'ship_from_city'     => $order->shipFromCity?->name,
                    'ship_to_country'    => $order->shipToCountry?->name,
                    'ship_to_state'      => $order->shipToState?->name,
                    'ship_to_city'       => $order->shipToCity?->name,

                    // Price breakdown
                    'price_breakdown'    => [
                        'initial_price'  => (float) $order->total_price,
                        'offer_price'    => $offerPrice,
                        'services_total' => $servicesTotal,
                        'stripe_fee'     => (float) $order->stripe_fee,
                        'service_fee'    => (float) $order->service_fee,
                        'grand_total'    => (float) $order->grand_total,
                        'total_payable'  => (float) $order->grand_total + $offerPrice + $servicesTotal,
                    ],

                    // My offer detail
                    'my_offer'           => $myOffer ? [
                        'id'              => $myOffer->id,
                        'status'          => $myOffer->status,
                        'offer_price'     => (float) $myOffer->offer_price,
                        'services'        => $myOffer->additionalPrices->map(fn($p) => [
                            'id'         => $p->id,
                            'service_id' => $p->service_id,
                            'title'      => $p->service?->title ?? $p->title,
                            'price'      => (float) $p->price,
                        ]),
                        'services_total'  => $servicesTotal,
                        'total'           => $offerPrice + $servicesTotal,
                    ] : null,

                    // Relations
                    'order_details'      => $order->orderDetails,
                    'order_services'     => $order->orderServices,
                    'user'               => $order->user,
                ];
            });

            return response()->json([
                'success' => true,
                'data'    => $orders->items(),
                'meta'    => [
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
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
