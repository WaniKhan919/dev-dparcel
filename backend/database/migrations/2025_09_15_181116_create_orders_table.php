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
            $table->enum('service_type', ['buy_for_me', 'ship_for_me']);
            $table->string('ship_from');
            $table->string('ship_to');
            $table->decimal('total_aprox_weight', 8, 2)->nullable();
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->boolean('is_product_photo')->default(false);
            $table->boolean('is_package_consolidation')->default(false);
            $table->boolean('is_purchase_assistance')->default(false);
            $table->boolean('is_forwarding_service_fee')->default(false);
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
