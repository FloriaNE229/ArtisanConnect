<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class NotificationController extends Controller
{
    /**
     * Mes notifications (paginées).
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('destinataire_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $nonLues = Notification::where('destinataire_id', $request->user()->id)
            ->where('lu', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'non_lues'      => $nonLues,
        ]);
    }

    /**
     * Marquer une notification comme lue.
     * PATCH /api/notifications/{id}/lu
     */
    public function marquerLue(Request $request, int $id): JsonResponse
    {
        $notif = Notification::where('destinataire_id', $request->user()->id)->findOrFail($id);
        $notif->marquerCommeLue();

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * Marquer toutes les notifications comme lues.
     * PATCH /api/notifications/lire-tout
     */
    public function marquerToutesLues(Request $request): JsonResponse
    {
        $count = Notification::where('destinataire_id', $request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['message' => "{$count} notification(s) marquée(s) comme lue(s)."]);
    }

    /**
     * Supprimer une notification.
     * DELETE /api/notifications/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notif = Notification::where('destinataire_id', $request->user()->id)->findOrFail($id);
        $notif->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }
}
