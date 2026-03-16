<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderTrackingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'status' => $this->status?->name,
            'tracking_number' => $this->tracking_number,
            'remarks' => $this->remarks,
            'attachments' => $this->attachments,
            'created_at' => $this->created_at,
        ];
    }
}