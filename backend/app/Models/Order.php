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
        'status',
    ];

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
