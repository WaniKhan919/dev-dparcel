<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipperLevelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => encrypt($this->id),
            'title' => $this->title,
            'fee' => $this->fee,
            'max_orders' => $this->max_orders,
            'max_locations' => $this->max_locations,
            'status' => $this->status,

            // ✅ only required fields
            'shipping_types' => $this->shippingTypes->map(function ($type) {
                return [
                    'id' => encrypt($type->id),
                    'title' => $type->title,
                    'slug' => $type->slug,
                ];
            }),

            // ✅ direct ids array (frontend ke liye easy)
            'shipping_type_ids' => $this->shippingTypes->pluck('id')->map(function ($id) {
                return encrypt($id);
            }),
        ];
    }
}
