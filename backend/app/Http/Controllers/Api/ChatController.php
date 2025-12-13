<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderMessage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function chatContacts(Request $request){
        try {
            $shipperId = Auth::id();

            $orders = Order::whereHas('offers', function ($q) use ($shipperId) {
                $q->where('user_id', $shipperId)         // shipper id
                ->where('status', 'accepted');        // shopper accepted
            })
            ->with(['messages' => function ($q) {
                $q->where('status', 'approved')->latest();
            }])
            ->get();

            $orders = $orders->map(function ($order) {
                $lastMessage = $order->messages->first();

                return [
                    'order_id'       => $order->id,
                    'request_number' => $order->request_number,
                    'service_type'   => $order->service_type,
                    'status'         => $order->status,
                    'receiver_id'    => $order->user->id,
                    'last_message'   => $lastMessage?->message_text,
                    'last_time'      => $lastMessage?->created_at?->format('g:i A'),
                    'shopper_name'   => $order->user?->name,
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
    public function messages($orderId){
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

}
