<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        $shipperOfferPrice = 0;

        if ($this->acceptedOffer) {
            $shipperOfferPrice = (float) $this->acceptedOffer->offer_price;
        }

        return [
            'id'             => encrypt($this->id),
            'request_number' => $this->request_number,
            'tracking_number' => $this->tracking_number,
            'status'         => $this->status,
            'status_title'   => $this->orderStatus?->name,
            'total_aprox_weight' => $this->total_aprox_weight,

            // ✅ shipping_type relation
            'shipping_type'  => [
                'id'    => $this->shippingType?->id,
                'title' => $this->shippingType?->title,
                'slug'  => $this->shippingType?->slug,
            ],

            // ✅ New price breakdown

            'price_breakdown' => (function () {
                $initialPrice = (float) $this->total_price;

                $offerPrice = (float) ($this->acceptedOffer?->offer_price ?? 0);

                $selectedServicesTotal = $this->acceptedOffer
                    ? (float) $this->acceptedOffer->additionalPrices
                        ->whereNotNull('service_id')
                        ->sum(fn($i) => (float) $i->price)
                    : 0;

                $additionalServicesTotal = $this->acceptedOffer
                    ? (float) $this->acceptedOffer->additionalPrices
                        ->whereNull('service_id')
                        ->sum(fn($i) => (float) $i->price)
                    : 0;

                // ✅ First subtotal
                $subTotal = $initialPrice
                    + $offerPrice
                    + $selectedServicesTotal
                    + $additionalServicesTotal;

                // ✅ Then apply fees on subtotal
                $stripeFee = ($subTotal * 4.2) / 100;
                $serviceFee = ($subTotal * 10) / 100;

                // ✅ Final payable amount
                $totalPayable = $subTotal + $stripeFee + $serviceFee;

                return [
                    'initial_price' => $initialPrice,
                    'offer_price' => $offerPrice,

                    'selected_services' => $selectedServicesTotal,
                    'additional_services' => $additionalServicesTotal,

                    'stripe_fee' => round($stripeFee, 2),
                    'service_fee' => round($serviceFee, 2),

                    // subtotal before fees
                    'grand_total' => round($subTotal, 2),

                    // final after fees
                    'total_payable' => round($totalPayable, 2),
                ];
            })(),

            // Location
            'ship_from' => [
                'country' => $this->shipFromCountry?->name,
                'state'   => $this->shipFromState?->name,
                'city'    => $this->shipFromCity?->name,
            ],
            'ship_to' => [
                'country' => $this->shipToCountry?->name,
                'state'   => $this->shipToState?->name,
                'city'    => $this->shipToCity?->name,
            ],

            // Relations
            'products'          => OrderDetailResource::collection($this->whenLoaded('orderDetails')),
            // 'services'          => OrderServiceResource::collection($this->whenLoaded('orderServices')),
            'trackings'         => OrderTrackingResource::collection($this->whenLoaded('orderTrackings')),
            'accepted_offer'    => $this->acceptedOffer,
            'order_payment'     => $this->orderPayment,
            'custom_declaration' => $this->customDeclaration,
            'services' => $this->mergeServices(),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
    private function mergeServices()
    {
        $services = $this->orderServices ?? collect();
        $additionalPrices = optional($this->acceptedOffer)->additionalPrices ?? collect();

        // map additional prices by service_id
        $priceMap = $additionalPrices->keyBy('service_id');

        $merged = $services->map(function ($service) use ($priceMap) {
            $price = optional($priceMap->get($service->service_id))->price;

            return [
                'service_id' => $service->service_id,
                'title'      => $service->service->title ?? null,
                'price'      => $price,
            ];
        });

        // add extra prices jahan service_id null hai (like GST etc)
        $extra = $additionalPrices
            ->whereNull('service_id')
            ->map(function ($item) {
                return [
                    'service_id' => null,
                    'title'      => $item->title,
                    'price'      => $item->price,
                ];
            });

        return $merged->merge($extra)->values();
    }
}
