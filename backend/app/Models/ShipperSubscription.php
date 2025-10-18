<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShipperSubscription extends Model
{
    use HasFactory;

    // Allow mass assignment for these fields
    protected $fillable = [
        'shipper_id',
        'shipper_level_id',
        'amount',
        'status',
        'start_date',
        'end_date',
        'transaction_id',
        'payment_method',
        'currency',
        'stripe_payment_intent',
        'stripe_payment_method',
        'stripe_charge_id',
    ];
    public function level()
    {
        return $this->belongsTo(ShipperLevel::class, 'shipper_level_id');
    }
}
