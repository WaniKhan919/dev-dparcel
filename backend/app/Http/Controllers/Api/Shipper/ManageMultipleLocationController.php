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
            'country_ids' => 'required|array|min:1',
            'country_ids.*' => 'exists:countries,id',
        ]);

        $userId = Auth::id();
        $countryIds = $request->input('country_ids');

        try {
            DB::transaction(function () use ($userId, $countryIds) {

                // Delete old service areas for this shipper
                ShipperServiceArea::where('shipper_id', $userId)->delete();

                // Prepare data for new insert
                $data = collect($countryIds)->map(fn($countryId) => [
                    'shipper_id' => $userId,
                    'country_id' => $countryId,
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
