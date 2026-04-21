<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => encrypt($this->id),
            'title' => $this->title,
            'shipping_type_id' => encrypt($this->shipping_type_id),
            'shipping_type' => $this->shippingType->title,
            'description' => $this->description,
            'is_required' => (bool) $this->is_required,
            'status' => (int) $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
