<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('permissions')->insert([
            [
                'name' => 'Shopper Dashboard',
                'code' => 'shopper_dashboard',
            ],
            [
                'name' => 'Shipper Dashboard',
                'code' => 'shipper_dashboard',
            ],
            [
                'name' => 'Products',
                'code' => 'products',
            ],
            [
                'name' => 'Create Request',
                'code' => 'create_request',
            ],
            [
                'name' => 'Shopper Payment',
                'code' => 'shopper_payment',
            ],
            [
                'name' => 'View Shopper Request',
                'code' => 'view_shopper_request',
            ],
            [
                'name' => 'Shipper Payment',
                'code' => 'shipper_payment',
            ],
            [
                'name' => 'Subscription',
                'code' => 'subscription',
            ],
        ]);
    }
}
