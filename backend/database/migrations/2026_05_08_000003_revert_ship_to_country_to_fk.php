<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('ship_to_country');
            $table->unsignedBigInteger('ship_to_country_id')->nullable()->after('ship_from_country_id');
            $table->foreign('ship_to_country_id')->references('id')->on('countries')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['ship_to_country_id']);
            $table->dropColumn('ship_to_country_id');
            $table->string('ship_to_country')->nullable()->after('ship_from_country_id');
        });
    }
};
