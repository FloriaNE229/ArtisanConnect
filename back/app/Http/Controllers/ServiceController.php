<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class ServiceController extends Controller
{
    public function __construct(private NotificationService $notifService) {}

    /**
     * Mes services (client).
     * GET /api/services
     */
    public function index(Request $request): JsonResponse
    {
        $services = Service::with('atelier:id,nom,image_principale', 'offre:id,titre')
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json(['services' => $services]);
    }

    /**
     * Services reçus (artisan).
     * GET /api/services (artisan)
     */
    public function indexArtisan(Request $request): JsonResponse
    {
        $atelierId = $request->user()->artisan?->atelier?->id;

        if (! $atelierId) {
            return response()->json(['message' => 'Atelier introuvable.'], 404);
        }

        $services = Service::with('client:id,nom,prenom,photo_profil', 'offre:id,titre')
            ->where('atelier_id', $atelierId)
            ->when($request->statut, fn($q) => $q->where('statut', $request->statut))
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json(['services' => $services]);
    }

    /**
     * Détail d'un service.
     * GET /api/services/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $service = Service::with(['atelier', 'client', 'offre', 'avis'])->findOrFail($id);

        $user    = $request->user();
        $isOwner = $service->client_id === $user->id
            || $service->atelier->artisan->utilisateur_id === $user->id;

        if (! $isOwner) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['service' => $service]);
    }

    /**
     * Demander un service (client).
     * POST /api/services
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'atelier_id'  => ['required', 'integer', 'exists:ateliers,id'],
            'offre_id'    => ['nullable', 'integer', 'exists:offres,id'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $service = Service::create([
            'client_id'   => $request->user()->id,
            'atelier_id'  => $data['atelier_id'],
            'offre_id'    => $data['offre_id'] ?? null,
            'description' => $data['description'] ?? null,
            'statut'      => 'EN_ATTENTE',
        ]);

        $service->load(['atelier', 'client']);
        $this->notifService->nouveauService($service);

        return response()->json([
            'message' => 'Demande de service envoyée.',
            'service' => $service,
        ], 201);
    }

    /**
     * Accepter un service (artisan).
     * PATCH /api/services/{id}/accepter
     */
    public function accepter(Request $request, int $id): JsonResponse
    {
        $service = $this->getServiceArtisan($request, $id);

        if ($service->statut !== 'EN_ATTENTE') {
            return response()->json(['message' => 'Ce service ne peut plus être accepté.'], 422);
        }

        $service->update(['statut' => 'ACCEPTE']);
        $service->load(['atelier', 'client']);
        $this->notifService->serviceAccepte($service);

        return response()->json(['message' => 'Service accepté.', 'service' => $service]);
    }

    /**
     * Refuser un service (artisan).
     * PATCH /api/services/{id}/refuser
     */
    public function refuser(Request $request, int $id): JsonResponse
    {
        $service = $this->getServiceArtisan($request, $id);

        if ($service->statut !== 'EN_ATTENTE') {
            return response()->json(['message' => 'Ce service ne peut plus être refusé.'], 422);
        }

        $service->update(['statut' => 'REFUSE']);
        $service->load(['atelier', 'client']);
        $this->notifService->serviceRefuse($service);

        return response()->json(['message' => 'Service refusé.', 'service' => $service]);
    }

    /**
     * Terminer un service (artisan).
     * PATCH /api/services/{id}/terminer
     */
    public function terminer(Request $request, int $id): JsonResponse
    {
        $service = $this->getServiceArtisan($request, $id);

        if ($service->statut !== 'ACCEPTE') {
            return response()->json(['message' => 'Seul un service accepté peut être marqué comme terminé.'], 422);
        }

        $service->update(['statut' => 'TERMINE']);
        $service->load(['atelier', 'client']);
        $this->notifService->serviceTermine($service);

        return response()->json(['message' => 'Service marqué comme terminé. Le client peut maintenant laisser un avis.', 'service' => $service]);
    }

    /**
     * Annuler un service (client).
     * PATCH /api/services/{id}/annuler
     */
    public function annuler(Request $request, int $id): JsonResponse
    {
        $service = Service::where('client_id', $request->user()->id)->findOrFail($id);

        if (in_array($service->statut, ['ANNULE', 'REFUSE', 'TERMINE'])) {
            return response()->json(['message' => 'Ce service ne peut plus être annulé.'], 422);
        }

        $service->update(['statut' => 'ANNULE']);

        return response()->json(['message' => 'Service annulé.', 'service' => $service]);
    }

    // ─────────────────────────────────────────────────────────

    private function getServiceArtisan(Request $request, int $id): Service
    {
        $atelierId = $request->user()->artisan?->atelier?->id;
        return Service::where('atelier_id', $atelierId)->findOrFail($id);
    }
}
