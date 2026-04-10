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
                'orders' => collect(),
            ];
        }

        // Orders that are already processed for this shipper
        $excludedOrders = OrderOffer::where('user_id', $this->id)
            ->whereIn('status', ['inprogress', 'accepted', 'rejected', 'cancelled', 'ignored'])
            ->pluck('order_id');

        $allOrders = collect();
        $shipperRoleId = DB::table('user_roles')->where('user_id', $this->id)->value('role_id');

        foreach ($subscriptions as $subscription) {
            $level = $subscription->level;
            if (!$level) continue;

            $allowedServices = $level->shippingTypes->pluck('slug')->toArray();
            if (!empty($allowedServices)) {

                $serviceCountryIds = $this->serviceAreas()->pluck('country_id')->toArray();

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
                    ->whereIn('service_type', $allowedServices)
                    ->where(function ($query) use ($serviceCountryIds) {
                        $query->whereIn('ship_from_country_id', $serviceCountryIds)
                            ->orWhereIn('ship_to_country_id', $serviceCountryIds);
                    })
                    ->orderBy('id', 'desc')
                    ->get();

                $allOrders = $allOrders->merge($orders);
            }
        }

        // Agar koi orders nahi mile toh early return
        if ($allOrders->isEmpty()) {
            return [
                'subscriptions' => $subscriptions,
                'orders' => collect(),
            ];
        }

        // Sirf 2 queries — N+1 se bachao
        $shippingTypes = ShippingType::whereIn('slug', $allOrders->pluck('service_type')->unique())
            ->get()
            ->keyBy('slug');

        $paymentSettings = PaymentSetting::where('role_id', $shipperRoleId)
            ->where('active', 1)
            ->whereIn('shipping_types_id', $shippingTypes->pluck('id'))
            ->get()
            ->groupBy('shipping_types_id');

        return [
            'subscriptions' => $subscriptions,
            'orders' => $allOrders->unique('id')->values()->map(function ($order) use ($shippingTypes, $paymentSettings) {

                $shippingType   = $shippingTypes->get($order->service_type);
                $paymentSetting = $shippingType ? $paymentSettings->get($shippingType->id) : null;

                $totalPrice = (float) $order->total_price;
                $totalDeductions = 0;
                $formattedPaymentSettings = [];

                if ($paymentSetting) {
                    foreach ($paymentSetting as $p) {
                        $deduction = 0;

                        if ($p->type === 'percent') {
                            $deduction = round(($p->amount / 100) * $totalPrice, 2); // % of original total
                        } elseif ($p->type === 'fixed') {
                            $deduction = round((float) $p->amount, 2);
                        }

                        $totalDeductions += $deduction;

                        $formattedPaymentSettings[] = [
                            'id'              => $p->id,
                            'title'           => $p->title,
                            'amount'          => $p->amount,
                            'type'            => $p->type,
                            'description'     => $p->description,
                            'deducted_amount' => $deduction, // kitna kata
                        ];
                    }
                }

                $shipperEarning = round($totalPrice - $totalDeductions, 2); // shipper ko milega

                return [
                    'id'                  => $order->id,
                    'user_id'             => $order->user_id,
                    'service_type'        => $order->service_type,
                    'total_aprox_weight'  => $order->total_aprox_weight,
                    'total_price'         => $totalPrice,
                    'tracking_number'     => $order->tracking_number,
                    'request_number'      => $order->request_number,
                    'status'              => $order->status,
                    'created_at'          => $order->created_at,
                    'updated_at'          => $order->updated_at,
                    'ship_from_country'   => $order->shipFromCountry?->name,
                    'ship_from_state'     => $order->shipFromState?->name,
                    'ship_from_city'      => $order->shipFromCity?->name,
                    'ship_to_country'     => $order->shipToCountry?->name,
                    'ship_to_state'       => $order->shipToState?->name,
                    'ship_to_city'        => $order->shipToCity?->name,
                    'order_details'       => $order->orderDetails,
                    'order_services'       => $order->orderServices,
                    'user'                => $order->user,
                    'total_deductions'    => $totalDeductions,
                    'remening_earning'     => $shipperEarning,
                    'payment_setting'     => $formattedPaymentSettings,
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
