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
            $declaration = CustomDeclaration::with(
                [
                    'user',
                    'order',
                    'shippingType',
                    'fromCountry',
                    'fromState',
                    'fromCity',
                    'toCountry',
                    'toState',
                    'toCity'
                ]
            )
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

            // FROM
            'from_name' => 'required|string',
            'from_business' => 'required|string',
            'from_street' => 'required|string',
            'from_postcode' => 'required|string',
            'from_country' => 'required|string',
            'from_state' => 'required|string',
            'from_city' => 'required|string',

            // TO
            'to_name' => 'required|string',
            'to_business' => 'required|string',
            'to_street' => 'required|string',
            'to_postcode' => 'required|string',
            'to_country' => 'required|string',
            'to_state' => 'required|string',
            'to_city' => 'required|string',

            // Importer info
            'importer_reference' => 'nullable|string',
            'importer_contact' => 'nullable|string',

            // Categories
            'category_commercial_sample' => 'boolean',
            'category_gift' => 'boolean',
            'category_returned_goods' => 'boolean',
            'category_documents' => 'boolean',
            'category_other' => 'boolean',

            // Text fields
            'explanation' => 'nullable|string',
            'comments' => 'nullable|string',
            'office_origin_posting' => 'nullable|string',

            // Documents
            'doc_licence' => 'boolean',
            'doc_certificate' => 'boolean',
            'doc_invoice' => 'boolean',

            // Totals
            'total_declared_value' => 'nullable|numeric',
            'total_weight' => 'nullable|numeric',

            // Flags
            'contains_prohibited_items' => 'boolean',
            'contains_liquids' => 'boolean',
            'contains_batteries' => 'boolean',
            'is_fragile' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $validated['user_id'] = Auth::id();
            $validated['status'] = 'pending';
            $validated['submitted_at'] = now();

            CustomDeclaration::create($validated);

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

            // FROM
            'from_name' => 'sometimes|string',
            'from_business' => 'sometimes|string',
            'from_street' => 'sometimes|string',
            'from_postcode' => 'sometimes|string',
            'from_country' => 'sometimes|string',
            'from_state' => 'sometimes|string',
            'from_city' => 'sometimes|string',

            // TO
            'to_name' => 'sometimes|string',
            'to_business' => 'sometimes|string',
            'to_street' => 'sometimes|string',
            'to_postcode' => 'sometimes|string',
            'to_country' => 'sometimes|string',
            'to_state' => 'sometimes|string',
            'to_city' => 'sometimes|string',

            // Importer info
            'importer_reference' => 'nullable|string',
            'importer_contact' => 'nullable|string',

            // Categories
            'category_commercial_sample' => 'boolean',
            'category_gift' => 'boolean',
            'category_returned_goods' => 'boolean',
            'category_documents' => 'boolean',
            'category_other' => 'boolean',

            // Extra info
            'explanation' => 'nullable|string',
            'comments' => 'nullable|string',
            'office_origin_posting' => 'nullable|string',

            // Documents
            'doc_licence' => 'boolean',
            'doc_certificate' => 'boolean',
            'doc_invoice' => 'boolean',

            // Total values
            'total_declared_value' => 'nullable|numeric',
            'total_weight' => 'nullable|numeric',

            // Flags
            'contains_prohibited_items' => 'boolean',
            'contains_liquids' => 'boolean',
            'contains_batteries' => 'boolean',
            'is_fragile' => 'boolean',

            // Status optional (admin use)
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
