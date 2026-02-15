<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sanction;
use Illuminate\Http\Request;

class SanctionController extends Controller
{
    public function index()
    {
        return response()->json(Sanction::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:warning,suspension,ban',
            'description' => 'required|string',
            'duration' => 'nullable|integer',
        ]);

        $sanction = Sanction::create($validated);
        return response()->json($sanction, 201);
    }

    public function show($id)
    {
        $sanction = Sanction::findOrFail($id);
        return response()->json($sanction, 200);
    }

    public function update(Request $request, $id)
    {
        $sanction = Sanction::findOrFail($id);

        $validated = $request->validate([
            'type' => 'in:warning,suspension,ban',
            'description' => 'string',
            'duration' => 'nullable|integer',
        ]);

        $sanction->update($validated);
        return response()->json($sanction, 200);
    }

    public function destroy($id)
    {
        Sanction::findOrFail($id)->delete();
        return response()->json(['message' => 'Sanction supprimée'], 200);
    }
}
