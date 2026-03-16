<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderServiceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'service_id' => $this->service_id,
            'title' => $this->service?->title,
            'price' => $this->service?->price,
            'description' => $this->service?->description,
        ];
    }
}
