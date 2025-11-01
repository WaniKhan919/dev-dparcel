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
        'city_id'
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

        // foreach ($subscriptions as $subscription) {
        //     $level = $subscription->level;

        //     if (!$level) continue; // safeguard

        //     // Get allowed service slugs
        //     $allowedServices = $level->shippingTypes->pluck('slug')->toArray();

        //     if (!empty($allowedServices)) {
        //         $orders = Order::with([
        //             'orderDetails.product',
        //             'user',
        //             'shipFromCountry',
        //             'shipFromState',
        //             'shipFromCity',
        //             'shipToCountry',
        //             'shipToState',
        //             'shipToCity'
        //         ])
        //             ->whereNotIn('id', $excludedOrders)
        //             ->whereIn('service_type', $allowedServices)
        //             ->orderBy('id', 'desc')
        //             ->get();

        //         $allOrders = $allOrders->merge($orders);
        //     }
        // }

        foreach ($subscriptions as $subscription) {
            $level = $subscription->level;

            if (!$level) continue; // safeguard

            // Get allowed service slugs
            $allowedServices = $level->shippingTypes->pluck('slug')->toArray();

            if (!empty($allowedServices)) {
                // Get the user's state and city
                $userStateId = $this->city?->state_id; // Assuming relation user->city->state_id
                $userCityId = $this->city_id;

                $orders = Order::with([
                    'orderDetails.product',
                    'user',
                    'shipFromCountry',
                    'shipFromState',
                    'shipFromCity',
                    'shipToCountry',
                    'shipToState',
                    'shipToCity'
                ])
                    ->whereNotIn('id', $excludedOrders)
                    ->whereIn('service_type', $allowedServices)
                    ->where(function ($query) use ($userStateId, $userCityId) {
                        // Orders must match the same state
                        $query->where('ship_from_state_id', $userStateId)
                            ->orWhere('ship_to_state_id', $userStateId);
                    })
                    ->orderBy('id', 'desc')
                    ->get();

                $allOrders = $allOrders->merge($orders);
            }
        }

        return [
            'subscriptions' => $subscriptions,
            'orders' => $allOrders->unique('id')->values()->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'service_type' => $order->service_type,
                    'total_aprox_weight' => $order->total_aprox_weight,
                    'total_price' => $order->total_price,
                    'tracking_number' => $order->tracking_number,
                    'request_number' => $order->request_number,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'ship_from_country' => $order->shipFromCountry?->name,
                    'ship_from_state' => $order->shipFromState?->name,
                    'ship_from_city' => $order->shipFromCity?->name,
                    'ship_to_country' => $order->shipToCountry?->name,
                    'ship_to_state' => $order->shipToState?->name,
                    'ship_to_city' => $order->shipToCity?->name,
                    'order_details' => $order->orderDetails,
                    'user' => $order->user,
                ];
            }),
        ];
    }
    public function stripeAccount()
    {
        return $this->hasOne(StripeAccount::class);
    }
    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
