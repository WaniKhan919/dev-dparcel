<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomDeclaration extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'order_id',
        'shipping_type_id',
        'to_name',
        'to_business',
        'to_street',
        'to_postcode',
        'to_country',
        'to_state',
        'to_city',
        'category_commercial_sample',
        'category_gift',
        'category_returned_goods',
        'category_documents',
        'category_other',
        'explanation',
        'comments',
        'total_declared_value',
        'total_weight',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function shippingType()
    {
        return $this->belongsTo(ShippingType::class);
    }

    // TO relations
    public function toCountry()
    {
        return $this->belongsTo(Country::class, 'to_country');
    }

    public function toState()
    {
        return $this->belongsTo(State::class, 'to_state');
    }

    public function toCity()
    {
        return $this->belongsTo(City::class, 'to_city');
    }
    public function products()
    {
        return $this->hasMany(CustomDeclarationProduct::class);
    }
}