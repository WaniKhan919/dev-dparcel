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
            $declaration = CustomDeclaration::with(['user', 'order', 'shippingType', 'country', 'state', 'city'])
                ->where('order_id', $order_id)
                ->first();

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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'shipping_type_id' => 'required|exists:shipping_types,id',
            'export_reason' => 'nullable|string',
            'purpose_of_shipment' => 'nullable|string',
            'total_declared_value' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'total_weight' => 'nullable|numeric',
            'unit_of_weight' => 'nullable|string|max:10',
            'country_id' => 'nullable|exists:countries,id',
            'state_id' => 'nullable|exists:states,id',
            'city_id' => 'nullable|exists:cities,id',
            'receiver_name' => 'nullable|string',
            'receiver_phone' => 'nullable|string',
            'receiver_address' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'contains_prohibited_items' => 'boolean',
            'contains_liquids' => 'boolean',
            'contains_batteries' => 'boolean',
            'is_fragile' => 'boolean',
            'is_dutiable' => 'boolean',
            'additional_info' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $validated['user_id'] = Auth::id();;

            $declaration = CustomDeclaration::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Custom declaration created successfully.',
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create custom declaration.',
                'error' => $e->getMessage(),
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
            'export_reason' => 'nullable|string',
            'purpose_of_shipment' => 'nullable|string',
            'total_declared_value' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'total_weight' => 'nullable|numeric',
            'unit_of_weight' => 'nullable|string|max:10',
            'country_id' => 'nullable|exists:countries,id',
            'state_id' => 'nullable|exists:states,id',
            'city_id' => 'nullable|exists:cities,id',
            'receiver_name' => 'nullable|string',
            'receiver_phone' => 'nullable|string',
            'receiver_address' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'contains_prohibited_items' => 'boolean',
            'contains_liquids' => 'boolean',
            'contains_batteries' => 'boolean',
            'is_fragile' => 'boolean',
            'is_dutiable' => 'boolean',
            'additional_info' => 'nullable|string',
            'status' => 'nullable|string',
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
