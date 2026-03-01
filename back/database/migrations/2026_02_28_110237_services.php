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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('atelier_id')->constrained('ateliers')->cascadeOnDelete();
            $table->foreignId('offre_id')->nullable()->constrained('offres')->nullOnDelete();
            $table->text('description')->nullable();
            $table->enum('statut', ['EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'TERMINE', 'ANNULE'])->default('EN_ATTENTE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
