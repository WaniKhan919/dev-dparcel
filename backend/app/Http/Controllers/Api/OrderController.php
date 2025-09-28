<?php

namespace App\Http\Controllers\Api;

use App\Models\OrderTracking;
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
use App\Models\OrderStatus;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();

            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with(['orderDetails.product','acceptedOffer','orderPayment'])->where('user_id', $userId)
                            ->orderBy('id', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => $orders->items(), // actual records
                'meta'    => [
                    'current_page' => $orders->currentPage(),
                    'last_page'    => $orders->lastPage(),
                    'per_page'     => $orders->perPage(),
                    'total'        => $orders->total(),
                    'next_page_url'=> $orders->nextPageUrl(),
                    'prev_page_url'=> $orders->previousPageUrl(),
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
                'data'    => $order_statuses,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders statuses',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function allOrders(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with(['orderDetails.product','orderOffer.shipper','user'])
                        ->orderBy('id', 'desc')
                        ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => $orders->items(), // actual records
                'meta'    => [
                    'current_page' => $orders->currentPage(),
                    'last_page'    => $orders->lastPage(),
                    'per_page'     => $orders->perPage(),
                    'total'        => $orders->total(),
                    'next_page_url'=> $orders->nextPageUrl(),
                    'prev_page_url'=> $orders->previousPageUrl(),
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
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            
            $userId = Auth::id();
            $validated = $request->validate([
                'service_type' => 'required|in:buy_for_me,ship_for_me',
                'ship_from' => 'required|string|max:255',
                'ship_to' => 'required|string|max:255',
                'order_details' => 'required|array|min:1',
                'order_details.*.product_id' => 'required|exists:products,id',
                'order_details.*.quantity' => 'nullable|integer|min:1',
            ]);

            $totalPrice = 0;
            $totalWeight = 0;

            do {
                $trackingNumber = 'TRK-' . strtoupper(Str::random(10));
            } while (Order::where('tracking_number', $trackingNumber)->exists());

            // create order
            $order = Order::create([
                'user_id' => $userId,
                'service_type' => $validated['service_type'],
                'ship_from' => $validated['ship_from'],
                'ship_to' => $validated['ship_to'],
                'total_aprox_weight' => 0,
                'total_price' => 0,
                'tracking_number' => $trackingNumber,
            ]);
            
            //  loop products
            foreach ($validated['order_details'] as $detail) {
                $product = Product::findOrFail($detail['product_id']);
                $quantity = $detail['quantity'] ?? 1;

                // calculate totals
                $linePrice = $product->price * $quantity;
                $lineWeight = ($product->weight ?? 0) * $quantity;

                $totalPrice += $linePrice;
                $totalWeight += $lineWeight;

                // store order detail
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $product->price,
                    'weight' => $product->weight,
                ]);
            }

            DB::commit();

            // update totals in order
            $order->update([
                'total_price' => $totalPrice,
                'total_aprox_weight' => $totalWeight,
            ]);


            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function getShipperOffers($orderId){
        try{
            $order = Order::with([
                        'offers.shipper'
                    ])
                    ->where('id', $orderId)
                    ->firstOrFail();
            return response()->json([
            'success' => true,
            'data'    => $order
        ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get shipper offers',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function offerStatus(Request $request, $offerId)
    {
        try {
            $request->validate([
                'status' => 'required|in:accepted,rejected',
            ]);

            $offer = OrderOffer::findOrFail($offerId);
            $offer->status = $request->status;
            $offer->save();

            return response()->json([
                'success' => true,
                'message' => "Offer has been {$request->status} successfully.",
                'data'    => $offer,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update offer status',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'order_id'   => 'required|exists:orders,id',
            'status_id'  => 'required|exists:order_statuses,id',
            'remarks'    => 'nullable|string',
            'tracking_number' => 'nullable|string',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:2048',
        ]);

        DB::beginTransaction();

        try {
            // 1. Create order tracking entry
            $tracking = OrderTracking::create([
                'order_id'        => $request->order_id,
                'status_id'       => $request->status_id,
                'remarks'         => $request->remarks,
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
                        'type'       => 1, 
                        'file_path'  => $path,
                        'file_type'  => $file->getClientMimeType(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data'    => $tracking->load('attachments'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderTracking($id){
        try {
            $tracking = OrderTracking::with('status')->where('order_id',$id)->get();
            if (!$tracking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order tracking not found',
                    'data'    => null
                ], 404);
            }
            return response()->json([
                'success' => true,
                'data'    => $tracking,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order tracking',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

}
