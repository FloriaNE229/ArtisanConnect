<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ajouter SERVICE_ANNULE et SERVICE_IMMEDIAT_ANNULE à l'ENUM existant
        DB::statement("ALTER TYPE notifications_type ADD VALUE IF NOT EXISTS 'SERVICE_ANNULE';");
        DB::statement("ALTER TYPE notifications_type ADD VALUE IF NOT EXISTS 'SERVICE_IMMEDIAT_ANNULE';");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // PostgreSQL ne permet pas de supprimer directement un type ENUM existant,
        // donc en rollback on ne peut pas enlever ces valeurs facilement.
        // Si nécessaire, il faut recréer un nouvel ENUM et changer la colonne.
    }
};