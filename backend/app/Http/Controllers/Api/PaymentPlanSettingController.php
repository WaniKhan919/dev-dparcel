<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Exception;
use Illuminate\Http\Request;

class PaymentPlanSettingController extends Controller
{
    public function getPaymentPlans(Request $request)
    {
        try {
            $user = auth()->user();

            // Check authentication
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized user.',
                ], 401);
            }

            // Get user role (assuming single role per user)
            $role = $user->roles()->first();

            if (!$role) {
                return response()->json([
                    'status' => false,
                    'message' => 'No role assigned to the user.',
                ], 404);
            }

            // Base query
            $query = PaymentSetting::where('role_id', $role->id)
                ->where('active', true);

            // If request has shipping type, apply filter
            if ($request->filled('shipping_types_id')) {
                $query->where('shipping_types_id', $request->shipping_types_id);
            } else {
                $query->whereNull('shipping_types_id');
            }

            $paymentSettings = $query->get();

            return response()->json([
                'status' => true,
                'message' => 'Payment plans fetched successfully.',
                'data' => $paymentSettings,
            ]);
        } catch (Exception $ex) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch payment plans.',
                'error' => $ex->getMessage(),
            ], 500);
        }
    }
}
