<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'weight' => $this->weight,
            'status' => $this->status,
            'product_request_number' => $this->request_details_number,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
