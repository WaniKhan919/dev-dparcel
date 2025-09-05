<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Permission;
use Exception;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    /** List all permissions */
    public function index()
    {
        try {
            $permissions = Permission::get();

            return response()->json([
                'success' => true,
                'message' => 'Permission fetched successfully',
                'data' => $permissions, //RoleResource::collection($roles)
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /** Create a new permission */
    public function store(Request $request)
    {
         try {
            $validated = $request->validate([
                'name' => 'required|string|unique:permissions,name',
            ]);

            // Generate code (slug version of name)
            $validated['code'] = Str::snake(Str::lower($validated['name']));

            $permission = Permission::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Permission added successfully',
                // 'data'    => $permission
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add permission',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /** Update a permission */
    public function update(Request $request, Permission $permission)
    {
        try {
            $validated = $request->validate([
                'name'   => 'required|string|unique:permissions,name,' . $permission->id,
            ]);

            $permission->update($validated);

            return response()->json(['message' => 'Permission updated successfully', 'permission' => $permission]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to update permission', 'error' => $e->getMessage()], 500);
        }
    }

    /** Delete a permission */
    public function destroy(Permission $permission)
    {
        try {
            $permission->delete();

            return response()->json(['message' => 'Permission deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to delete permission', 'error' => $e->getMessage()], 500);
        }
    }
}
