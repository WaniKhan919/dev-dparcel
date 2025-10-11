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
            [
                'title' => 'Forwarding Service Fee',
                'price' => 10.00,
                'description' => 'Forwarding Service Fee',
                'is_required' => 1,
                'status' => 1,
            ],
            [
                'title' => 'Product Photo',
                'price' => 15.00,
                'description' => 'Product Photo',
                'is_required' => 0,
                'status' => 1,
            ],
            [
                'title' => 'Package Consolidation',
                'price' => 20.00,
                'description' => 'Package Consolidation',
                'is_required' => 0,
                'status' => 1,
            ],
            [
                'title' => 'Purchase Assistance',
                'price' => 5.00,
                'description' => 'Purchase Assistance',
                'is_required' => 0,
                'status' => 1,
            ],
        ]);
    }
}
