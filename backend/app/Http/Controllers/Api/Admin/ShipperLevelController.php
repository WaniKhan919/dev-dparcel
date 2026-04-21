<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShipperLevelRequest;
use App\Http\Requests\UpdateShipperLevelRequest;
use App\Http\Resources\ShipperLevelResource;
use App\Http\Resources\ShippingTypeResource;
use App\Models\ShipperLevel;
use App\Models\ShippingType;
use Illuminate\Support\Facades\DB;
use Exception;

class ShipperLevelController extends Controller
{
    /**
     * Display a listing of shipper levels.
     */
    public function index()
    {
        try {
            $levels = ShipperLevel::with('shippingTypes')->get();

            return response()->json([
                'status' => true,
                'message' => 'Shipper levels fetched successfully.',
                'data' => ShipperLevelResource::collection($levels),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch shipper levels.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created shipper level.
     */
    public function store(StoreShipperLevelRequest $request)
    {
        DB::beginTransaction();
        try {
            $shippingTypeIds = collect($request->shipping_type_ids ?? [])->map(function ($slug) {
                $type = ShippingType::where('slug', $slug)->first();
                return $type?->getRawOriginal('id');
            })->filter()->toArray();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'fee' => 'required|numeric|min:0',
                'max_orders' => 'required|integer|min:0',
                'max_locations' => 'required|integer|min:1',
                'status' => 'required|in:0,1',
            ]);

            $level = ShipperLevel::create($validated);

            if (!empty($shippingTypeIds)) {
                $level->shippingTypes()->sync($shippingTypeIds);
            }

            DB::commit();

            return response()->json(['message' => 'Level created successfully', 'data' => $level], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    /**
     * Display a specific shipper level.
     */
    public function show($id)
    {
        try {
            $level = ShipperLevel::with('shippingTypes')->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $level,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Shipper level not found.',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update a shipper level.
     */
    public function update(UpdateShipperLevelRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'fee' => 'required|numeric|min:0',
                'max_orders' => 'required|integer|min:0',
                'max_locations' => 'required|integer|min:1',
                'status' => 'required|in:0,1',
            ]);

            // Slug se real IDs find karo
            $shippingTypeIds = collect($request->shipping_type_ids ?? [])->map(function ($slug) {
                $type = ShippingType::where('slug', $slug)->first();
                return $type?->getRawOriginal('id');
            })->filter()->toArray();

            $level = ShipperLevel::findOrFail(decrypt($id));
            $level->update($validated);

            $level->shippingTypes()->sync($shippingTypeIds);

            DB::commit();

            return response()->json(['message' => 'Level updated successfully', 'data' => $level], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }    /**
     * Remove a shipper level.
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $level = ShipperLevel::findOrFail($id);
            $level->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Shipper level deleted successfully.',
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Failed to delete shipper level.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getShippingTypes()
    {
        try {
            $types = ShippingType::select('id', 'title', 'slug','status')->where('status', 1)->get();

            return response()->json([
                'status' => true,
                'message' => 'Shipping types fetched successfully',
                'data' => ShippingTypeResource::collection($types),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching shipping types: ' . $e->getMessage(),
            ], 500);
        }
    }
}
