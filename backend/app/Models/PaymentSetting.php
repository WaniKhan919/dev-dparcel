<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'shipping_types_id',
        'title',
        'amount',
        'type',
        'description',
        'active',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function shippingType()
    {
        return $this->belongsTo(ShippingType::class, 'shipping_types_id');
    }
}
