<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('shipping_types')->insert([
            [
                'title' => 'Buy For Me',
                'slug' => 'buy_for_me',
                'status' => 1
            ],
            [
                'title' => 'Ship For Me',
                'slug' => 'ship_for_me',
                'status' => 1
            ],
        ]);
    }
}
