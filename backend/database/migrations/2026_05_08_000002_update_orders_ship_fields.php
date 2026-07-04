<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'ship_from_state_id')) {
                $table->dropColumn([
                    'ship_from_state_id',
                    'ship_from_city_id',
                    'ship_to_country_id',
                    'ship_to_state_id',
                    'ship_to_city_id',
                    'tracking_number',
                ]);
            }

            if (!Schema::hasColumn('orders', 'ship_to_country')) {
                $table->string('ship_to_country')->nullable()->after('ship_from_country_id');
                $table->string('ship_to_city')->nullable()->after('ship_to_country');
                $table->string('ship_to_address')->nullable()->after('ship_to_city');
            }

            if (!Schema::hasColumn('orders', 'admin_approval_status')) {
                $table->enum('admin_approval_status', ['pending', 'approved', 'rejected'])
                    ->default('pending')
                    ->after('status');
            }
        });
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ship_to_country', 'ship_to_city', 'ship_to_address', 'admin_approval_status']);

            $table->unsignedBigInteger('ship_from_state_id')->nullable();
            $table->unsignedBigInteger('ship_from_city_id')->nullable();
            $table->unsignedBigInteger('ship_to_country_id')->nullable();
            $table->unsignedBigInteger('ship_to_state_id')->nullable();
            $table->unsignedBigInteger('ship_to_city_id')->nullable();
            $table->string('tracking_number')->nullable();
        });
    }
};
