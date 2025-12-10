<?php

namespace App\Http\Controllers\Api;

use App\Models\OrderTracking;
use App\Services\NotificationService;
use Exception;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\OrderOffer;
use App\Models\OrderService;
use App\Models\OrderStatus;
use App\Models\PaymentSetting;
use App\Models\Service;
use App\Models\User;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();

            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with([
                'orderDetails.product',
                'acceptedOffer',
                'orderPayment',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name'
            ])
                ->where('user_id', $userId)
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders->items(), // actual records
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

            $query = Order::with(['orderDetails.product', 'orderOffer.shipper', 'user', 'orderStatus'])
                ->orderBy('id', 'desc');

            // ✅ Apply filters only if present
            if (!empty($requestNumber)) {
                $query->where('request_number', 'like', "%{$requestNumber}%");
            }

            if (!empty($status)) {
                $query->where('status', $status);
            }

            if (!empty($shipFrom)) {
                $query->where('ship_from', $shipFrom);
            }

            if (!empty($shipTo)) {
                $query->where('ship_to', $shipTo);
            }

            if (!empty($date)) {
                $query->whereDate('created_at', $date);
            }

            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders->items(),
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
                'service_type' => 'required|in:buy_for_me,ship_for_me',
                'ship_from_country_id' => 'required|exists:countries,id',
                'ship_from_state_id'   => 'required|exists:states,id',
                'ship_from_city_id'    => 'required|exists:cities,id',
                'ship_to_country_id'   => 'required|exists:countries,id',
                'ship_to_state_id'     => 'required|exists:states,id',
                'ship_to_city_id'      => 'required|exists:cities,id',
                'products' => 'required|array|min:1',
                'products.*.title' => 'required|string|max:255',
                'products.*.product_url' => 'required|string',
                'products.*.price' => 'required|numeric|min:0',
                'products.*.quantity' => 'required|integer|min:1',
                'products.*.weight' => 'nullable|numeric|min:0',
                'services' => 'nullable|array',
                'services.*.service_id' => 'required|exists:services,id',
            ]);

            // Generate unique tracking number
            do {
                $trackingNumber = 'TRK-' . strtoupper(Str::random(10));
            } while (Order::where('tracking_number', $trackingNumber)->exists());

            // Create Order
            $order = Order::create([
                'user_id' => $userId,
                'service_type' => $validated['service_type'],
                'ship_from_country_id' => $validated['ship_from_country_id'],
                'ship_from_state_id' => $validated['ship_from_state_id'],
                'ship_from_city_id' => $validated['ship_from_city_id'],
                'ship_to_country_id' => $validated['ship_to_country_id'],
                'ship_to_state_id' => $validated['ship_to_state_id'],
                'ship_to_city_id' => $validated['ship_to_city_id'],
                'total_aprox_weight' => 0,
                'total_price' => 0,
                'tracking_number' => $trackingNumber,
            ]);

            $type = $validated['service_type'] === "ship_for_me" ? 2 : 1;
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

                if($type == 1){
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
                        'service_id' => $s['service_id'],
                    ]);

                    $service = Service::find($s['service_id']);
                    $totalPrice += $service->price ?? 0;
                }
            }

            // Track order
            OrderTracking::create([
                'order_id' => $order->id,
                'status_id' => 1, // Pending
                'tracking_number' => $trackingNumber,
            ]);

            // Payment logic
            $user = auth()->user();
            $role = $user->roles()->first();

            $settings = PaymentSetting::where('role_id', $role->id)
                ->where('active', true)
                ->where('shipping_types_id', $type)
                ->get();

            $additionalAmount = 0;
            foreach ($settings as $setting) {
                if ($setting->type === 'percent') {
                    $additionalAmount += ($totalPrice * $setting->amount) / 100;
                } elseif ($setting->type === 'fixed') {
                    $additionalAmount += $setting->amount;
                }
            }

            $finalPrice = $totalPrice + $additionalAmount;

            // Update totals
            $order->update([
                'total_price' => $finalPrice,
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

            $shippers = User::whereHas('roles', fn($q) => $q->where('name', 'shipper'))->get();

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
            $order = Order::with([
                'offers.shipper'
            ])
                ->where('id', $orderId)
                ->firstOrFail();
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
            $offer = OrderOffer::with('order')->findOrFail($offerId);
            $offer->status = $request->status;
            $offer->save();
            if ($request->status == "accepted") {
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
            $tracking = OrderTracking::with('status')->where('order_id', $id)->get();
            if (!$tracking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order tracking not found',
                    'data' => null
                ], 404);
            }
            return response()->json([
                'success' => true,
                'data' => $tracking,
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
            $order = Order::with([
                'orderDetails.product',
                'orderServices.service',
                'orderTrackings.status',
                'customDeclaration.fromCountry',
                'customDeclaration.fromState',
                'customDeclaration.fromCity',
                'customDeclaration.toCountry',
                'customDeclaration.toState',
                'customDeclaration.toCity',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order,
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
