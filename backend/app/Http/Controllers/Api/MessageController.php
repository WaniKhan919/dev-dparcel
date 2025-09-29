<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderMessageResource;
use App\Models\OrderMessage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(Request $request){
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
            ]);
            
            $userId = Auth::id();
            $messages = OrderMessage::with([
                            'sender:id,name,email',
                            'receiver:id,name,email'
                        ])
                        ->where('order_id', $request->order_id)
                        ->where(function ($query) use ($userId) {
                            $query->where('sender_id', $userId)
                                ->orWhere(function ($q) use ($userId) {
                                    $q->where('receiver_id', $userId)
                                        ->where('status', 'approved');
                                });
                        })
                        ->orderBy('created_at', 'asc')
                        ->get();

            return response()->json([
                'success' => true,
                'data'    => OrderMessageResource::collection($messages),
            ], 200);

        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $ex->getMessage(),
            ], 500);
        }
    }
    public function getMessagesForAdmin(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
            ]);

            $messages = OrderMessage::with([
                                'sender:id,name,email',
                                'receiver:id,name,email'
                            ])
                            ->where('order_id', $request->order_id)
                            ->orderBy('created_at', 'asc')
                            ->get();

            return response()->json([
                'success' => true,
                'data'    => OrderMessageResource::collection($messages),
            ], 200);

        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $ex->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request){
        try {
            $validator = Validator::make($request->all(), [
                'order_id'    => 'required|exists:orders,id',
                'receiver_id' => 'required|exists:users,id',
                'message_text'=> 'required|string',
                'attachments' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf|max:2048',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors'  => $validator->errors()
                ], 422);
            }
             $attachmentPath = null;
            if ($request->hasFile('attachments')) {
                $attachmentPath = $request->file('attachments')->store('order_attachments', 'public');
            }
            $message = OrderMessage::create([
                'order_id'     => $request->order_id,
                'sender_id'    => Auth::id(),
                'receiver_id'  => $request->receiver_id,
                'message_text' => $request->message_text,
                'attachments'  => $attachmentPath,
                'status'       => 'pending',
                'approved_by'  => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data'    => $message
            ], 201);
        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $ex->getMessage(),
            ], 500);
        }
    }
    public function updateMessageStatus(Request $request)
    {
        try {
            $request->validate([
                'message_id' => 'required|exists:order_messages,id',
                'status'     => 'required|in:approved,rejected',
            ]);

            $message = OrderMessage::findOrFail($request->message_id);

            // Update status
            $message->status = $request->status;
            $message->approved_by = Auth::id();
            $message->save();

            return response()->json([
                'success' => true,
                'message' => 'Message status updated successfully',
                'data'    => $message,
            ], 200);

        } catch (Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong',
                'error'   => $ex->getMessage(),
            ], 500);
        }
    }
}
