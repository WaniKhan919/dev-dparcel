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
        Schema::table('order_offers', function (Blueprint $table) {
            $table->enum('admin_approval_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('offer_price');
        });
    }

    public function down(): void
    {
        Schema::table('order_offers', function (Blueprint $table) {
            $table->dropColumn('admin_approval_status');
        });
    }
};
