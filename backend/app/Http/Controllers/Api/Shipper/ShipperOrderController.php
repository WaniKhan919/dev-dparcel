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
}
