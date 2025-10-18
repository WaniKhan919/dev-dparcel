<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShipperLevelRequest;
use App\Http\Requests\UpdateShipperLevelRequest;
use App\Models\ShipperLevel;
use App\Models\ShippingType;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
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
                'data' => $levels,
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
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'fee' => 'required|numeric|min:0',
                'max_orders' => 'required|integer|min:0',
                'max_locations' => 'required|integer|min:1',
                'status' => 'required|in:0,1',
                'shipping_type_ids' => 'array',
                'shipping_type_ids.*' => 'exists:shipping_types,id',
            ]);

            $level = ShipperLevel::create($validated);

            if (!empty($validated['shipping_type_ids'])) {
                $level->shippingTypes()->sync($validated['shipping_type_ids']);
            }

            DB::commit();

            return response()->json(['message' => 'Level created successfully', 'data' => $level], 200);
        } catch (\Exception $e) {
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
                'shipping_type_ids' => 'array',
                'shipping_type_ids.*' => 'exists:shipping_types,id',
            ]);

            $level = ShipperLevel::findOrFail($id);
            $level->update($validated);

            if (isset($validated['shipping_type_ids'])) {
                $level->shippingTypes()->sync($validated['shipping_type_ids']);
            }

            DB::commit();

            return response()->json(['message' => 'Level updated successfully', 'data' => $level], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    /**
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
            $types = ShippingType::select('id', 'title')->where('status', 1)->get();

            return response()->json([
                'status' => true,
                'message' => 'Shipping types fetched successfully',
                'data' => $types,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching shipping types: ' . $e->getMessage(),
            ], 500);
        }
    }
}
