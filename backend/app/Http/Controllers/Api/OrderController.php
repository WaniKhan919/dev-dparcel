<?php

namespace App\Http\Controllers\Api;

use App\Models\OrderTracking;
use App\Services\NotificationService;
use Exception;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Attachment;
use App\Models\OrderOffer;
use App\Models\OrderService;
use App\Models\OrderStatus;
use App\Models\ProductTracking;
use App\Models\ShippingType;
use App\Models\User;

class OrderController extends Controller
{
    private function calculateAndUpdateFees(Order $order, float $offerPrice = 0)
    {
        $base = (float) $order->total_price + $offerPrice;

        $stripeFee  = ($base * 4.2) / 100;
        $serviceFee = ($base * 10) / 100;
        $grandTotal = $base + $stripeFee + $serviceFee;

        $order->update([
            'stripe_fee'  => $stripeFee,
            'service_fee' => $serviceFee,
            'grand_total' => $grandTotal,
        ]);
    }
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $perPage = (int) $request->get('per_page', 12);

            $orders = Order::with([
                'shippingType:id,title,slug',
                'orderDetails.product',
                'acceptedOffer.additionalPrices',
                'orderPayment',
                'orderStatus',
                'shipFromCountry:id,name',
                'shipToCountry:id,name',
            ])
                ->where('user_id', $userId)
                ->orderBy('id', 'desc')
                ->paginate($perPage);


