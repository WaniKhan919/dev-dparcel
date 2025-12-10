<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderOffer extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'message',
        'status',
        'offer_price',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class,);
    }

    public function shipper()
    {
        return $this->belongsTo(User::class,'user_id', 'id');
    }
}
