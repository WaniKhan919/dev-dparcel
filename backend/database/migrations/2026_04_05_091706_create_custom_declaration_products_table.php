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
        Schema::create('custom_declaration_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_declaration_id')
                ->constrained('custom_declarations')
                ->onDelete('cascade');

            $table->foreignId('product_id')
                ->constrained('products')
                ->onDelete('cascade');

            $table->string('hs_code')->nullable();
            $table->string('origin_country')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_declaration_products');
    }
};
