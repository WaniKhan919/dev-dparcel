<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();

            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with('orderDetails.product')->where('user_id', $userId)
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
    public function allOrders(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            $orders = Order::with(['orderDetails.product','shopperRequest.shipper','user'])
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
}
