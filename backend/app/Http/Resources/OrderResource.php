<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'request_number' => $this->request_number,
            'tracking_number' => $this->tracking_number,
            'service_type' => $this->service_type,
            'status' => $this->status,
            'total_price' => $this->total_price,
            'total_weight' => $this->total_aprox_weight,

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