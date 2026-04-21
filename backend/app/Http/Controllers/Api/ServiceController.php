<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Exception;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Service::with('shippingType');

            // optional filter
            if ($request->shipping_type_id) {
                $query->where('shipping_type_id', decrypt($request->shipping_type_id));
            }

            $services = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Service fetched successfully',
                'data' => ServiceResource::collection($services),
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'       => 'required|string|unique:services,title',
                'shipping_type'       => 'required',
                'description' => 'nullable|string',
                'is_required' => 'required|boolean',
                'status' => 'nullable|numeric',
            ]);
            $validated['shipping_type'] = decrypt($validated['shipping_type']);
            $service = Service::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'service added successfully',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add service',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
   public function update(Request $request, $id)
    {
        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found',
                ], 404);
            }

            $validated = $request->validate([
                'title'       => 'required|string|unique:services,title,' . $id,
                'shipping_type'       => 'required',
                'description' => 'nullable|string',
                'is_required' => 'required|boolean',
                'status'       => 'nullable|numeric',
            ]);
            $validated['shipping_type'] = decrypt($validated['shipping_type']);

            $service->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found',
                ], 404);
            }

            $service->delete();

            return response()->json([
                'success' => true,
                'message' => 'Service deleted successfully',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}
