<?php

namespace App\Models;

use Illuminate\Support\Str;
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
        'tracking_number',
        'request_number',
        'status',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            do {
                $requestNumber = 'REQ-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
            } while (Order::where('request_number', $requestNumber)->exists());

            $order->request_number = $requestNumber;
        });
    }


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
    public function orderServices()
    {
        return $this->hasMany(OrderService::class);
    }
    public function orderTrackings()
    {
        return $this->hasMany(OrderTracking::class);
    }
    public function orderStatus()
    {
        return $this->belongsTo(OrderStatus::class,'status_id','id');
    }
}
