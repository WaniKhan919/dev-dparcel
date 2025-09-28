<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderTracking extends Model
{
     use HasFactory;

    protected $table = 'order_trackings';

    protected $fillable = [
        'order_id',
        'status_id',
        'remarks',
        'attachments',
        'tracking_number'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function status()
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }
    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'related_id')->where('type', 1);
    }
}
