<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderOfferPrice extends Model
{
    protected $fillable = [
        'order_offer_id',
        'service_id',
        'title',
        'price',
    ];

    public function orderOffer()
    {
        return $this->belongsTo(OrderOffer::class,'order_offer_id', 'id');
    }
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
        
}
