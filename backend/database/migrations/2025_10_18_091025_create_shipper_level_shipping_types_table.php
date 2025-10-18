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
        Schema::create('shipper_level_shipping_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_level_id')->constrained('shipper_levels')->cascadeOnDelete();
            $table->foreignId('shipping_type_id')->constrained('shipping_types')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipper_level_shipping_types');
    }
};
