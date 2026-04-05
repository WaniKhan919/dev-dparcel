<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomDeclaration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;

class CustomDeclarationController extends Controller
{
    /**
     * Get custom declaration by order_id
     */
    public function index($order_id)
    {
        try {
            $declaration = CustomDeclaration::with([
                'user',
                'order',
                'shippingType',
                'toCountry',
                'toState',
                'toCity'
            ])->where('order_id', $order_id)->first();

            if (!$declaration) {
                return response()->json([
                    'success' => false,
                    'message' => 'No custom declaration found for this order.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Custom declaration fetched successfully.',
                'data' => $declaration,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch custom declaration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new custom declaration
     */
    public function store(Request $request){
        $validated = $request->validate([
            'order_id'                  => 'required|exists:orders,id',
            'shipping_type_id'          => 'required|exists:shipping_types,id',
            'to_name'                   => 'required',
            'to_business'               => 'required',
            'to_street'                 => 'required',
            'to_postcode'               => 'required',
            'to_country'                => 'required',
            'to_state'                  => 'required',
            'to_city'                   => 'required',
            'category_commercial_sample'=> 'boolean',
            'category_gift'             => 'boolean',
            'category_returned_goods'   => 'boolean',
            'category_documents'        => 'boolean',
            'category_other'            => 'boolean',
            'explanation'               => 'nullable|string',
            'comments'                  => 'nullable|string',
            'total_declared_value'      => 'nullable|numeric',
            'total_weight'              => 'nullable|numeric',

            'products'                  => 'nullable|array',
            'products.*.id'             => 'required|exists:products,id',
            'products.*.hs_code'        => 'required|string',
            'products.*.origin_country' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $validated['user_id'] = Auth::id();
            $validated['status']  = 'pending';

            $products = $request->input('products', []);

            $declaration = CustomDeclaration::create(
                collect($validated)->except('products')->toArray()
            );

           foreach ($products as $index => $product) {
                $declaration->products()->create([
                    'product_id'     => $product['id'] ?? null,
                    'hs_code'        => $product['hs_code'],
                    'origin_country' => $product['origin_country'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Custom declaration created successfully.',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create custom declaration.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update existing custom declaration
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'shipping_type_id' => 'sometimes|exists:shipping_types,id',

            // TO fields
            'to_name' => 'sometimes|string',
            'to_business' => 'sometimes|string',
            'to_street' => 'sometimes|string',
            'to_postcode' => 'sometimes|string',
            'to_country' => 'sometimes|string',
            'to_state' => 'sometimes|string',
            'to_city' => 'sometimes|string',

            // Categories
            'category_commercial_sample' => 'boolean',
            'category_gift' => 'boolean',
            'category_returned_goods' => 'boolean',
            'category_documents' => 'boolean',
            'category_other' => 'boolean',

            // Extra
            'explanation' => 'nullable|string',
            'comments' => 'nullable|string',

            // Totals
            'total_declared_value' => 'nullable|numeric',
            'total_weight' => 'nullable|numeric',
        ]);

        DB::beginTransaction();

        try {
            $declaration = CustomDeclaration::findOrFail($id);

            $declaration->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Custom declaration updated successfully.',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update custom declaration.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}