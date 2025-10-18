<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'status',
        'verification_code',
        'verification_code_expires_at',
        'is_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    // Helper: check role
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    public function subscriptions()
    {
        return $this->hasMany(ShipperSubscription::class, 'shipper_id')
            ->where('status', 'active');
    }
    public function subscriptionsWithOrders(): array
    {
        $subscriptions = $this->subscriptions()->with('level.shippingTypes')->get();

        if ($subscriptions->isEmpty()) {
            return [
                'subscriptions' => collect(),
                'orders' => collect(),
            ];
        }

        // Orders that are already processed for this shipper
        $excludedOrders = OrderOffer::where('user_id', $this->id)
            ->whereIn('status', ['accepted', 'rejected', 'cancelled', 'ignored'])
            ->pluck('order_id');

        $allOrders = collect();

        foreach ($subscriptions as $subscription) {
            $level = $subscription->level;

            if (!$level) continue; // safeguard

            // Get allowed service slugs
            $allowedServices = $level->shippingTypes->pluck('slug')->toArray();

            if (!empty($allowedServices)) {
                $orders = Order::with(['orderDetails.product', 'user'])
                    ->whereNotIn('id', $excludedOrders)
                    ->whereIn('service_type', $allowedServices)
                    ->orderBy('id', 'desc')
                    ->get();

                $allOrders = $allOrders->merge($orders);
            }
        }

        return [
            'subscriptions' => $subscriptions,
            'orders' => $allOrders->unique('id')->values(),
        ];
    }
}
