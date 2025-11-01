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
            // Remove old string fields if you don’t need them anymore
            $table->dropColumn(['ship_from', 'ship_to']);

            // Ship From
            $table->foreignId('ship_from_country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->foreignId('ship_from_state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->foreignId('ship_from_city_id')->nullable()->constrained('cities')->onDelete('set null');

            // Ship To
            $table->foreignId('ship_to_country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->foreignId('ship_to_state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->foreignId('ship_to_city_id')->nullable()->constrained('cities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
