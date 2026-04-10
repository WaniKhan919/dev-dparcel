<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'product_url',
        'quantity',
        'price',
        'weight',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function productTracking()
    {
        return $this->belongsTo(ProductTracking::class,'id','product_id');
    }
    public function approvedProductTracking()
    {
        return $this->belongsTo(ProductTracking::class, 'id', 'product_id')
                    ->where('status', 1);
    }
    public function customDeclerationProduct()
    {
        return $this->hasOne(CustomDeclarationProduct::class,'product_id', 'id' );
    }

}
