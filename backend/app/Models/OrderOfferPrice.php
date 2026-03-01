<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderOfferPrice extends Model
{
    protected $fillable = [
        'order_offer_id',
        'title',
        'price',
    ];
}
