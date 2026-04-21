<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('services')->insert([
            // Buy For Me (shipping_type_id = 1)
            [
                'shipping_type_id' => 1,
                'title' => 'Forwarding Service Fee',
                'description' => 'Forwarding Service Fee',
                'is_required' => 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 1,
                'title' => 'Product Photo',
                'description' => 'Product Photo',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 1,
                'title' => 'Package Consolidation',
                'description' => 'Package Consolidation',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 1,
                'title' => 'Purchase Assistance',
                'description' => 'Purchase Assistance',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Ship For Me (shipping_type_id = 2)
            [
                'shipping_type_id' => 2,
                'title' => 'Forwarding Service Fee',
                'description' => 'Forwarding Service Fee',
                'is_required' => 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 2,
                'title' => 'Product Photo',
                'description' => 'Product Photo',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 2,
                'title' => 'Package Consolidation',
                'description' => 'Package Consolidation',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shipping_type_id' => 2,
                'title' => 'Purchase Assistance',
                'description' => 'Purchase Assistance',
                'is_required' => 0,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
