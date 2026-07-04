<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomDeclaration;
use App\Models\Order;
use App\Models\OrderOffer;
use App\Models\ProductTracking;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function approveProduct(Request $request)
    {
        // Validation
        $request->validate([
            'product_id' => 'required|integer|exists:product_trackings,product_id',
            'status'     => 'required|in:1,2', // 1 = approve, 2 = reject
        ]);

        try {
            DB::beginTransaction();

            // Get the product tracking record
            $tracking = ProductTracking::where('product_id', $request->product_id)->firstOrFail();

            // Update status
            $tracking->status = $request->status;
            $tracking->save();

            DB::commit();

            // Dynamic message based on status
            $statusMessage = $request->status == 1 ? 'approved' : 'rejected';

            return response()->json([
                'status'  => true,
                'message' => "Product has been {$statusMessage} successfully.",
                'data'    => [
                    'product_id' => $tracking->product_id,
                    'status'     => $tracking->status,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update product status.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function approveOrder(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $order = Order::with('user')->findOrFail(decrypt($id));
            $order->admin_approval_status = $request->status;
            $order->save();

            DB::commit();

            $shopper = $order->user;
            $emailData = [
                'user_name'      => $shopper->name,
                'request_number' => $order->request_number,
                'reason'         => $request->reason ?? '',
                'dashboard_url'  => env('REACT_APP') . '/shopper/view/request',
            ];

            if ($request->status === 'approved') {
                sendEmail($shopper->email, 'Your Order Request Has Been Approved', 'emails.shopper.orders.order-approved', $emailData);
            } else {
                sendEmail($shopper->email, 'Your Order Request Has Been Rejected', 'emails.shopper.orders.order-rejected', $emailData);
            }

            return response()->json([
                'success' => true,
                'message' => "Order has been {$request->status} successfully.",
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function approveOffer(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $offer = OrderOffer::with(['order.user', 'order.shippingType', 'shipper', 'additionalPrices'])
                ->findOrFail(decrypt($id));

            $offer->admin_approval_status = $request->status;
            $offer->save();

            DB::commit();

            $shipper = $offer->shipper;
            $order   = $offer->order;
            $shopper = $order->user;

            $totalOfferPrice = (float) $offer->offer_price
                + $offer->additionalPrices->sum(fn($p) => (float) $p->price);

            // Always email the shipper
            $shipperEmailData = [
                'shipper_name'   => $shipper->name,
                'request_number' => $order->request_number,
                'offer_price'    => $offer->offer_price,
                'total_offer_price' => $totalOfferPrice,
                'reason'         => $request->reason ?? '',
                'dashboard_url'  => env('REACT_APP') . '/shipper/requests',
            ];

            if ($request->status === 'approved') {
                sendEmail(
                    $shipper->email,
                    'Your Offer Has Been Approved',
                    'emails.shipper.offers.offer-approved',
                    $shipperEmailData
                );

                // Email shopper that an offer is available
                $additionalPricesArr = $offer->additionalPrices->map(fn($p) => [
                    'title' => $p->title ?? $p->service?->title ?? 'Service',
                    'price' => $p->price,
                ])->toArray();

                $shopperEmailData = [
                    'user_name'          => $shopper->name,
                    'order_number'       => $order->id,
                    'request_number'     => $order->request_number,
                    'service_type'       => $order->shippingType?->title ?? '-',
                    'offer_price'        => $offer->offer_price,
                    'additional_prices'  => $additionalPricesArr,
                    'total_offer_price'  => $totalOfferPrice,
                    'offer_message'      => $offer->message ?? '',
                    'dashboard_url'      => env('REACT_APP') . '/shopper/view/request',
                ];

                sendEmail(
                    $shopper->email,
                    'An Offer is placed against your order!',
                    'emails.shopper.orders.offer-send',
                    $shopperEmailData
                );
            } else {
                sendEmail(
                    $shipper->email,
                    'Your Offer Has Been Rejected',
                    'emails.shipper.offers.offer-rejected',
                    $shipperEmailData
                );
            }

            return response()->json([
                'success' => true,
                'message' => "Offer has been {$request->status} successfully.",
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update offer status.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function approveCustomDecleration(Request $request)
    {
        $request->validate([
            'status' => 'required|string',
            'custom_decleration_id'     => 'required',
        ]);

        try {
            DB::beginTransaction();
            $record = CustomDeclaration::where('id', $request->custom_decleration_id)->firstOrFail();

            $record->status = $request->status;
            $record->save();

            DB::commit();
            $statusMessage = $request->status;

            return response()->json([
                'status'  => true,
                'message' => "Custom decleration has been {$statusMessage} successfully.",
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update custom decleration status.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
