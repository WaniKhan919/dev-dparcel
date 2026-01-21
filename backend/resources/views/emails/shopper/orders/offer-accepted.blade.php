<!DOCTYPE html>
<html>
<head>
    <title>Offer Accepted</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%">
        <tr>
            <td align="center" style="padding:30px 0;">

                <table width="600" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                    <tr>
                        <td style="background:rgb(0,77,255); padding:20px; text-align:center;">
                            <h1 style="color:#fff; margin:0;">DParcel</h1>
                            <p style="color:#e6ecff; margin:5px 0 0;">Offer Accepted</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:30px;">
                            <h2>Hello {{ $shipper_name }},</h2>

                            <p style="font-size:16px; color:#555;">
                                🎉 <strong>Congratulations!</strong> Your offer has been accepted by the shopper.
                            </p>

                            <table width="100%" style="margin:25px 0; border:1px solid #eaeaea;">
                                <tr>
                                    <td style="padding:12px;"><strong>Order Request #</strong></td>
                                    <td>{{ $order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;"><strong>Accepted Price</strong></td>
                                    <td style="color:rgb(0,77,255); font-weight:bold;">
                                        ${{ number_format($offer_price, 2) }}
                                    </td>
                                </tr>
                            </table>

                            <div style="text-align:center; margin:30px 0;">
                                <a href="{{ $dashboard_url }}" style="background:rgb(0,77,255); color:#fff; padding:14px 30px;
border-radius:6px; text-decoration:none; font-weight:bold;">
                                    View Order
                                </a>
                            </div>

                            <p>Regards,<br><strong>DParcel Team</strong></p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
