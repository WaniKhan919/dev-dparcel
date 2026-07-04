<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_declaration_products', function (Blueprint $table) {
            $table->integer('quantity')->default(1)->after('product_id');
            $table->decimal('price', 10, 2)->default(0)->after('quantity');
            $table->decimal('weight', 8, 2)->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('custom_declaration_products', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'price', 'weight']);
        });
    }
};
