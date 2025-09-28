<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderPaymentResource;
use App\Models\OrderPayment;
use Auth;
use Exception;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $perPage = (int) $request->get('per_page', 10);

            $payments = OrderPayment::with(['shopper','shipper','order'])->where('shopper_id', $userId)
                            ->orderBy('id', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => OrderPaymentResource::collection($payments->items()), // actual records
                'meta'    => [
                    'current_page' => $payments->currentPage(),
                    'last_page'    => $payments->lastPage(),
                    'per_page'     => $payments->perPage(),
                    'total'        => $payments->total(),
                    'next_page_url'=> $payments->nextPageUrl(),
                    'prev_page_url'=> $payments->previousPageUrl(),
                ],
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get payments',
                'error'   => $e->getMessage()
            ], 500);
        }

    }
}
