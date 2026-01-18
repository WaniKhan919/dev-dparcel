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
                ['id' => 1, 'name' => 'Pending'],
                ['id' => 2, 'name' => 'Offer Placed'],
                ['id' => 3, 'name' => 'Offer Accepted'],
                ['id' => 4, 'name' => 'Payment Pending'],
                ['id' => 5, 'name' => 'Inprogress'],
                ['id' => 6, 'name' => 'Processed'],
                ['id' => 7, 'name' => 'Forwarded'],
                ['id' => 8, 'name' => 'Received'],
                ['id' => 9, 'name' => 'Completed'],
            ];

            DB::table('order_statuses')->upsert($statuses, ['id'], ['name']);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
