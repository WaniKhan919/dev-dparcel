<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class OrderMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'order_id'     => $this->order_id,
            'sender_id'    => $this->sender_id,
            'receiver_id'  => $this->receiver_id,
            'message_text' => $this->message_text,
            'attachments'  => $this->attachments->map(function ($attachment) {
                return [
                    'id'        => $attachment->id,
                    'file_path' => asset('order_attachments/' . basename($attachment->file_path)),
                    'file_type' => $attachment->file_type,
                ];
            }),
            'status'       => $this->status,
            'approved_by'  => $this->approved_by,
            'created_at'   => Carbon::parse($this->created_at)->format('d M Y h:i a'),
            'updated_at'   => Carbon::parse($this->updated_at)->format('d M Y h:i a'),

            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id'    => $this->sender->id,
                    'name'  => $this->sender->name,
                    'email' => $this->sender->email,
                    'role' => $this->sender?->roles?->pluck('name')->first(),

                ];
            }),

            'receiver' => $this->whenLoaded('receiver', function () {
                return [
                    'id'    => $this->receiver->id,
                    'name'  => $this->receiver->name,
                    'email' => $this->receiver->email,
                    'role' => $this->receiver?->roles?->pluck('name')->first(),
                ];
            }),
        ];
    }
}
