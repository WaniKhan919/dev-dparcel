<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;

use Illuminate\Http\Request;
use Exception;

class RoleController extends Controller
{
    public function index()
    {
         try {
            $roles = Role::get();

            return response()->json([
                'success' => true,
                'message' => 'Roles fetched successfully',
                'data' => RoleResource::collection($roles)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
