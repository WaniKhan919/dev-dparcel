<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Auth;
use Exception;
use Stripe\Stripe;
use Stripe\Transfer;

class WalletController extends Controller
{
    public function adminWallet()
    {
        try {
            $user = Auth::user();
            if (!$user->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can access this data.'
                ], 403);
            }
            $transactions = WalletTransaction::with(['user', 'order'])
                ->orderBy('id', 'desc')
                ->get();
            return response()->json([
                'success' => true,
                'total_records' => $transactions->count(),
                'data' => $transactions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load admin wallet data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function shipperWallet()
    {
        try {
            $user = Auth::user();
            if (!$user->hasRole('shipper')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only shipper can access this data.'
                ], 403);
            }
            $transactions = WalletTransaction::with(['order'])
                ->where('user_id', $user->id)
                ->orderBy('id', 'desc')
                ->get();
            return response()->json([
                'success' => true,
                'total_records' => $transactions->count(),
                'data' => $transactions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load shipper wallet data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function releaseShipperPayment(Request $request)
    {
        try {
            // Ensure only admin can do this
            $admin = Auth::user();
            if (!$admin->hasRole('admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only admin can perform this action.'
                ], 403);
            }

            // Validate input
            $validated = $request->validate([
                'wallet_transaction_id' => 'required|exists:wallet_transactions,id',
            ]);

            // Get specific wallet transaction
            $wallet = WalletTransaction::find($validated['wallet_transaction_id']);

            if ($wallet->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This transaction is not pending or already processed.'
                ], 400);
            }

            // Get shipper
            $shipper = User::find($wallet->user_id);

            if (!$shipper) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper not found.'
                ], 404);
            }

            if (!$shipper->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper has not connected their Stripe account.'
                ], 400);
            }

            // Transfer Amount via Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $transfer = Transfer::create([
                'amount' => intval($wallet->amount * 100),
                'currency' => 'usd',
                'destination' => $shipper->stripe_account_id,
                'description' => 'Manual payout for order #' . $wallet->order_id,
            ]);

            // Mark wallet as completed
            $wallet->update([
                'status' => 'completed',
                'description' => 'Manual payout released',
            ]);

            // Create admin debit transaction
            $adminUser = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->first();

            WalletTransaction::create([
                'user_id' => $adminUser->id,
                'order_id' => $wallet->order_id,
                'shipping_type_id' => $wallet->shipping_type_id,
                'transaction_type' => 'debit',
                'amount' => $wallet->amount,
                'status' => 'completed',
                'description' => 'Amount sent to shipper (manual release)',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment released to shipper successfully.',
                'wallet_transaction_id' => $wallet->id
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe error occurred.',
                'error' => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payout failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function reverseWalletTransaction($walletTransactionId)
    {
        try {
            $wallet = WalletTransaction::findOrFail($walletTransactionId);

            // Only pending or completed credits can be reversed
            if ($wallet->transaction_type !== 'credit' || $wallet->status === 'reversed') {
                return response()->json([
                    'success' => false,
                    'message' => 'This transaction cannot be reversed.'
                ], 400);
            }

            $shipper = User::findOrFail($wallet->user_id);

            // If payment was captured via Stripe, refund it
            if ($wallet->status === 'completed' && $wallet->stripe_payment_intent) {
                \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));
                \Stripe\PaymentIntent::cancel($wallet->stripe_payment_intent); // or refund if captured
            }

            // Update original wallet entry
            $wallet->update([
                'status' => 'reversed',
                'description' => 'Transaction reversed due to order cancellation or timeout'
            ]);

            // Create reversal entry
            WalletTransaction::create([
                'user_id' => $wallet->user_id,
                'order_id' => $wallet->order_id,
                'shipping_type_id' => $wallet->shipping_type_id,
                'transaction_type' => 'debit',
                'amount' => $wallet->amount,
                'status' => 'completed',
                'description' => 'Reversal of previously credited amount'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Wallet transaction successfully reversed.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reverse transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
