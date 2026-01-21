<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointments extends Model
{
    //
    protected $fillable =[
        'date_rendezvous',
        'heure_rendezvous',
        'duree',
        'service',
        'addresse',
        'ville',
        'user_id'
    ];
}
