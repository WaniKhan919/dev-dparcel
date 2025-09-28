<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderPaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'order_id'             => $this->order_id,
            'shopper_id'           => $this->shopper_id,
            'shipper_id'           => $this->shipper_id,
            'amount'               => $this->amount,
            'currency'             => $this->currency,
            'stripe_payment_intent'=> $this->stripe_payment_intent,
            'stripe_payment_method'=> $this->stripe_payment_method,
            'status'               => $this->status,
            'created_at'           => Carbon::parse($this->created_at)->format('d M Y g:i a'),

            // relationships
            'shopper' => $this->whenLoaded('shopper'),
            'shipper' => $this->whenLoaded('shipper'),
            'order'   => $this->whenLoaded('order'),
        ];
    }
}
