<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permission;
use Exception;

class RolePermissionController extends Controller
{
    /** Assign permissions to a role */
    public function assign(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            $role->permissions()->sync($validated['permissions']);

            return response()->json([
                'message' => 'Permissions assigned successfully',
                'role' => $role->load('permissions')
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to assign permissions', 'error' => $e->getMessage()], 500);
        }
    }
   public function getPermissions($roleId)
    {
        try {
            $role = Role::with('permissions')->findOrFail($roleId);

            return response()->json([
                'permissions' => $role->permissions->pluck('id')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /** Remove a permission from role */
    public function revoke(Role $role, Permission $permission)
    {
        try {
            $role->permissions()->detach($permission->id);

            return response()->json(['message' => 'Permission revoked successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to revoke permission', 'error' => $e->getMessage()], 500);
        }
    }
}
