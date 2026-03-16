<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductTrackingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'purchase_status' => $this->purchase_status,
            'tracking_id' => $this->tracking_id,
            'tracking_link' => $this->tracking_link,
            'status' => $this->status,
            'product_receipt' => public_file_url($this->product_receipt),
        ];
    }
}