            return response()->json([
                'success' => true,
                'data'    => OrderResource::collection($orders->items()),
                'meta'    => [
                    'current_page' => $orders->currentPage(),
                    'last_page'    => $orders->lastPage(),
                    'per_page'     => $orders->perPage(),
                    'total'        => $orders->total(),
                    'next_page_url' => $orders->nextPageUrl(),
                    'prev_page_url' => $orders->previousPageUrl(),
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders',
                'error'   => $e->getMessage()
            ], 500);
        }
    }


    public function getOrderStatuses()
    {
        try {
            $order_statuses = OrderStatus::get();

            return response()->json([
                'success' => true,
                'data' => $order_statuses,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders statuses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function allOrders(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            // ✅ Capture filters individually
            $requestNumber = $request->get('request_number');
            $status = $request->get('status');
            $shipFrom = $request->get('ship_from');
            $shipTo = $request->get('ship_to');
            $date = $request->get('date'); // Expected format: YYYY-MM-DD

            $query = Order::with([
                'orderDetails.product',
                'offers.shipper',
                'offers.additionalPrices.service',
                'user',
                'orderStatus',
                'shipFromCountry:id,name',
                'shipToCountry:id,name',
            ])
                ->orderBy('id', 'desc');

            // ✅ Apply filters only if present
            if (!empty($requestNumber)) {
                $query->where('request_number', 'like', "%{$requestNumber}%");
            }

            if (!empty($status)) {
                $query->where('status', $status);
            }

            if (!empty($shipFrom)) {
                $query->where('ship_from_country_id', $shipFrom);
            }

            if (!empty($shipTo)) {
                $query->where('ship_to_country_id', $shipTo);
            }

            if (!empty($date)) {
                $query->whereDate('created_at', $date);
            }

            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => OrderResource::collection($orders),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id();

            $validated = $request->validate([
                'shipping_type_id' => 'required',
                'ship_from_country_id' => 'required|exists:countries,id',
                'ship_to_country_id' => 'required|exists:countries,id',
                'ship_to_city' => 'required|string|max:100',
                'ship_to_address' => 'required|string|max:255',
                'products' => 'required|array|min:1',
                'products.*.title' => 'required|string|max:255',
                'products.*.product_url' => 'required|string',
                'products.*.price' => 'required|numeric|min:0',
                'products.*.quantity' => 'required|integer|min:1',
                'products.*.weight' => 'nullable|numeric|min:0',
                'services' => 'nullable|array',
                'services.*.service_id' => 'required|string',
            ]);
            $shippingTypeId = decrypt($request->shipping_type_id);

            // Create Order
            $order = Order::create([
                'user_id' => $userId,
                'shipping_type_id' => $shippingTypeId,
                'ship_from_country_id' => $validated['ship_from_country_id'],
                'ship_to_country_id' => $validated['ship_to_country_id'],
                'ship_to_city' => $validated['ship_to_city'],
                'ship_to_address' => $validated['ship_to_address'],
                'total_aprox_weight' => 0,
                'total_price' => 0,
                'stripe_fee' => 0,
                'service_fee' => 0,
                'grand_total' => 0,
            ]);
            $shippingType = ShippingType::findOrFail($shippingTypeId);
            $type = $shippingType->slug;
            $totalPrice = 0;
            $totalWeight = 0;

            // Store products
            foreach ($validated['products'] as $index => $p) {
                $product = Product::create([
                    'user_id' => $userId,
                    'title' => $p['title'],
                    'description' => $p['description'] ?? null,
                    'product_url' => $p['product_url'],
                    'quantity' => $p['quantity'],
                    'price' => $p['price'],
                    'weight' => $p['weight'] ?? 0,
                ]);

                $linePrice = $p['price'] * $p['quantity'];
                $lineWeight = ($p['weight'] ?? 0) * $p['quantity'];

                if ($type == "buy_for_me") {
                    $totalPrice += $linePrice;
                }
                $totalWeight += $lineWeight;

                $requestDetailsNumber = $order->request_number . '-' . ($index + 1);

                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $p['quantity'],
                    'price' => $p['price'],
                    'weight' => $p['weight'] ?? 0,
                    'request_details_number' => $requestDetailsNumber,
                ]);
            }

            // Attach optional services
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $s) {
                    OrderService::create([
                        'order_id' => $order->id,
                        'service_id' => decrypt($s['service_id']),
                    ]);
                }
            }

            // Track order
            OrderTracking::create([
                'order_id' => $order->id,
                'status_id' => 1, // Pending
            ]);

            // Payment logic
            $user = auth()->user();
            $role = $user->roles()->first();

            // commented for future
            // $settings = PaymentSetting::where('role_id', $role->id)
            //     ->where('active', true)
            //     ->where('shipping_types_id', $shippingTypeId)
            //     ->get();

            $additionalAmount = 0;
            // foreach ($settings as $setting) {
            //     if ($setting->type === 'percent') {
            //         $additionalAmount += ($totalPrice * $setting->amount) / 100;
            //     } elseif ($setting->type === 'fixed') {
            //         $additionalAmount += $setting->amount;
            //     }
            // }


            // Fees calculate karo
            $stripeFee  = ($totalPrice * 4.2) / 100;  // 4.2% STRIPE FEE 
            $serviceFee = ($totalPrice * 10) / 100;  // 10% DELEVERY PARCEL SERVICE FEE
            $grandTotal = $totalPrice + $stripeFee + $serviceFee;

            // Update totals
            $order->update([
                'total_price'        => $totalPrice,
                'stripe_fee'         => $stripeFee,
                'service_fee'        => $serviceFee,
                'grand_total'        => $grandTotal,
                'total_aprox_weight' => $totalWeight,
            ]);

            // Notifications
            NotificationService::createNotification([
                'user_id' => $userId,
                'sender_id' => null,
                'order_id' => $order->id,
                'type' => 'order',
                'title' => 'Order Request Placed',
                'message' => 'Your order request # ' . $order->request_number . ' has been placed successfully.',
            ]);

            $shippers = User::whereHas('roles', fn($q) => $q->where('name', 'shipper'))->whereHas('serviceAreas', fn($q) => $q->where('country_id', $order->ship_from_country_id))->get();

            foreach ($shippers as $shipper) {
                NotificationService::createNotification([
                    'user_id' => $shipper->id,
                    'sender_id' => $userId,
                    'order_id' => $order->id,
                    'type' => 'order',
                    'title' => 'New Order Request Available',
                    'message' => 'A new request # ' . $order->request_number . ' has been placed. You can place your offer now.',
                ]);
            }

            DB::commit();

            // Prepare data for template
            $emailData = [
                'user_name' => $user->name,
                'order_request_number' => $order->request_number,
                'total_price' => $order->total_price,
                'total_weight' => $order->total_aprox_weight,
                'service_type' => $order->service_type,
            ];

            // Use your existing sendEmail helper
            sendEmail($user->email, 'Your Order has been Placed Successfully!', 'emails.shipper.orders.order_success', $emailData);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $order,
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getShipperOffers($orderId)
    {
        try {
            $orderId = decrypt($orderId);

            $order = Order::with([
                'shippingType:id,title,slug',
                'offers.shipper',
                'offers.additionalPrices.service',
                'acceptedOffer.additionalPrices.service',
                'orderStatus',
                'shipFromCountry:id,name',
                'shipToCountry:id,name',
            ])
                ->where('id', $orderId)
                ->firstOrFail();

            $initialPrice = (float) $order->total_price;

            // Only show admin-approved offers to shopper
            $order->setRelation('offers', $order->offers->where('admin_approval_status', 'approved')->values());

            // =========================
            // OFFERS BREAKDOWN
            // =========================
            $order->offers->transform(function ($offer) use ($initialPrice) {

                $offerPrice = (float) $offer->offer_price;

                $selectedServicesTotal = $offer->additionalPrices
                    ->whereNotNull('service_id')
                    ->sum(fn($i) => (float) $i->price);

                $additionalServicesTotal = $offer->additionalPrices
                    ->whereNull('service_id')
                    ->sum(fn($i) => (float) $i->price);

                // ✅ subtotal first
                $subTotal = $initialPrice
                    + $offerPrice
                    + $selectedServicesTotal
                    + $additionalServicesTotal;
                
                $offerTotal = $offerPrice
                    + $selectedServicesTotal
                    + $additionalServicesTotal;

                // ✅ fees on subtotal
                $stripeFee = ($subTotal * 4.2) / 100;
                $serviceFee = ($subTotal * 10) / 100;

                // ✅ final payable
                $totalPayable = $subTotal + $stripeFee + $serviceFee;

                $offer->price_breakdown = [
                    'initial_price' => $initialPrice,
                    'offer_price' => $offerPrice,

                    'selected_services' => $selectedServicesTotal,
                    'additional_services' => $additionalServicesTotal,

                    'stripe_fee' => round($stripeFee, 2),
                    'service_fee' => round($serviceFee, 2),

                    // before fees
                    'grand_total' => round($subTotal, 2),

                    'offer_total' => round($offerTotal, 2),

                    // after fees
                    'total_payable' => round($totalPayable, 2),
                ];

                return $offer;
            });

            // =========================
            // ORDER LEVEL BREAKDOWN
            // =========================
            $acceptedOfferPrice = (float) ($order->acceptedOffer?->offer_price ?? 0);

            $selectedTotal = $order->acceptedOffer
                ? $order->acceptedOffer->additionalPrices
                    ->whereNotNull('service_id')
                    ->sum(fn($i) => (float) $i->price)
                : 0;

            $additionalTotal = $order->acceptedOffer
                ? $order->acceptedOffer->additionalPrices
                    ->whereNull('service_id')
                    ->sum(fn($i) => (float) $i->price)
                : 0;

            // ✅ subtotal first
            $subTotal = $initialPrice
                + $acceptedOfferPrice
                + $selectedTotal
                + $additionalTotal;

            // ✅ fees on subtotal
            $stripeFee = ($subTotal * 4.2) / 100;
            $serviceFee = ($subTotal * 10) / 100;

            // ✅ final payable
            $totalPayable = $subTotal + $stripeFee + $serviceFee;

            $order->price_breakdown = [
                'initial_price' => $initialPrice,
                'offer_price' => $acceptedOfferPrice,

                'selected_services' => $selectedTotal,
                'additional_services' => $additionalTotal,

                'stripe_fee' => round($stripeFee, 2),
                'service_fee' => round($serviceFee, 2),

                // before fees
                'grand_total' => round($subTotal, 2),

                // after fees
                'total_payable' => round($totalPayable, 2),
            ];

            return response()->json([
                'success' => true,
                'data' => $order
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipper offers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function offerStatus(Request $request, $offerId)
    {
        try {
            $userId = Auth::id();
            $request->validate([
                'status' => 'required|in:accepted,rejected',
            ]);
            $offer = OrderOffer::with(['order', 'shipper','additionalPrices'])->findOrFail($offerId);
            $offer->status = $request->status;
            $offer->save();
            if ($request->status == "accepted") {
                // Base values
                $orderTotalPrice = (float) $offer->order->total_price; // 100
                $offerPrice = (float) $offer->offer_price; // 20

                // Sum of additional prices
                $additionalPricesTotal = $offer->additionalPrices->sum(function ($item) {
                    return (float) $item->price;
                });

                // Grand total before fees
                $subTotal = $orderTotalPrice + $offerPrice + $additionalPricesTotal;

                // Fees
                $stripeFee = ($subTotal * 4.2) / 100;
                $serviceFee = ($subTotal * 10) / 100;

                // Final payable amount
                $totalPayableAmount = $subTotal + $stripeFee + $serviceFee;

                $order = Order::findOrFail($offer->order_id);
                $order->grand_total = $totalPayableAmount;
                $order->status = 3;
                $order->save();

                OrderTracking::insert([
                    [
                        'order_id' => $offer->order_id,
                        'status_id' => 3,
                    ],
                    [
                        'order_id' => $offer->order_id,
                        'status_id' => 4,
                    ]
                ]);
                $shipper_title = "Your Offer Was Accepted";
                $shipper_message = "Your offer for request #{$offer->order->request_number} has been accepted by the shopper.";
                $shopper_title = "You Accepted an Offer";
                $shopper_message = "You accepted an offer for request #{$offer->order->request_number}.";
            } else {
                $shipper_title = "Your Offer Was Rejected";
                $shipper_message = "Your offer for request #{$offer->order->request_number} has been rejected by the shopper.";
                $shopper_title = "You Rejected an Offer";
                $shopper_message = "You rejected an offer for request #{$offer->order->request_number}.";
            }
            NotificationService::createNotification([
                'user_id' => $offer->user_id,
                'sender_id' => $userId,
                'order_id' => $offer->order_id,
                'type' => 'order',
                'title' => $shipper_title,
                'message' => $shipper_message . $offer->order->request_number,
            ]);
            NotificationService::createNotification([
                'user_id' => $userId,
                'sender_id' => null,
                'order_id' => $offer->order_id,
                'type' => 'order',
                'title' => $shopper_title,
                'message' => $shopper_message . $offer->order->request_number,
            ]);
            $shipper = $offer->shipper;

            $emailData = [
                'shipper_name' => $shipper->name,
                'order_number' => $offer->order->request_number,
                'offer_price' => $offer->offer_price,
                'status' => $request->status,
                'dashboard_url' => env('REACT_APP') . '/shipper/requests'
            ];

            $template = $request->status === 'accepted'
                ? 'emails.shopper.orders.offer-accepted'
                : 'emails.shopper.orders.offer-rejected';

            $subject = $request->status === 'accepted'
                ? 'Your Offer Has Been Accepted 🎉'
                : 'Your Offer Has Been Rejected';

            // send email to shipper
            sendEmail(
                $shipper->email,
                $subject,
                $template,
                $emailData
            );

            return response()->json([
                'success' => true,
                'message' => "Offer has been {$request->status} successfully.",
                'data' => $offer,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update offer status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status_id' => 'required|exists:order_statuses,id',
            'remarks' => 'nullable|string',
            'tracking_number' => 'nullable|string',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:2048',
        ]);

        DB::beginTransaction();

        try {
            // 1. Create order tracking entry
            $tracking = OrderTracking::create([
                'order_id' => $request->order_id,
                'status_id' => $request->status_id,
                'remarks' => $request->remarks,
                'tracking_number' => $request->tracking_number,
            ]);

            $order = Order::find($request->order_id);
            $order->status = $request->status_id;
            $order->save();

            // 2. Handle attachments if provided
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('files'), $filename);

                    $path = 'files/' . $filename;

                    Attachment::create([
                        'related_id' => $tracking->id,
                        'type' => 1,
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $tracking->load('attachments'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderTracking($id)
    {
        try {

            // 1️⃣ Get all statuses in correct sequence
            $statuses = OrderStatus::orderBy('id')->get();
            $id = decrypt($id);
            // 2️⃣ Get tracking data for this order
            $trackings = OrderTracking::where('order_id', $id)
                ->get()
                ->keyBy('status_id');

            // 3️⃣ Merge statuses + tracking
            $timeline = $statuses->map(function ($status) use ($trackings) {

                $tracking = $trackings->get($status->id);

                return [
                    'status_id' => $status->id,
                    'status_name' => $status->name,
                    'description' => $status->description,

                    'is_completed' => $tracking ? true : false,

                    'tracking' => $tracking ? [
                        'remarks' => $tracking->remarks,
                        'attachments' => $tracking->attachments,
                        'tracking_number' => $tracking->tracking_number,
                        'created_at' => $tracking->created_at,
                        'updated_at' => $tracking->updated_at,
                    ] : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $timeline
            ]);
        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to get order tracking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderDetail($id)
    {
        try {
            $id = decrypt($id);
            $order = Order::with([
                'orderDetails.product.productTracking',
                'orderServices.service',
                'acceptedOffer.additionalPrices',
                'acceptedOffer.shipper',
                'orderTrackings.status',

                'customDeclaration.toCountry:id,name',
                'customDeclaration.toState:id,name',
                'customDeclaration.toCity:id,name',
                'customDeclaration.products',
                'customDeclaration.products.product',

                'shipFromCountry:id,name',
                'shipToCountry:id,name',
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
    public function insertProductTracking(Request $request)
    {
        try {

            DB::beginTransaction();
            $id = decrypt($request->order_id);

            $order = Order::findOrFail($id);
            $order->status = 6;
            $order->save();
            OrderTracking::create([
                'order_id' => $id,
                'status_id' => 6,
            ]);

            $products = $request->products;

            if (!$products || !is_array($products)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Products data is required'
                ], 422);
            }

            foreach ($products as $index => $product) {

                $receiptPath = null;

                // Handle file upload
                if ($request->hasFile("products.$index.product_receipt")) {

                    $file = $request->file("products.$index.product_receipt");

                    // unique filename
                    $filename = time() . '_' . $file->getClientOriginalName();

                    // destination path
                    $destinationPath = public_path('order/product/invoices');

                    // create folder if not exists
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }

                    // move file
                    $file->move($destinationPath, $filename);

                    $receiptPath = 'order/product/invoices/' . $filename;
                }

                ProductTracking::create([
                    'product_id' => $product['product_id'],
                    'purchase_status' => $product['purchase_status'],
                    'tracking_link' => $product['tracking_link'] ?? null,
                    'tracking_id' => $product['tracking_id'] ?? null,
                    'product_receipt' => $receiptPath,
                    'status' => 0
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product tracking added successfully'
            ], 200);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to insert product tracking',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
