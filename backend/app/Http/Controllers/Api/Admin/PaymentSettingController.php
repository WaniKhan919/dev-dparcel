<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentSettingController extends Controller
{
    public function index(Request $request)
    {
        try {
            
            $perPage = (int) $request->get('per_page', 10);

            $settings = PaymentSetting::with(['role', 'shippingType'])
                ->paginate($perPage);

            return response()->json([
                'status' => true,
                'message' => 'Payment settings fetched successfully.',
                'data' => $settings,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch payment settings.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created payment setting.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'role_id' => 'required|exists:roles,id',
                'shipping_types_id' => 'nullable|exists:shipping_types,id',
                'key' => 'required|string|max:255',
                'value' => 'required|numeric|min:0',
                'type' => 'required|in:percent,fixed',
                'description' => 'nullable|string',
                'active' => 'required|boolean',
            ]);

            $setting = PaymentSetting::create($validated);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Payment setting created successfully.',
                'data' => $setting,
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to create payment setting.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific payment setting.
     */
    public function show($id)
    {
        try {
            $setting = PaymentSetting::with(['role', 'shippingType'])->findOrFail($id);

            return response()->json([
                'status' => true,
                'message' => 'Payment setting fetched successfully.',
                'data' => $setting,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Payment setting not found.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update a payment setting.
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'role_id' => 'required|exists:roles,id',
                'shipping_types_id' => 'nullable|exists:shipping_types,id',
                'key' => 'required|string|max:255',
                'value' => 'required|numeric|min:0',
                'type' => 'required|in:percent,fixed',
                'description' => 'nullable|string',
                'active' => 'required|boolean',
            ]);

            $setting = PaymentSetting::findOrFail($id);
            $setting->update($validated);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Payment setting updated successfully.',
                'data' => $setting,
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to update payment setting.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove a payment setting.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $setting = PaymentSetting::findOrFail($id);
            $setting->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Payment setting deleted successfully.',
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete payment setting.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
