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
            $shopperId = Auth::id();

            $orders = Order::where('user_id', $shopperId) // shopper ka order
                ->whereHas('orderOffer', function ($q) {
                    $q->where('status', 'accepted'); // sirf accepted offer
                })
                ->with([
                    // last approved message
                    'messages' => function ($q) {
                        $q->where('status', 'approved')->latest();
                    },

                    // accepted offer + shipper
                    'orderOffer' => function ($q) {
                        $q->where('status', 'accepted')
                        ->with('shipper:id,name');
                    }
                ])
                ->withCount([
                    // unread messages for shopper
                    'messages as unread_count' => function ($q) use ($shopperId) {
                        $q->where('receiver_id', $shopperId)
                        ->where('status', 'approved')
                        ->where('is_read', false);
                    }
                ])
                ->get();

            $orders = $orders->map(function ($order) {
                $lastMessage   = $order->messages->first();
                $acceptedOffer = $order->orderOffer;

                return [
                    'order_id'       => $order->id,
                    'request_number' => $order->request_number,
                    'service_type'   => $order->service_type,
                    'status'         => $order->status,

                    // shipper info
                    'shipper_id'     => $acceptedOffer?->shipper?->id,
                    'shipper_name'   => $acceptedOffer?->shipper?->name,

                    // last message
                    'last_message'   => $lastMessage?->message_text,
                    'last_time'      => $lastMessage?->created_at?->format('g:i A'),

                    // unread badge
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
            $shopperId = Auth::id();

            $orders = Order::where('user_id', $shopperId)
                ->select('id', 'request_number')
                ->get()
                ->keyBy('id'); // id => Order object

            $orderIds = $orders->keys();

            $chats = OrderMessage::whereIn('order_id', $orderIds)
                ->where('status', 'approved')
                ->selectRaw('
                    order_id,
                    MAX(created_at) as last_message_time
                ')
                ->groupBy('order_id')
                ->orderByDesc('last_message_time')
                ->get()
                ->map(function ($item) use ($shopperId, $orders) {

                    $latestMessage = OrderMessage::where('order_id', $item->order_id)
                        ->where('is_read', 1)
                        ->where('status', 'approved')
                        ->latest()
                        ->with('sender:id,name')
                        ->first();

                    $unreadCount = OrderMessage::where('order_id', $item->order_id)
                        ->where('receiver_id', $shopperId)
                        ->where('is_read', 0)
                        ->where('status', 'approved')
                        ->where('is_read', false)
                        ->count();

                    return [
                        'order_id' => $item->order_id,
                        'request_number' => $orders[$item->order_id]->request_number ?? null,
                        'shipper_name' => $latestMessage->sender->name ?? null,
                        'latest_message' => $latestMessage->message_text ?? null,
                        'unread_count' => $unreadCount,
                        'last_message_time' => $latestMessage 
                        ? Carbon::parse($latestMessage->created_at)->diffForHumans()
                        : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $chats
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong'.$e
            ], 500);
        }
    }
}
