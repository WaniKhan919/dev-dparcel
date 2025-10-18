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
        Schema::create('shipper_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipper_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shipper_level_id')->constrained('shipper_levels')->onDelete('cascade');
            $table->decimal('amount', 10, 2)->default(0);
            $table->enum('status', ['active', 'expired', 'pending'])->default('pending');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('currency', 10)->default('USD');
            $table->string('stripe_payment_intent')->nullable();
            $table->string('stripe_payment_method')->nullable();
            $table->string('stripe_charge_id')->nullable();   
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipper_subscriptions');
    }
};
