
<!DOCTYPE html>
<html>
<head>
    <title>Payment Received</title>
</head>
<body style="font-family:Arial; background:#f4f6f8; padding:30px;">
    <table width="100%" align="center">
        <tr>
            <td align="center">

                <table width="600" style="background:#fff; border-radius:8px; padding:30px;">
                    <tr>
                        <td>

                            <h2>Hello {{ $shipper_name }},</h2>

                            <p>
                                🎉  The shopper has successfully completed the payment for the order.
                            </p>

                            <table width="100%" style="margin:20px 0;">
                                <tr>
                                    <td><strong>Order Request #</strong></td>
                                    <td>{{ $order_number }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Amount Paid</strong></td>
                                    <td><strong>{{ $currency }} {{ number_format($amount, 2) }}</strong></td>
                                </tr>
                            </table>

                            <p>
                                You can now proceed with the order from your dashboard.
                            </p>

                            <a href="{{ $dashboard_url }}" style="display:inline-block; margin-top:20px;
background:#004dff; color:#fff; padding:12px 25px;
text-decoration:none; border-radius:5px;">
                                View Order
                            </a>

                            <p style="margin-top:30px;">
                                Regards,<br>
                                <strong>DParcel Team</strong>
                            </p>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
