<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomDeclaration extends Model
{
    use HasFactory;
 
   protected $fillable = [
        // Relations
        'user_id',
        'order_id',
        'shipping_type_id',

        // FROM fields
        'from_name',
        'from_business',
        'from_street',
        'from_postcode',
        'from_country',
        'from_state',
        'from_city',

        // TO fields
        'to_name',
        'to_business',
        'to_street',
        'to_postcode',
        'to_country',
        'to_state',
        'to_city',

        // Importer info
        'importer_reference',
        'importer_contact',

        // Categories
        'category_commercial_sample',
        'category_gift',
        'category_returned_goods',
        'category_documents',
        'category_other',

        // Extra info
        'explanation',
        'comments',
        'office_origin_posting',

        // Documents
        'doc_licence',
        'doc_certificate',
        'doc_invoice',

        // Common fields
        'total_declared_value',
        'total_weight',

        // Flags
        'contains_prohibited_items',
        'contains_liquids',
        'contains_batteries',
        'is_fragile',

        // System fields
        'declaration_number',
        'status',
        'submitted_at',
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
     // FROM relations
    public function fromCountry() { return $this->belongsTo(Country::class, 'from_country'); }
    public function fromState() { return $this->belongsTo(State::class, 'from_state'); }
    public function fromCity() { return $this->belongsTo(City::class, 'from_city'); }

    // TO relations
    public function toCountry() { return $this->belongsTo(Country::class, 'to_country'); }
    public function toState() { return $this->belongsTo(State::class, 'to_state'); }
    public function toCity() { return $this->belongsTo(City::class, 'to_city'); }

}
