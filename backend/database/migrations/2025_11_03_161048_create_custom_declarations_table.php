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
        Schema::create('custom_declarations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('shipping_type_id')->constrained('shipping_types')->onDelete('cascade');
            $table->string('export_reason')->nullable();
            $table->string('purpose_of_shipment')->nullable();
            $table->decimal('total_declared_value', 12, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            $table->decimal('total_weight', 10, 2)->nullable();
            $table->string('unit_of_weight', 10)->default('kg');
            $table->foreignId('country_id')->nullable()->constrained('countries');
            $table->foreignId('state_id')->nullable()->constrained('states');
            $table->foreignId('city_id')->nullable()->constrained('cities');
            $table->string('receiver_name')->nullable();
            $table->string('receiver_phone')->nullable();
            $table->string('receiver_address')->nullable();
            $table->string('postal_code')->nullable();
            $table->boolean('contains_prohibited_items')->default(false);
            $table->boolean('contains_liquids')->default(false);
            $table->boolean('contains_batteries')->default(false);
            $table->boolean('is_fragile')->default(false);
            $table->boolean('is_dutiable')->default(true);
            $table->text('additional_info')->nullable();
            $table->string('declaration_number')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_declarations');
    }
};
