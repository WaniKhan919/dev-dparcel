<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        $initialTotal = (float) $this->total_price;

        $shipperOfferPrice = 0;
        $shipperAdditional = 0;

        if ($this->acceptedOffer) {
            $shipperOfferPrice = (float) $this->acceptedOffer->offer_price;

            $shipperAdditional = collect($this->acceptedOffer->additionalPrices)->sum(function ($item) {
                return (float) $item->price;
            });
        }

        $shipperTotal = $shipperOfferPrice + $shipperAdditional;

        // Final payable logic
        if ($this->service_type === 'buy_for_me') {
            $totalPayable = $initialTotal + $shipperTotal;
        } else {
            // ship_for_me
            $totalPayable = $shipperTotal;
        }
        return [
            'id' => $this->id,
            'request_number' => $this->request_number,
            'service_type' => $this->service_type,
            'status' => $this->status,
            'status_title' => $this->orderStatus->name,
            'total_price' => $this->total_price,
            'total_weight' => $this->total_aprox_weight,

            'price_breakdown' => [
                'initial_total' => $initialTotal,
                'shipper_offer_price' => $shipperOfferPrice,
                'shipper_additional_charges' => $shipperAdditional,
                'shipper_total' => $shipperTotal,
                'total_payable' => $totalPayable,
            ],

            'ship_from' => [
                'country' => $this->shipFromCountry?->name,
                'state' => $this->shipFromState?->name,
                'city' => $this->shipFromCity?->name,
            ],

            'ship_to' => [
                'country' => $this->shipToCountry?->name,
                'state' => $this->shipToState?->name,
                'city' => $this->shipToCity?->name,
            ],

            'products' => OrderDetailResource::collection($this->whenLoaded('orderDetails')),

            'services' => OrderServiceResource::collection($this->whenLoaded('orderServices')),

            'trackings' => OrderTrackingResource::collection($this->whenLoaded('orderTrackings')),

            'acceptedOffer' =>  new OrderOfferResource($this->whenLoaded('acceptedOffer')),

            'customDeclaration' => $this->customDeclaration,
            'created_at' => $this->created_at,
        ];
    }
}