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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shipping_type_id')->constrained()->onDelete('cascade');

            // Ship From
            $table->foreignId('ship_from_country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->foreignId('ship_from_state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->foreignId('ship_from_city_id')->nullable()->constrained('cities')->onDelete('set null');

            // Ship To
            $table->foreignId('ship_to_country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->foreignId('ship_to_state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->foreignId('ship_to_city_id')->nullable()->constrained('cities')->onDelete('set null');

            $table->decimal('total_aprox_weight', 8, 2)->nullable();
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->string('tracking_number', 50)->nullable()->unique();
            $table->string('request_number', 50)->nullable()->unique();
            $table->integer('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
