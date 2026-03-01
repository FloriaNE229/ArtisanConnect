<?php

namespace App\Http\Controllers;

use App\Models\Atelier;
use App\Models\GalerieAtelier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class AtelierController extends Controller
{
    /**
     * Recherche et navigation publique des ateliers.
     * GET /api/ateliers
     *
     * Query params:
     *   - recherche    : string (nom ou description)
     *   - domaine      : string (catégorie)
     *   - localisation : string
     *   - note_min     : float  (filtrer par note minimale)
     *   - tri          : string (note_desc, note_asc, recent)
     *   - par_page     : int    (défaut 15)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'note_min'  => ['nullable', 'numeric', 'between:1,5'],
            'par_page'  => ['nullable', 'integer', 'between:1,50'],
            'tri'       => ['nullable', 'in:note_desc,note_asc,recent'],
        ]);

        $query = Atelier::with(['artisan.utilisateur', 'offres'])
            ->withCount('avis')
            ->withAvg('avis', 'note');

        // Recherche textuelle
        if ($recherche = $request->recherche) {
            $query->where(function ($q) use ($recherche) {
                $q->where('nom', 'ilike', "%{$recherche}%")
                  ->orWhere('description', 'ilike', "%{$recherche}%")
                  ->orWhere('domaine', 'ilike', "%{$recherche}%");
            });
        }

        // Filtre par domaine / catégorie
        if ($domaine = $request->domaine) {
            $query->where('domaine', 'ilike', "%{$domaine}%");
        }

        // Filtre par localisation
        if ($localisation = $request->localisation) {
            $query->where('localisation', 'ilike', "%{$localisation}%");
        }

        // Filtre par note minimale
        if ($noteMin = $request->note_min) {
            $query->whereRaw(
                '(SELECT AVG(note) FROM avis WHERE avis.atelier_id = ateliers.id) >= ?',
                [$noteMin]
            );
        }  
        // Tri
       match ($request->tri ?? 'recent') {
            'note_desc' => $query->orderByRaw('(SELECT AVG(note) FROM avis WHERE avis.atelier_id = ateliers.id) DESC NULLS LAST'),
            'note_asc'  => $query->orderByRaw('(SELECT AVG(note) FROM avis WHERE avis.atelier_id = ateliers.id) ASC NULLS LAST'),
            default     => $query->orderByDesc('ateliers.created_at'),
        };

        $ateliers = $query->paginate($request->par_page ?? 15);

        return response()->json($ateliers);
    }

    /**
     * Détail public d'un atelier.
     * GET /api/ateliers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $atelier = Atelier::with([
            'artisan.utilisateur',
            'artisan.horaires',
            'offres',
            'galerie',
            'oeuvres' => fn($q) => $q->visibles(),
            'avis.client',
        ])
        ->withAvg('avis', 'note')
        ->withCount('avis')
        ->findOrFail($id);

        return response()->json(['atelier' => $atelier]);
    }

    /**
     * Mon atelier (artisan connecté).
     * GET /api/mon-atelier
     */
    public function monAtelier(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier?->load([
            'offres', 'galerie', 'oeuvres', 'avis.client',
        ]);

        if (! $atelier) {
            return response()->json(['message' => 'Vous n\'avez pas encore d\'atelier.'], 404);
        }

        return response()->json(['atelier' => $atelier]);
    }

    /**
     * Créer l'atelier de l'artisan.
     * POST /api/mon-atelier
     */
    public function store(Request $request): JsonResponse
    {
        $artisan = $request->user()->artisan;

        if ($artisan->atelier) {
            return response()->json(['message' => 'Vous avez déjà un atelier.'], 422);
        }

        $data = $request->validate([
            'nom'              => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'localisation'     => ['required', 'string', 'max:255'],
            'domaine'          => ['required', 'string', 'max:150'],
            'image_principale' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image_principale')) {
            $data['image_principale'] = Storage::disk('public')->url(
                $request->file('image_principale')->store('ateliers', 'public')
            );
        }

        $atelier = $artisan->atelier()->create($data);

        return response()->json([
            'message' => 'Atelier créé avec succès.',
            'atelier' => $atelier,
        ], 201);
    }

    /**
     * Modifier l'atelier.
     * POST /api/mon-atelier/update (POST pour multipart)
     */
    public function update(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;

        if (! $atelier) {
            return response()->json(['message' => 'Atelier introuvable.'], 404);
        }

        $data = $request->validate([
            'nom'              => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'localisation'     => ['sometimes', 'string', 'max:255'],
            'domaine'          => ['sometimes', 'string', 'max:150'],
            'image_principale' => ['sometimes', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image_principale')) {
            if ($atelier->image_principale) {
                Storage::disk('public')->delete(
                    str_replace(Storage::disk('public')->url(''), '', $atelier->image_principale)
                );
            }
            $data['image_principale'] = Storage::disk('public')->url(
                $request->file('image_principale')->store('ateliers', 'public')
            );
        }

        $atelier->update($data);

        return response()->json([
            'message' => 'Atelier mis à jour.',
            'atelier' => $atelier->fresh(),
        ]);
    }

    /**
     * Ajouter une image à la galerie.
     * POST /api/mon-atelier/galerie
     */
    public function ajouterImage(Request $request): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;

        if (! $atelier) {
            return response()->json(['message' => 'Atelier introuvable.'], 404);
        }

        $request->validate(['image' => ['required', 'image', 'max:4096']]);

        $path  = $request->file('image')->store('galeries', 'public');
        $image = $atelier->galerie()->create([
            'image_url' => Storage::disk('public')->url($path),
        ]);

        return response()->json([
            'message' => 'Image ajoutée à la galerie.',
            'image'   => $image,
        ], 201);
    }

    /**
     * Supprimer une image de la galerie.
     * DELETE /api/mon-atelier/galerie/{imageId}
     */
    public function supprimerImage(Request $request, int $imageId): JsonResponse
    {
        $atelier = $request->user()->artisan?->atelier;
        $image   = GalerieAtelier::where('atelier_id', $atelier?->id)->findOrFail($imageId);

        $path = str_replace(Storage::disk('public')->url(''), '', $image->image_url);
        Storage::disk('public')->delete($path);
        $image->delete();

        return response()->json(['message' => 'Image supprimée.']);
    }

    /**
     * Liste des domaines / catégories disponibles (public).
     * GET /api/domaines
     */
    public function domaines(): JsonResponse
    {
        $domaines = Atelier::select('domaine')
            ->distinct()
            ->orderBy('domaine')
            ->pluck('domaine');

        return response()->json(['domaines' => $domaines]);
    }
}
