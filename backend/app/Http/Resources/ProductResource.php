<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'price' => $this->price,
            'weight' => $this->weight,
            'product_url' => $this->product_url,

            'tracking' => new ProductTrackingResource($this->whenLoaded('productTracking')),
        ];
    }
}
