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
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('photo_profil');
            $table->string('specialite')->nullable()->after('bio');
            $table->string('experience_level')->nullable()->after('specialite');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('experience_level');
            $table->text('verification_documents')->nullable()->after('verification_status');
            $table->timestamp('verified_at')->nullable()->after('verification_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'specialite', 'experience_level', 'verification_status', 'verification_documents', 'verified_at']);
        });
    }
};
