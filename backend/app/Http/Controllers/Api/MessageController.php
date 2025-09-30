<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderMessageResource;
use App\Models\OrderMessage;
use Exception;
use Illuminate\Http\Request;
use App\Models\Attachment;
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
                            'receiver:id,name,email',
                            'attachments:id,related_id,file_path,file_type' 
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
                                'sender.roles:name',
                                'receiver:id,name,email',
                                'receiver.roles:name',
                                'attachments:id,related_id,file_path,file_type' 
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

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id'    => 'required|exists:orders,id',
                'receiver_id' => 'required|exists:users,id',
                'message_text'=> 'required_without:attachments|string',
                'attachments' => 'required_without:message_text|nullable|file|mimes:jpg,jpeg,png,gif,pdf|max:81920',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors'  => $validator->errors()
                ], 422);
            }

            // Create the message first
            $message = OrderMessage::create([
                'order_id'     => $request->order_id,
                'sender_id'    => Auth::id(),
                'receiver_id'  => $request->receiver_id,
                'message_text' => $request->message_text,
                'status'       => 'pending',
                'approved_by'  => null,
            ]);

            // Handle file attachment if provided
            if ($request->hasFile('attachments')) {
                $file = $request->file('attachments');

                // Create folder if it doesn’t exist
                $destinationPath = public_path('order_attachments');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }

                // Generate unique filename
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // Move file to public/order_attachments
                $file->move($destinationPath, $fileName);

                $filePath = 'order_attachments/' . $fileName;
                $fileType = $file->getClientMimeType();

                Attachment::create([
                    'related_id' => $message->id,
                    'type'       => 2,
                    'file_path'  => $filePath, // e.g. "order_attachments/xyz.png"
                    'file_type'  => $fileType,
                ]);
            }


            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
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
