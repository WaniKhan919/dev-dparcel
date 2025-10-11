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
