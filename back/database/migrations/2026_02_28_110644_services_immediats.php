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
        Schema::create('services_immediats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('domaine', 150);
            $table->text('description');
            $table->string('localisation', 255);
            $table->enum('statut', ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'REFUSE', 'ANNULE'])->default('EN_ATTENTE');
            $table->foreignId('artisan_acceptant_id')->nullable()->constrained('artisans')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services_immediats');
    }
};
