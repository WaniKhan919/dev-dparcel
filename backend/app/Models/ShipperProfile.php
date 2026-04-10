<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipperProfile extends Model
{
    protected $fillable = [
        'user_id',
        'mobile_number',
        'facebook_url',
        'instagram_url',
        'references',
    ];

    protected $casts = [
        'references' => 'array',
    ];
    protected $attributes = [
        'approval_status' => 'pending',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
