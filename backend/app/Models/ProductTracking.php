<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTracking extends Model
{
    protected $fillable = [
        'product_id',
        'purchase_status',
        'tracking_link',
        'tracking_id',
        'product_receipt',
        'status'
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
