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
                ['id' => 1, 'name' => 'pending'],             // Order created, waiting for admin or confirmation
                ['id' => 2, 'name' => 'awaiting_payment'],    // Waiting for user payment
                ['id' => 3, 'name' => 'paid'],                // Payment received
                ['id' => 4, 'name' => 'purchased'],           // Admin purchased product (Buy for Me only)
                ['id' => 5, 'name' => 'in_warehouse'],        // Package arrived at warehouse
                ['id' => 6, 'name' => 'packed'],              // Order packed and ready for shipment
                ['id' => 7, 'name' => 'shipped'],             // Shipped out from warehouse
                ['id' => 8, 'name' => 'in_transit'],          // Package on the way to destination
                ['id' => 9, 'name' => 'delivered'],           // Successfully delivered
                ['id' => 10, 'name' => 'cancelled'],          // Cancelled by user/admin
                ['id' => 11, 'name' => 'returned'],           // Returned to warehouse/sender
            ];

            DB::table('order_statuses')->upsert($statuses, ['id'], ['name']);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
