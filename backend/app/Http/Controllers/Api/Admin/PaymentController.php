<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\OrderPaymentResource;
use App\Models\OrderPayment;
use Exception;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = (int) $request->get('per_page', 10);

            $payments = OrderPayment::with(['shopper','shipper','order'])
                            ->orderBy('id', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data'    => OrderPaymentResource::collection($payments->items()),
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
