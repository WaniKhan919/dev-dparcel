<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StripeAccount extends Model
{
     use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_account_id',
        'stripe_onboarded',
        'stripe_charges_enabled',
        'stripe_details_submitted',
    ];

    // relation with user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
