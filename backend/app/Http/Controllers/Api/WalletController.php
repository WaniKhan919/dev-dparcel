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

            // All transactions (pagination can be added later)
            $transactions = WalletTransaction::with(['user', 'order'])
                ->orderBy('id', 'desc')
                ->get();

            // 1. Total Commission (only from completed transactions)
            $totalCommission = WalletTransaction::where('status', 'completed')
                ->sum('commission');

            // 2. Total Master Account Amount (pending + reversed amounts)
            $masterAmount = WalletTransaction::whereIn('status', ['pending', 'reversed'])
                ->sum('amount');

            return response()->json([
                'success' => true,
                'total_records' => $transactions->count(),
                'total_commission' => number_format($totalCommission, 2),
                'master_account_amount' => number_format($masterAmount, 2),
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

            // if ($wallet->status !== 'pending') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'This transaction is not pending or already processed.'
            //     ], 400);
            // }

            // Get shipper
            $shipper = User::with('stripeAccount')->find($wallet->user_id);

            if (!$shipper) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper not found.'
                ], 404);
            }
            
            if (!$shipper->stripeAccount->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper has not connected their Stripe account.'
                ], 400);
            }

            $account = \Stripe\Account::retrieve($shipper->stripeAccount->stripe_account_id);

            if (!isset($account->capabilities->transfers) || $account->capabilities->transfers !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Shipper Stripe account cannot receive transfers. Please complete Stripe onboarding.',
                ], 400);
            }

            // Transfer Amount via Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $transfer = Transfer::create([
                'amount' => intval($wallet->amount * 100),
                'currency' => 'usd',
                'destination' => $shipper->stripeAccount->stripe_account_id,
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

            // Only credit transactions that are pending or completed can be reversed
            if ($wallet->transaction_type !== 'credit') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only credit transactions can be reversed.'
                ], 400);
            }

            if ($wallet->status === 'reversed') {
                return response()->json([
                    'success' => false,
                    'message' => 'This transaction is already reversed.'
                ], 400);
            }

            // If payment was completed and captured via Stripe, refund/cancel it
            if ($wallet->status === 'completed' && $wallet->stripe_payment_intent) {
                \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

                // Try to cancel the payment intent
                try {
                    \Stripe\PaymentIntent::cancel($wallet->stripe_payment_intent);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to reverse Stripe payment.',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            // Update the original wallet entry to mark as reversed
            $wallet->update([
                'status' => 'reversed',
                'description' => 'Transaction reversed due to order cancellation or timeout',
                // Optional: you can set amount = 0 if needed
                // 'amount' => 0,
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
