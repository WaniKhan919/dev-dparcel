<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $shopper = Role::where('name', 'shopper')->first();
        $shipper = Role::where('name', 'shipper')->first();

        if ($shopper) {
            $shopperPermissions = Permission::whereIn('code', [
                'shopper_dashboard',
                'create_request',
                'shopper_payment',
            ])->pluck('id');

            $shopper->permissions()->syncWithoutDetaching($shopperPermissions);
        }

        if ($shipper) {
            $shipperPermissions = Permission::whereIn('code', [
                'shipper_dashboard',
                'view_shopper_request',
                'subscription',
                'shipper_payment',
                'stripe_connect',
            ])->pluck('id');

            $shipper->permissions()->syncWithoutDetaching($shipperPermissions);
        }
    }
}
