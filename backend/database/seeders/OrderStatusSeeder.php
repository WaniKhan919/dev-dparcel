<?php

namespace Database\Seeders;

use Exception;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       DB::beginTransaction();

        try {
            $statuses = [
                ['id' => 1, 'name' => 'pending'],
                ['id' => 2, 'name' => 'paid'],
                ['id' => 3, 'name' => 'purchased'],
                ['id' => 4, 'name' => 'packed'],
                ['id' => 5, 'name' => 'shipped'],
                ['id' => 6, 'name' => 'delivered'],
                ['id' => 7, 'name' => 'cancelled'],
            ];

            DB::table('order_statuses')->insert($statuses);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
