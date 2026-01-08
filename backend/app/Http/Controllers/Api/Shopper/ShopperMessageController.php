<?php

namespace App\Http\Controllers\Api\Shopper;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderMessage;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;

class ShopperMessageController extends Controller
{
    public function chatContacts(Request $request)
    {
        try {
            $shipperId = Auth::id();

            $orders = Order::whereHas('offers', function ($q) use ($shipperId) {
                $q->where('user_id', $shipperId)
                    ->where('status', 'accepted');
            })
                ->with([
                    // last approved message
                    'messages' => function ($q) {
                        $q->where('status', 'approved')->latest();
                    },
                    'user:id,name'
                ])
                ->withCount([
                    // ✅ unread count
                    'messages as unread_count' => function ($q) use ($shipperId) {
                        $q->where('receiver_id', $shipperId)
                            ->where('status', 'approved')
                            ->where('is_read', false);
                    }
                ])
                ->get();

            $orders = $orders->map(function ($order) {
                $lastMessage = $order->messages->first();

                return [
                    'order_id'       => $order->id,
                    'request_number' => $order->request_number,
                    'service_type'   => $order->service_type,
                    'status'         => $order->status,
                    'receiver_id'    => $order->user->id,
                    'shopper_name'   => $order->user?->name,

                    // last message
                    'last_message'   => $lastMessage?->message_text,
                    'last_time'      => $lastMessage?->created_at?->format('g:i A'),

                    // 🔴 unread badge count
                    'unread_count'   => $order->unread_count,
                ];
            });

            return response()->json([
                'success' => true,
                'data'    => $orders,
            ], 200);
        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $ex->getMessage(),
            ], 500);
        }
    }

    public function messages($orderId)
    {
        try {
            $userId = Auth::id();
            $userRole = Auth::user()->hasRole('shipper') ? 'shipper' : 'shopper';

            // Order access check
            $orderQuery = Order::where('id', $orderId);

            if ($userRole === 'shopper') {
                $orderQuery->where('user_id', $userId);
            } elseif ($userRole === 'shipper') {
                $orderQuery->whereHas('offers', function ($q) use ($userId) {
                    $q->where('user_id', $userId)
                        ->where('status', 'accepted');
                });
            }

            $order = $orderQuery->firstOrFail();

            // If order closed → chat closed
            if ($order->status == 9) {
                return response()->json([
                    'success' => true,
                    'chat_closed' => true,
                    'data' => []
                ], 200);
            }

            // 🔴 MARK UNREAD → READ
            OrderMessage::where('order_id', $orderId)
                ->where('receiver_id', $userId)
                ->where('status', 'approved')
                ->where('is_read', false)
                ->update([
                    'is_read' => true
                ]);

            // ✅ CORE FIX IS HERE
            $messages = OrderMessage::where('order_id', $orderId)
                ->where(function ($q) use ($userId) {
                    $q->where('status', 'approved')
                        ->orWhere('sender_id', $userId);
                })
                ->with(['sender:id,name', 'attachments'])
                ->orderBy('created_at')
                ->get()
                ->map(function ($msg) {
                    $msg->attachments->map(function ($file) {
                        // Public directory se direct URL
                        $file->file_path = asset($file->file_path);
                        return $file;
                    });
                    return $msg;
                });

            return response()->json([
                'success' => true,
                'chat_closed' => false,
                'data' => $messages,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or access denied',
            ], 404);
        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
            ], 500);
        }
    }
    public function unreadChatContacts()
    {
        try {
            $userId = Auth::id();

            $unreadContacts = OrderMessage::where('receiver_id', $userId)
                ->where('status', 'approved')
                ->where('is_read', 0)
                ->with('sender:id,name')
                ->selectRaw('
                                    sender_id,
                                    message_text,
                                    order_id,
                                    COUNT(*) as unread_count,
                                    MAX(created_at) as last_message_time
                                ')
                ->groupBy('sender_id', 'order_id', 'message_text')
                ->orderByDesc('last_message_time')
                ->get()
                ->map(function ($item) {
                    return [
                        'order_id'          => $item->order_id,
                        'message_text'          => $item->message_text,
                        'username'          => $item->sender->name,
                        'unread_count'      => $item->unread_count,
                        'last_message_time' => Carbon::parse($item->last_message_time)->diffForHumans(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $unreadContacts,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
            ], 500);
        }
    }
}
