<?php

namespace Database\Seeders;

use App\Models\Artisan;
use Illuminate\Database\Seeder;

class AtelierSeeder extends Seeder
{
    public function run(): void
    {
        $artisan1 = Artisan::whereHas('utilisateur', fn($q) => $q->where('email', 'artisan1@test.com'))->first();
        $artisan2 = Artisan::whereHas('utilisateur', fn($q) => $q->where('email', 'artisan2@test.com'))->first();

        // ── ATELIER 1 : Ferronnerie ───────────────────────────

        $atelier1 = $artisan1->atelier()->create([
            'nom'              => 'Forge Koné',
            'description'      => 'Atelier artisanal spécialisé en ferronnerie d\'art. Portails, grilles, mobilier sur mesure depuis 2010.',
            'image_principale' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
            'localisation'     => 'Cotonou, Bénin',
            'domaine'          => 'Ferronnerie',
        ]);

        $atelier1->offres()->createMany([
            ['titre' => 'Portail sur mesure',  'description' => 'Création d\'un portail en fer forgé personnalisé.',   'prix' => 150000],
            ['titre' => 'Grille de fenêtre',   'description' => 'Pose et fabrication de grilles de sécurité.',        'prix' => 45000],
            ['titre' => 'Mobilier en métal',   'description' => 'Tables, chaises et étagères en métal sur mesure.',   'prix' => 80000],
            ['titre' => 'Réparation serrure',  'description' => 'Réparation et remplacement de serrures et verrous.', 'prix' => 10000],
        ]);

        $atelier1->galerie()->createMany([
            ['image_url' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
            ['image_url' => 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'],
            ['image_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'],
        ]);

        $atelier1->oeuvres()->createMany([
            [
                'titre'          => 'Portail Arabesque',
                'description'    => 'Portail en fer forgé avec motifs arabesques, finition époxy noir mat.',
                'image_url'      => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
                'prix_indicatif' => 220000,
                'visible'        => true,
            ],
            [
                'titre'          => 'Table basse industrielle',
                'description'    => 'Table basse en métal et verre trempé, style industriel.',
                'image_url'      => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
                'prix_indicatif' => 65000,
                'visible'        => true,
            ],
            [
                'titre'          => 'Grille décorative',
                'description'    => 'Grille de fenêtre avec motif floral forgé à la main.',
                'image_url'      => 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
                'prix_indicatif' => 38000,
                'visible'        => false, // masquée volontairement pour tester
            ],
        ]);

        // ── ATELIER 2 : Menuiserie ────────────────────────────

        $atelier2 = $artisan2->atelier()->create([
            'nom'              => 'Bois & Création Hounsa',
            'description'      => 'Menuiserie artisanale, meubles en bois massif, parquets et aménagements intérieurs depuis 2015.',
            'image_principale' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
            'localisation'     => 'Porto-Novo, Bénin',
            'domaine'          => 'Menuiserie',
        ]);

        $atelier2->offres()->createMany([
            ['titre' => 'Cuisine équipée',      'description' => 'Conception et pose de cuisine en bois massif.',          'prix' => 500000],
            ['titre' => 'Armoire sur mesure',   'description' => 'Armoire encastrée dans toutes dimensions.',              'prix' => 120000],
            ['titre' => 'Parquet bois',         'description' => 'Pose de parquet bois massif ou flottant.',               'prix' => 25000],
            ['titre' => 'Lit en bois',          'description' => 'Lit double ou simple en bois massif avec tête de lit.',  'prix' => 90000],
        ]);

        $atelier2->galerie()->createMany([
            ['image_url' => 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400'],
            ['image_url' => 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=400'],
        ]);

        $atelier2->oeuvres()->createMany([
            [
                'titre'          => 'Cuisine en acajou',
                'description'    => 'Cuisine complète 4m en acajou massif avec îlot central.',
                'image_url'      => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
                'prix_indicatif' => 680000,
                'visible'        => true,
            ],
            [
                'titre'          => 'Lit baldaquin',
                'description'    => 'Lit baldaquin en bois de teck avec sculptures traditionnelles.',
                'image_url'      => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
                'prix_indicatif' => 145000,
                'visible'        => true,
            ],
        ]);

        $this->command->info('✅ Ateliers seedés (2 ateliers avec offres, galeries et oeuvres)');
    }
}