<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipperLevel extends Model
{
    protected $fillable = ['title', 'fee', 'max_orders', 'max_locations', 'status'];
    public function shippingTypes()
    {
        return $this->belongsToMany(ShippingType::class, 'shipper_level_shipping_types');
    }
    public function subscriptions()
    {
        return $this->hasMany(ShipperSubscription::class, 'shipper_level_id')
                    ->where('shipper_id', auth()->id()) 
                    ->where('status', 1);
    }

}
