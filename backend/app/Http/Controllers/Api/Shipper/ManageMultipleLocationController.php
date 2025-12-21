<?php

namespace App\Http\Controllers\Api\Shipper;

use App\Http\Controllers\Controller;
use App\Models\ShipperServiceArea;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ManageMultipleLocationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'city_ids' => 'required|array|min:1',
            'city_ids.*' => 'exists:cities,id',
        ]);

        $userId = Auth::id();
        $cityIds = $request->input('city_ids');

        try {
            DB::transaction(function () use ($userId, $cityIds) {
                // Delete old service areas for this shipper
                ShipperServiceArea::where('shipper_id', $userId)->delete();

                // Prepare data for new insert
                $data = collect($cityIds)->map(fn($cityId) => [
                    'shipper_id' => $userId,
                    'city_id' => $cityId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->toArray();

                // Insert new service areas
                ShipperServiceArea::insert($data);
            });

            return response()->json([
                'success' => true,
                'message' => 'Service areas saved successfully.',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save service areas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
