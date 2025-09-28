<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    protected $fillable = [
        'order_id',
        'shopper_id',
        'shipper_id',
        'amount',
        'currency',
        'stripe_payment_intent',
        'stripe_payment_method',
        'status',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class,'order_id', 'id');
    }

    public function shipper()
    {
        return $this->belongsTo(User::class,'shipper_id', 'id');
    }
    public function shopper()
    {
        return $this->belongsTo(User::class,'shopper_id', 'id');
    }
}
