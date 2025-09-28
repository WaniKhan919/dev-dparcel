<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\OrderPayment;

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
    public function storePayment(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id();
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'shipper_id' => 'required|exists:users,id',
                'amount' => 'required|numeric',
                'currency' => 'required|string',
                'stripe_payment_intent' => 'required|string',
                'stripe_payment_method' => 'nullable|string',
                'status' => 'required|string',
            ]);

            $validated['shopper_id'] = $userId;

            $payment = OrderPayment::create($validated);

            DB::commit();
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
