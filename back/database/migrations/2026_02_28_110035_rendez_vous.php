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
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('atelier_id')->constrained('ateliers')->cascadeOnDelete();
            $table->dateTime('date_rdv');
            $table->unsignedInteger('duree_minutes')->default(60);
            $table->enum('statut', ['EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'ANNULE'])->default('EN_ATTENTE');
            $table->text('message')->nullable();
            $table->timestamps();

            // Empêche les doublons de créneau actif par atelier
            // (La logique complète est gérée via un observer/service)
            $table->index(['atelier_id', 'date_rdv', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
