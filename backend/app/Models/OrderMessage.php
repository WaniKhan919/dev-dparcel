<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'sender_id',
        'receiver_id',
        'message_text',
        'attachments',
        'status',
        'approved_by',
        'approved_at'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
