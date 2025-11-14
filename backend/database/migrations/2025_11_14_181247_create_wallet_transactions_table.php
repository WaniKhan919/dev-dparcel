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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('cascade');
            $table->foreignId('shipping_type_id')->constrained('shipping_types')->onDelete('cascade');
            $table->enum('transaction_type', ['credit', 'debit']);
            $table->decimal('amount', 10, 2);
            $table->decimal('stripe_fee', 10, 2)->default(0);
            $table->decimal('commission', 10, 2)->default(0);
            $table->string('description')->nullable();
            $table->enum('status', ['pending', 'completed', 'reversed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
