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

            // FROM Fields
            $table->string('from_name');
            $table->string('from_business');
            $table->string('from_street');
            $table->string('from_postcode');
            $table->string('from_country');
            $table->string('from_state');
            $table->string('from_city');

            // TO Fields
            $table->string('to_name');
            $table->string('to_business');
            $table->string('to_street');
            $table->string('to_postcode');
            $table->string('to_country');
            $table->string('to_state');
            $table->string('to_city');

            // Importer info (optional)
            $table->string('importer_reference')->nullable();
            $table->string('importer_contact')->nullable();

            // Categories (checkboxes)
            $table->boolean('category_commercial_sample')->default(false);
            $table->boolean('category_gift')->default(false);
            $table->boolean('category_returned_goods')->default(false);
            $table->boolean('category_documents')->default(false);
            $table->boolean('category_other')->default(false);

            // Extra fields step 5
            $table->text('explanation')->nullable();
            $table->text('comments')->nullable();
            $table->string('office_origin_posting')->nullable();

            // Documents
            $table->boolean('doc_licence')->default(false);
            $table->boolean('doc_certificate')->default(false);
            $table->boolean('doc_invoice')->default(false);

            // Common shipment fields
            $table->decimal('total_declared_value', 12, 2)->default(0);
            $table->decimal('total_weight', 10, 2)->nullable();

            // Flags
            $table->boolean('contains_prohibited_items')->default(false);
            $table->boolean('contains_liquids')->default(false);
            $table->boolean('contains_batteries')->default(false);
            $table->boolean('is_fragile')->default(false);

            // System fields
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
