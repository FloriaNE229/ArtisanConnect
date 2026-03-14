<?php

namespace App\Http\Controllers;

use App\Models\Artisan;
use App\Models\ServiceImmediat;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class ServiceImmediatController extends Controller
{
    public function __construct(private NotificationService $notifService) {}

    /**
     * Mes services immédiats (client).
     * GET /api/services-immediats
     */
    public function index(Request $request): JsonResponse
    {
        $services = ServiceImmediat::with('artisanAcceptant.utilisateur:id,nom,prenom')
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json(['services_immediats' => $services]);
    }

    /**
     * Détail d'un service immédiat.
     * GET /api/services-immediats/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $si = ServiceImmediat::with(['client', 'artisanAcceptant.utilisateur'])->findOrFail($id);

        $user    = $request->user();
        $isOwner = $si->client_id === $user->id
            || ($si->artisanAcceptant && $si->artisanAcceptant->utilisateur_id === $user->id);

        if (! $isOwner) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['service_immediat' => $si]);
    }

    /**
     * Demander un service immédiat (client).
     * Notifie tous les artisans du domaine concerné.
     * POST /api/services-immediats
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'domaine'     => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'localisation'=> ['required', 'string', 'max:255'],
        ]);

        $si = ServiceImmediat::create([
            'client_id'   => $request->user()->id,
            'domaine'     => $data['domaine'],
            'description' => $data['description'],
            'localisation'=> $data['localisation'],
            'statut'      => 'EN_ATTENTE',
        ]);

        $si->load('client');

        // Notifier les artisans du domaine concerné
        $artisans = Artisan::whereHas('atelier', fn($q) => $q->where('domaine', 'ilike', '%' . $data['domaine'] . '%'))
            ->with('utilisateur')
            ->get();

        foreach ($artisans as $artisan) {
            $this->notifService->serviceImmediatDisponible($si, $artisan->utilisateur_id);
        }

        return response()->json([
            'message'         => "Demande envoyée à {$artisans->count()} artisan(s) disponible(s).",
            'service_immediat'=> $si,
        ], 201);
    }

    /**
     * Services immédiats disponibles pour l'artisan.
     * GET /api/services-immediats/disponibles
     */
    public function disponibles(Request $request): JsonResponse
    {

        // Vérification manuelle du rôle
        if (! $request->user()->isArtisan()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }
        
        $domaine = $request->user()->artisan?->atelier?->domaine;

        $services = ServiceImmediat::with('client:id,nom,prenom')
            ->where('statut', 'EN_ATTENTE')
            ->where('domaine', 'ilike', '%' . $domaine . '%')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['services_immediats' => $services]);
    }

    /**
     * Accepter un service immédiat (artisan).
     * PATCH /api/services-immediats/{id}/accepter
     */
    public function accepter(Request $request, int $id): JsonResponse
    {
        $artisan = $request->user()->artisan;
        $si      = ServiceImmediat::where('statut', 'EN_ATTENTE')->findOrFail($id);

        $si->update([
            'statut'              => 'EN_COURS',
            'artisan_acceptant_id'=> $artisan->id,
        ]);

        $si->load(['client', 'artisanAcceptant.utilisateur']);
        $this->notifService->artisanEnRoute($si);

        return response()->json(['message' => 'Service immédiat accepté. Le client a été notifié.', 'service_immediat' => $si]);
    }

    /**
     * Terminer un service immédiat (artisan).
     * PATCH /api/services-immediats/{id}/terminer
     */
    public function terminer(Request $request, int $id): JsonResponse
    {
        $artisan = $request->user()->artisan;
        $si      = ServiceImmediat::where('artisan_acceptant_id', $artisan->id)
            ->where('statut', 'EN_COURS')
            ->findOrFail($id);

        $si->update(['statut' => 'TERMINE']);

        return response()->json(['message' => 'Service immédiat terminé.', 'service_immediat' => $si]);
    }

    /**
     * Annuler un service immédiat (client).
     * PATCH /api/services-immediats/{id}/annuler
     */
    public function annuler(Request $request, int $id): JsonResponse
    {
        $si = ServiceImmediat::where('client_id', $request->user()->id)
            ->whereIn('statut', ['EN_ATTENTE', 'EN_COURS'])
            ->findOrFail($id);

        $si->update(['statut' => 'ANNULE']);

        if ($si->artisan_acceptant_id) {
            $this->notifService->envoyer(
                $si->artisanAcceptant->utilisateur_id,
                'service_immediat_annule',
                "Le client {$si->client->prenom} {$si->client->nom} a annulé son service immédiat #{$si->id}.",
                $si->id,
                'services_immediats'
            );
        }

        return response()->json(['message' => 'Service immédiat annulé.']);
    }
}
