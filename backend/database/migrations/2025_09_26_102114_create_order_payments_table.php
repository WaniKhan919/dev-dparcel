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
        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('shopper_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shipper_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            // Stripe-specific fields
            $table->string('stripe_payment_intent')->nullable();  // pi_XXXX
            $table->string('stripe_payment_method')->nullable();  // pm_XXXX
            $table->string('stripe_charge_id')->nullable();       // ch_XXXX
            // Status handling
            $table->enum('status', [
                'pending',     // created, waiting for confirmation
                'authorized',  // funds held in Stripe
                'captured',    // platform has captured funds
                'released',    // payout to shipper
                'refunded'     // refunded to buyer
            ])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};
