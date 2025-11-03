<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomDeclaration extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id', 'order_id', 'shipping_type_id', 'export_reason', 'purpose_of_shipment',
        'total_declared_value', 'currency', 'total_weight', 'unit_of_weight',
        'country_id', 'state_id', 'city_id', 'receiver_name', 'receiver_phone',
        'receiver_address', 'postal_code', 'contains_prohibited_items', 'contains_liquids',
        'contains_batteries', 'is_fragile', 'is_dutiable', 'additional_info',
        'declaration_number', 'status', 'submitted_at'
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
 
    public function country()
    {
        return $this->belongsTo(Country::class);
    }
 
    public function state()
    {
        return $this->belongsTo(State::class);
    }
 
    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
