<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderOffer;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\OrderPayment;
use App\Models\User;
use Exception;

class StripeController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $paymentIntent = PaymentIntent::create([
            'amount' => $request->amount,
            'currency' => 'usd',
            'payment_method_types' => ['card'],
        ]);

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
        ]);
    }
    // public function storePayment(Request $request)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $userId = Auth::id();
    //         $validated = $request->validate([
    //             'order_id' => 'required|exists:orders,id',
    //             'shipper_id' => 'required|exists:users,id',
    //             'amount' => 'required|numeric',
    //             'currency' => 'required|string',
    //             'stripe_payment_intent' => 'required|string',
    //             'stripe_payment_method' => 'nullable|string',
    //             'status' => 'required|string',
    //         ]);

    //         $validated['shopper_id'] = $userId;

    //         $payment = OrderPayment::create($validated);

    //         DB::commit();
    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Payment successful',
    //         ]);
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to store payment',
    //             'error'   => $e->getMessage()
    //         ], 500);
    //     }
    // }
    public function storePayment(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id();
 
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'amount' => 'required|numeric',
                'currency' => 'required|string',
                'stripe_payment_intent' => 'required|string',
                'stripe_payment_method' => 'nullable|string',
                'status' => 'required|string',
            ]);
 
            $order = Order::with('orderOffer')->findOrFail($validated['order_id']);
            
            $order_offer_id = $order->orderOffer->id;
            $offer = OrderOffer::find($order_offer_id);
            $offer->status = 4;
            $offer->save();

            $shipperId = $order->orderOffer->user_id; // assuming Order model has shipper relation
            $shippingTypeId = $order->service_type=='buy_for_me'?1:2;
            $admin = User::whereHas('roles', function($q) {
                $q->where('name', 'admin');
            })->first();
            $adminId = $admin->id;
 
            $validated['shopper_id'] = $userId;
            $validated['shipper_id'] = $shipperId;
            $validated['shipping_type_id'] = $shippingTypeId;
 
            // 1️⃣ Store the payment
            $payment = OrderPayment::create($validated);
 
            $shipper = User::with('stripeAccount')->find($shipperId);
 
            // 2️⃣ Wallet logic based on shipping type
            if ($shippingTypeId == 2) { // Ship For Me
                WalletTransaction::create([
                    'user_id' => $shipperId,
                    'order_id' => $order->id,
                    'shipping_type_id' => $shippingTypeId,
                    'transaction_type' => 'credit',
                    'amount' => $validated['amount'],
                    'status' => 'pending', // pending until admin confirms
                    'description' => 'Pending payout: Ship For Me order',
                ]);
 
                WalletTransaction::create([
                    'user_id' => $adminId,
                    'order_id' => $order->id,
                    'shipping_type_id' => $shippingTypeId,
                    'transaction_type' => 'credit',
                    'amount' => 0, // commission calculated later
                    'status' => 'pending',
                    'description' => 'Pending admin commission',
                ]);
 
            } elseif ($shippingTypeId == 1) { // Buy For Me
                if ($shipper->stripeAccount!= null && $shipper->stripeAccount->stripe_account_id) {
                    WalletTransaction::create([
                        'user_id' => $shipperId,
                        'order_id' => $order->id,
                        'shipping_type_id' => $shippingTypeId,
                        'transaction_type' => 'credit',
                        'amount' => $validated['amount'],
                        'status' => 'completed',
                        'description' => 'Buy For Me payment received',
                    ]);
                } else {
                    WalletTransaction::create([
                        'user_id' => $shipperId,
                        'order_id' => $order->id,
                        'shipping_type_id' => $shippingTypeId,
                        'transaction_type' => 'credit',
                        'amount' => $validated['amount'],
                        'status' => 'pending',
                        'description' => 'Pending payout: Shipper account not connected',
                    ]);
                }
            }
            $order_offer_id = $order->orderOffer->id;
            $offer->status = 5;
            $offer->save();
 
            DB::commit();
            $shopper = Auth::user();

            $shopperEmailData = [
                'shopper_name' => $shopper->name,
                'order_number' => $order->request_number,
                'amount'       => $validated['amount'],
                'currency'     => $validated['currency'],
                'dashboard_url'=> env('REACT_APP') . '/shopper/view/request',
            ];

            sendEmail(
                $shopper->email,
                'Payment Successful – Order Confirmed',
                'emails.shopper.payment.payment-success',
                $shopperEmailData
            );
            
            //Send email to shipper
            $shipper = User::find($shipperId);

            $shipperEmailData = [
                'shipper_name' => $shipper->name,
                'order_number' => $order->request_number,
                'amount'       => $validated['amount'],
                'currency'     => $validated['currency'],
                'dashboard_url'=> env('REACT_APP') . '/shipper/requests',
            ];

            sendEmail(
                $shipper->email,
                'Payment Received for Your Order',
                'emails.shipper.payment.payment-received',
                $shipperEmailData
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment successful',
            ]);
 
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to store payment',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
