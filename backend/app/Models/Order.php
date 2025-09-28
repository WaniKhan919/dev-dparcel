<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'service_type',
        'ship_from',
        'ship_to',
        'total_aprox_weight',
        'total_price',
        'is_product_photo',
        'is_package_consolidation',
        'is_purchase_assistance',
        'is_forwarding_service_fee',
        'tracking_number',
        'status',
    ];

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function orderOffer()
    {
        return $this->hasOne(OrderOffer::class);
    }
    public function offers()
    {
        return $this->hasMany(OrderOffer::class, 'order_id', 'id');
    }
    public function acceptedOffer()
    {
        return $this->hasOne(OrderOffer::class)->where('status', 'accepted');
    }
    public function orderPayment()
    {
        return $this->hasOne(OrderPayment::class,'order_id','id');
    }
}
