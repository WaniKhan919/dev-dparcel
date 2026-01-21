<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful</title>
</head>
<body style="font-family:Arial; background:#f4f6f8; padding:30px;">
    <table width="100%" align="center">
        <tr>
            <td align="center">
                <table width="600" style="background:#fff; border-radius:8px; padding:30px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:rgb(0,77,255); padding:20px; text-align:center; border-radius:8px 8px 0 0;">
                            <h1 style="color:#fff; margin:0;">DParcel</h1>
                            <p style="color:#e6ecff; margin:5px 0 0;">Payment Confirmation</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:30px;">
                            <h2>Hello {{ $shopper_name }},</h2>

                            <p style="color:#555; font-size:16px;">
                                ✅ Your payment has been <strong>successfully completed</strong>.
                                Thank you for confirming your delivery order with DParcel.
                            </p>

                            <p style="color:#555; font-size:15px;">
                                This email serves as a confirmation of your payment.
                            </p>

                            <!-- Payment Details -->
                            <table width="100%" style="margin:20px 0; border:1px solid #eaeaea; border-collapse:collapse;">
                                <tr>
                                    <td style="padding:12px; background:#fafafa;"><strong>Order Request #</strong></td>
                                    <td style="padding:12px;">{{ $order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; background:#fafafa;"><strong>Amount Paid</strong></td>
                                    <td style="padding:12px; color:rgb(0,77,255); font-weight:bold;">
                                        {{ $currency }} {{ number_format($amount, 2) }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px; background:#fafafa;"><strong>Payment Status</strong></td>
                                    <td style="padding:12px;">Completed</td>
                                </tr>
                            </table>

                            <p style="color:#555; font-size:15px;">
                                The shipper has been notified and will now proceed with your order.
                                You can track the delivery progress anytime from your dashboard.
                            </p>

                            <!-- CTA Button -->
                            <div style="text-align:center; margin:30px 0;">
                                <a href="{{ $dashboard_url }}" style="background:rgb(0,77,255); color:#fff; padding:14px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                    View Order Details
                                </a>
                            </div>

                            <p style="margin-top:30px;">
                                Regards,<br>
                                <strong>DParcel Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f1f3f6; padding:15px; text-align:center; font-size:12px; color:#777;">
                            © {{ date('Y') }} DParcel. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>