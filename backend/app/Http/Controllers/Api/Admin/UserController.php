<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ShipperStatusMail;
use App\Models\ShipperProfile;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function getShippers(Request $request)
    {
        try {

            $perPage = $request->per_page ?? 10;

            $shippers = User::with('shipperProfile')
                ->whereHas('shipperProfile') // only shippers
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Shippers fetched successfully',
                'data' => $shippers->items(),
                'pagination' => [
                    'current_page' => $shippers->currentPage(),
                    'last_page' => $shippers->lastPage(),
                    'per_page' => $shippers->perPage(),
                    'total' => $shippers->total(),
                ]
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shippers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getShoppers(Request $request)
    {
        try {

            $perPage = (int) $request->get('per_page', 10);

           $shoppers = User::with('roles')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'shopper');
            })
            ->latest()
            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Shoppers fetched successfully',
                'data' => $shoppers->items(),
                'pagination' => [
                    'current_page' => $shoppers->currentPage(),
                    'last_page'    => $shoppers->lastPage(),
                    'per_page'     => $shoppers->perPage(),
                    'total'        => $shoppers->total(),
                ]
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shoppers',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function updateShipperStatus(Request $request, $id)
    {
        DB::beginTransaction();

        try {

            $request->validate([
                'approval_status' => 'required|in:approved,rejected',
            ]);

            // Get User
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $shipper = ShipperProfile::where('user_id', $id)->first();

            if (!$shipper) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper not found'
                ], 404);
            }

            // Update status
            $shipper->approval_status = $request->approval_status;
            $shipper->approved_by = Auth::id();

            if ($request->approval_status === 'approved') {
                $shipper->approved_at = now();
                $shipper->rejection_reason = null;
            }

            if ($request->approval_status === 'rejected') {
                $shipper->approved_at = null;
            }

            $shipper->save();
            //ACTIVATE UER
            $user->status = 'active';
            $user->is_verified =  1;
            $user->save();
            Mail::to($user->email)->send(
                new ShipperStatusMail($user, $request->approval_status)
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Shipper status updated successfully',
                'data' => $shipper
            ], 200);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
