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
        Schema::create('sanctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['warning', 'suspension', 'ban'])->default('warning');
            $table->text('description');
            $table->integer('duration')->nullable(); // en jours
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamp('lifted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sanctions');
    }
};
