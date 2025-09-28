<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatus extends Model
{
    use HasFactory;

    protected $fillable = ['name','description'];

    public function tracking()
    {
        return $this->hasMany(OrderTracking::class, 'status_id');
    }
}
