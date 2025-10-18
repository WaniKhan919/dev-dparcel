<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipperLevelShippingType extends Model
{
    protected $fillable = [
        'shipper_level_id',
        'shipping_type_id',
    ];
}
