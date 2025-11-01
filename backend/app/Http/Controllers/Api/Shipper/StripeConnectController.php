<?php

namespace App\Http\Controllers\Api\Shipper;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StripeAccount;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Exception;
use Auth;

class StripeConnectController extends Controller
{
    public function createAccount(Request $request)
    {
        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $user = Auth::user();

           if (!$user->hasRole('shipper')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only shippers can connect Stripe.'
                ], 403);
            }

            // Find or create Stripe account record
            $stripeAccount = StripeAccount::firstOrCreate(['user_id' => $user->id]);

            // Create new Stripe account if not exists
            if (!$stripeAccount->stripe_account_id) {
                $account = Account::create([
                    'type' => 'express',
                    'country' => 'US',
                    'email' => $user->email,
                    'capabilities' => [
                        'transfers' => ['requested' => true],
                        'card_payments' => ['requested' => true],
                    ],
                ]);

                $stripeAccount->update([
                    'stripe_account_id' => $account->id,
                ]);
            }

            // Generate onboarding link
            $accountLink = AccountLink::create([
                'account' => $stripeAccount->stripe_account_id,
                'refresh_url' => route('stripe.onboard.refresh'),
                'return_url' => route('stripe.onboard.success'),
                'type' => 'account_onboarding',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stripe account link generated successfully.',
                'url' => $accountLink->url
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create or connect Stripe account.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Called after successful onboarding
     */
    public function onboardSuccess()
    {
        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $user = Auth::user();
            $stripeAccount = $user->stripeAccount;

            if (!$stripeAccount) {
                return redirect()->route('dashboard')->with('error', 'Stripe account not found.');
            }

            $account = Account::retrieve($stripeAccount->stripe_account_id);

            $stripeAccount->update([
                'stripe_onboarded' => true,
                'stripe_charges_enabled' => $account->charges_enabled,
                'stripe_details_submitted' => $account->details_submitted,
            ]);

            return redirect()->route('dashboard')->with('success', 'Stripe account connected successfully!');

        } catch (Exception $e) {
            return redirect()->route('dashboard')->with('error', 'Stripe onboarding failed: ' . $e->getMessage());
        }
    }

    public function getStripeStatus()
    {
        try {
            $user = Auth::user();
            $account = StripeAccount::where('user_id', $user->id)->first();

            if (!$account) {
                return response()->json([
                    'success' => true,
                    'connected' => false,
                ]);
            }

            return response()->json([
                'success' => true,
                'connected' => $account->stripe_onboarded && $account->stripe_charges_enabled,
                'details' => $account
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get Stripe status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
