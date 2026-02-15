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
        Schema::create('signalements', function (Blueprint $table) {
            $table->id();

            //Type de signalement
             $table->enum('type', [
                'CONTENU_INAPPROPRIE',
                'FAUX_PROFIL',
                'ARNAQUE',
                'SPAM',
                'HARCELEMENT',
                'AUTRE'
            ]);

              // Utilisateur signalé
            $table->foreignId('reported_user_id')
                ->constrained('users')
                ->onDelete('cascade');

              // Utilisateur qui signale
            $table->foreignId('reporter_id')
                ->constrained('users')
                ->onDelete('cascade');
        

        // Contenu signalé (optionnel)
            $table->string('content_type')->nullable(); // Avis, Atelier, Service
            $table->unsignedBigInteger('content_id')->nullable();

         // Détails
            $table->text('description');

        // Statut du signalement
            $table->enum('status', ['PENDING', 'RESOLVED', 'REJECTED'])
                ->default('PENDING');

         // Gravité
            $table->enum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
                ->default('MEDIUM');

        // Résolution
            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by')->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            // Index pour performance
            $table->index(['status', 'severity']);
            $table->index('reported_user_id');
        });

    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signalements');
    }
};
