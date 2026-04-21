<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('stripe_fee', 10, 2)->default(0.00)->after('total_price');
            $table->decimal('service_fee', 10, 2)->default(0.00)->after('stripe_fee');
            $table->decimal('grand_total', 10, 2)->default(0.00)->after('service_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['stripe_fee', 'service_fee', 'grand_total']);
        });
    }
};
