<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ArtisanController extends Controller
{
    public function index()
    {
        $artisans = User::where('role', 'ARTISAN')->get();
        return response()->json($artisans, 200);
    }

    public function show($id)
    {
        $artisan = User::where('role', 'ARTISAN')->findOrFail($id);
        return response()->json($artisan, 200);
    }

    public function approve(Request $request, $id)
    {
        $artisan = User::where('role', 'ARTISAN')->findOrFail($id);

        $artisan->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);

        return response()->json($artisan, 200);
    }

    public function reject(Request $request, $id)
    {
        $artisan = User::where('role', 'ARTISAN')->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $artisan->update([
            'verification_status' => 'rejected',
        ]);

        return response()->json($artisan, 200);
    }
}
