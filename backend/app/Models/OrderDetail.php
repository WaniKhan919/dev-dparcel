<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'weight',
    ];
    
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
