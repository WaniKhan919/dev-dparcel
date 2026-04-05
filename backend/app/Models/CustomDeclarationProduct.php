<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomDeclarationProduct extends Model
{
    protected $fillable = [
        'custom_declaration_id',
        'product_id',
        'hs_code',
        'origin_country',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
