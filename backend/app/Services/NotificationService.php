<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public static function createNotification(array $data)
    {
        try {
            return Notification::create([
                'user_id' => $data['user_id'],
                'sender_id' => $data['sender_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'offer_id' => $data['offer_id'] ?? null,
                'order_message_id' => $data['order_message_id'] ?? null,
                'type' => $data['type'],
                'title' => $data['title'] ?? null,
                'message' => $data['message'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage());
        }
    }
}
