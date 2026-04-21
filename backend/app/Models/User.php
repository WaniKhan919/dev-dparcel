<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
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
    public function serviceAreas()
    {
        return $this->hasMany(ShipperServiceArea::class, 'shipper_id');
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
                'orders'        => collect(),
            ];
        }

        $excludedOrders = OrderOffer::where('user_id', $this->id)
            ->whereIn('status', ['pending','inprogress', 'accepted', 'rejected', 'cancelled', 'ignored'])
            ->pluck('order_id');

        $allOrders     = collect();
        $serviceCountryIds = $this->serviceAreas()->pluck('country_id')->toArray();

        foreach ($subscriptions as $subscription) {
            $level = $subscription->level;
            if (!$level) continue;

            $allowedShippingTypeIds = $level->shippingTypes->pluck('id')->toArray();
            if (empty($allowedShippingTypeIds)) continue;

            $orders = Order::with([
                'orderServices.service',
                'orderDetails.product',
                'user',
                'shipFromCountry:id,name',
                'shipFromState:id,name',
                'shipFromCity:id,name',
                'shipToCountry:id,name',
                'shipToState:id,name',
                'shipToCity:id,name'
            ])
                ->whereNotIn('id', $excludedOrders)
                ->whereIn('shipping_type_id', $allowedShippingTypeIds)
                ->where(function ($query) use ($serviceCountryIds) {
                    $query->whereIn('ship_from_country_id', $serviceCountryIds)
                        ->orWhereIn('ship_to_country_id', $serviceCountryIds);
                })
                ->orderBy('id', 'desc')
                ->get();

            $allOrders = $allOrders->merge($orders);
        }

        if ($allOrders->isEmpty()) {
            return [
                'subscriptions' => $subscriptions,
                'orders'        => collect(),
            ];
        }

        $shippingTypes = ShippingType::whereIn('id', $allOrders->pluck('shipping_type_id')->unique())
            ->get()
            ->keyBy('id');

        return [
            'subscriptions' => $subscriptions,
            'orders' => $allOrders->unique('id')->values()->map(function ($order) use ($shippingTypes) {

                $shippingType   = $shippingTypes->get($order->shipping_type_id); 

                return [
                    'id'                 => encrypt($order->id),
                    'user_id'            => $order->user_id,
                    'shipping_type_id'   => $order->shipping_type_id,
                    'shipping_type'      => $shippingType?->title,
                    'shipping_type_slug' => $shippingType?->slug,
                    'total_aprox_weight' => $order->total_aprox_weight,
                    'total_price'        => (float) $order->total_price,
                    'stripe_fee'         => (float) $order->stripe_fee,
                    'service_fee'        => (float) $order->service_fee,
                    'grand_total'        => (float) $order->grand_total,
                    'tracking_number'    => $order->tracking_number,
                    'request_number'     => $order->request_number,
                    'status'             => $order->status,
                    'created_at'         => $order->created_at,
                    'ship_from_country'  => $order->shipFromCountry?->name,
                    'ship_from_state'    => $order->shipFromState?->name,
                    'ship_from_city'     => $order->shipFromCity?->name,
                    'ship_to_country'    => $order->shipToCountry?->name,
                    'ship_to_state'      => $order->shipToState?->name,
                    'ship_to_city'       => $order->shipToCity?->name,
                    'order_details'      => $order->orderDetails,
                    'order_services'     => $order->orderServices,
                    'user'               => $order->user,
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
    public function activeSubscription()
    {
        return $this->hasOne(ShipperSubscription::class, 'shipper_id')
            ->with('level')
            ->where('status', 'active')
            ->orderBy('start_date', 'desc');
    }
    public function shipperProfile()
    {
        return $this->hasOne(ShipperProfile::class);
    }
}
