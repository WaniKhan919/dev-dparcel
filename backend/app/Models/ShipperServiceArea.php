<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipperServiceArea extends Model
{
    protected $table = 'shipper_service_areas'; 

    protected $fillable = [
        'shipper_id',
        'city_id',
    ];

    public $timestamps = true;
}
