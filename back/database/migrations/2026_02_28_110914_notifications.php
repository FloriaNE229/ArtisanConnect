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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destinataire_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', [
                'NOUVEAU_RDV',
                'RDV_ACCEPTE',
                'RDV_REFUSE',
                'RDV_ANNULE',
                'NOUVEAU_SERVICE',
                'SERVICE_ACCEPTE',
                'SERVICE_REFUSE',
                'SERVICE_TERMINE',
                'SERVICE_IMMEDIAT',
                'ARTISAN_EN_ROUTE',
            ]);
            $table->text('message');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type', 50)->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamps();

            $table->index(['destinataire_id', 'lu']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
