<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderOfferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'message' => $this->message,
            'status' => $this->status,
            'offer_price' => $this->offer_price,
            'shipper' => $this->shipper,
            'additional_prices' => $this->additionalPrices ?? [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'order' =>   new OrderResource($this->order)
        ];
    }
}
