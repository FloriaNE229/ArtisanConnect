<?php

namespace App\Http\Controllers;

use App\Mail\ConfirmationRendezVousMail;
use App\Models\RendezVous;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class RendezVousController extends Controller
{
    public function __construct(private NotificationService $notifService) {}

    /**
     * Mes rendez-vous (client).
     * GET /api/rendez-vous
     */
    public function index(Request $request): JsonResponse
    {
        $rdvs = RendezVous::with('atelier:id,nom,localisation,image_principale')
            ->where('client_id', $request->user()->id)
            ->orderByDesc('date_rdv')
            ->paginate(10);

        return response()->json(['rendez_vous' => $rdvs]);
    }

    /**
     * Rendez-vous reçus par l'artisan.
     * GET /api/rendez-vous (artisan)
     */
    public function indexArtisan(Request $request): JsonResponse
    {
        $atelierId = $request->user()->artisan?->atelier?->id;

        if (! $atelierId) {
            return response()->json(['message' => 'Atelier introuvable.'], 404);
        }

        $rdvs = RendezVous::with('client:id,nom,prenom,photo_profil')
            ->where('atelier_id', $atelierId)
            ->when($request->statut, fn($q) => $q->where('statut', $request->statut))
            ->orderBy('date_rdv')
            ->paginate(15);

        return response()->json(['rendez_vous' => $rdvs]);
    }

    /**
     * Détail d'un rendez-vous.
     * GET /api/rendez-vous/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $rdv = RendezVous::with(['atelier', 'client'])->findOrFail($id);

        $user    = $request->user();
        $isOwner = $rdv->client_id === $user->id
            || $rdv->atelier->artisan->utilisateur_id === $user->id;

        if (! $isOwner) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['rendez_vous' => $rdv]);
    }

    /**
     * Demander un rendez-vous (client).
     * POST /api/rendez-vous
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'atelier_id'    => ['required', 'integer', 'exists:ateliers,id'],
            'date_rdv'      => ['required', 'date', 'after:now'],
            'duree_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'message'       => ['nullable', 'string', 'max:1000'],
        ]);

        // Vérifier conflit de créneau
        $conflit = RendezVous::where('atelier_id', $data['atelier_id'])
            ->where('date_rdv', $data['date_rdv'])
            ->whereNotIn('statut', ['REFUSE', 'ANNULE'])
            ->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Ce créneau est déjà pris. Veuillez en choisir un autre.',
            ], 422);
        }

        $rdv = RendezVous::create([
            'client_id'     => $request->user()->id,
            'atelier_id'    => $data['atelier_id'],
            'date_rdv'      => $data['date_rdv'],
            'duree_minutes' => $data['duree_minutes'] ?? 60,
            'message'       => $data['message'] ?? null,
            'statut'        => 'EN_ATTENTE',
        ]);

        $rdv->load(['atelier', 'client']);

        // Notification in-app à l'artisan
        $this->notifService->nouveauRendezVous($rdv);

        return response()->json([
            'message'    => 'Demande de rendez-vous envoyée.',
            'rendez_vous'=> $rdv,
        ], 201);
    }

    /**
     * Accepter un RDV (artisan).
     * PATCH /api/rendez-vous/{id}/accepter
     */
    public function accepter(Request $request, int $id): JsonResponse
    {
        $rdv = $this->getRdvArtisan($request, $id);

        if ($rdv->statut !== 'EN_ATTENTE') {
            return response()->json(['message' => 'Ce rendez-vous ne peut plus être accepté.'], 422);
        }

        $rdv->update(['statut' => 'ACCEPTE']);
        $rdv->load(['atelier', 'client']);

        // Notification in-app
        $this->notifService->rdvAccepte($rdv);

        // Email de confirmation au client
        Mail::to($rdv->client->email)
            ->send(new ConfirmationRendezVousMail($rdv, 'ACCEPTE'));

        return response()->json(['message' => 'Rendez-vous accepté.', 'rendez_vous' => $rdv]);
    }

    /**
     * Refuser un RDV (artisan).
     * PATCH /api/rendez-vous/{id}/refuser
     */
    public function refuser(Request $request, int $id): JsonResponse
    {
        $rdv = $this->getRdvArtisan($request, $id);

        if ($rdv->statut !== 'EN_ATTENTE') {
            return response()->json(['message' => 'Ce rendez-vous ne peut plus être refusé.'], 422);
        }

        $rdv->update(['statut' => 'REFUSE']);
        $rdv->load(['atelier', 'client']);

        // Notification in-app
        $this->notifService->rdvRefuse($rdv);

        // Email de refus au client
        Mail::to($rdv->client->email)
            ->send(new ConfirmationRendezVousMail($rdv, 'REFUSE'));

        return response()->json(['message' => 'Rendez-vous refusé.', 'rendez_vous' => $rdv]);
    }

    /**
     * Annuler un RDV (client).
     * PATCH /api/rendez-vous/{id}/annuler
     */
    public function annuler(Request $request, int $id): JsonResponse
    {
        $rdv = RendezVous::where('client_id', $request->user()->id)->findOrFail($id);

        if (in_array($rdv->statut, ['ANNULE', 'REFUSE'])) {
            return response()->json(['message' => 'Ce rendez-vous est déjà annulé ou refusé.'], 422);
        }

        $rdv->update(['statut' => 'ANNULE']);
        $rdv->load(['atelier', 'client']);

        // Notification in-app à l'artisan
        $this->notifService->rdvAnnule($rdv, parClient: true);

        return response()->json(['message' => 'Rendez-vous annulé.', 'rendez_vous' => $rdv]);
    }

    // ─────────────────────────────────────────────────────────

    private function getRdvArtisan(Request $request, int $id): RendezVous
    {
        $atelierId = $request->user()->artisan?->atelier?->id;
        return RendezVous::where('atelier_id', $atelierId)->findOrFail($id);
    }
}