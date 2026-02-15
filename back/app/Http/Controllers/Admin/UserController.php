<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // Retourner la liste des utilisateurs
    }

    public function show($id)
    {
        // Afficher un utilisateur spécifique
    }

    public function update(Request $request, $id)
    {
        // Mettre à jour un utilisateur
    }

    public function destroy($id)
    {
        // Supprimer un utilisateur
    }
}
