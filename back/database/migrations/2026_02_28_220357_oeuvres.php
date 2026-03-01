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
        Schema::create('oeuvres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('atelier_id')->constrained('ateliers')->cascadeOnDelete();
            $table->string('titre', 255);
            $table->text('description')->nullable();
            $table->string('image_url', 500);
            $table->decimal('prix_indicatif', 10, 2)->nullable();
            $table->boolean('visible')->default(true);
            $table->timestamps();

            $table->index(['atelier_id', 'visible']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oeuvres');
    }
};
