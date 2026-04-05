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

            // Relations
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('shipping_type_id')->constrained('shipping_types')->onDelete('cascade');

            // TO Fields
            $table->string('to_name');
            $table->string('to_business');
            $table->string('to_street');
            $table->string('to_postcode');
            $table->string('to_country');
            $table->string('to_state');
            $table->string('to_city');

            // Categories (checkboxes)
            $table->boolean('category_commercial_sample')->default(false);
            $table->boolean('category_gift')->default(false);
            $table->boolean('category_returned_goods')->default(false);
            $table->boolean('category_documents')->default(false);
            $table->boolean('category_other')->default(false);

            // Extra fields step 5
            $table->text('explanation')->nullable();
            $table->text('comments')->nullable();

            // Common shipment fields
            $table->decimal('total_declared_value', 12, 2)->default(0);
            $table->decimal('total_weight', 10, 2)->nullable();
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
            ])->default('pending');
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
