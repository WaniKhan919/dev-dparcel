<!DOCTYPE html>
<html>
<head>
    <title>Offer Rejected</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%">
        <tr>
            <td align="center" style="padding:30px 0;">

                <table width="600" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                    <tr>
                        <td style="background:#e74c3c; padding:20px; text-align:center;">
                            <h1 style="color:#fff; margin:0;">DParcel</h1>
                            <p style="color:#ffecec; margin:5px 0 0;">Offer Rejected</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:30px;">
                            <h2>Hello {{ $shipper_name }},</h2>

                            <p style="font-size:16px; color:#555;">
                                Unfortunately, your offer was not accepted by the shopper.
                            </p>

                            <table width="100%" style="margin:25px 0; border:1px solid #eaeaea;">
                                <tr>
                                    <td style="padding:12px;"><strong>Order Request #</strong></td>
                                    <td>{{ $order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;"><strong>Your Offer</strong></td>
                                    <td>${{ number_format($offer_price, 2) }}</td>
                                </tr>
                            </table>

                            <p style="font-size:15px; color:#666;">
                                Don’t worry — keep an eye out for new orders and place more offers.
                            </p>

                            <p>Regards,<br><strong>DParcel Team</strong></p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
