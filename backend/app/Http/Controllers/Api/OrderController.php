<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
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

            // create order
            $order = Order::create([
                'user_id' => $userId,
                'service_type' => $validated['service_type'],
                'ship_from' => $validated['ship_from'],
                'ship_to' => $validated['ship_to'],
                'total_aprox_weight' => 0,
                'total_price' => 0,
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
