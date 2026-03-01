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
        Schema::create('ateliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artisan_id')->unique()->constrained('artisans')->cascadeOnDelete();
            $table->string('nom', 255);
            $table->text('description')->nullable();
            $table->string('image_principale', 500)->nullable();
            $table->string('localisation', 255);
            $table->string('domaine', 150);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ateliers');
    }
};
