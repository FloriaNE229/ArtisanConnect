<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Signalement;
use Illuminate\Http\Request;

class SignalementController extends Controller
{
    public function index()
    {
        return response()->json(Signalement::all(), 200);
    }

    public function show($id)
    {
        $signalement = Signalement::findOrFail($id);
        return response()->json($signalement, 200);
    }

    public function resolve(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:resolved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $signalement->update($validated);
        return response()->json($signalement, 200);
    }
}
