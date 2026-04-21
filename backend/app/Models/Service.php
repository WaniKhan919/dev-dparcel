<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'title',
        'shipping_type_id',
        'description',
        'is_required',
        'status',
    ];
    public function shippingType()
    {
        return $this->belongsTo(ShippingType::class, 'shipping_type_id');
    }
}
