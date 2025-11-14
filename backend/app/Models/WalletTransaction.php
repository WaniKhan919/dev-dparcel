<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 
class WalletTransaction extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id',
        'order_id',
        'shipping_type_id',
        'transaction_type',
        'amount',
        'stripe_fee',
        'commission',
        'description',
        'status',
    ];
 
    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}