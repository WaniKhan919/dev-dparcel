<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductTracking;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function approveProduct(Request $request)
    {
        // Validation
        $request->validate([
            'product_id' => 'required|integer|exists:product_trackings,product_id',
            'status'     => 'required|in:1,2', // 1 = approve, 2 = reject
        ]);

        try {
            DB::beginTransaction();

            // Get the product tracking record
            $tracking = ProductTracking::where('product_id', $request->product_id)->firstOrFail();

            // Update status
            $tracking->status = $request->status;
            $tracking->save();

            DB::commit();

            // Dynamic message based on status
            $statusMessage = $request->status == 1 ? 'approved' : 'rejected';

            return response()->json([
                'status'  => true,
                'message' => "Product has been {$statusMessage} successfully.",
                'data'    => [
                    'product_id' => $tracking->product_id,
                    'status'     => $tracking->status,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update product status.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
