<!DOCTYPE html>
<html>
<head>
    <title>Order Placed Successfully</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: rgb(0, 77, 255); padding: 20px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 24px;">DParcel</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="color: #333;">Hello {{ $user_name }},</h2>
                            <p style="color: #555; font-size: 16px;">
                                Your order has been <strong style="color: rgb(0, 77, 255);">successfully placed!</strong> 🎉
                            </p>

                            <h3 style="color: #333; margin-top: 30px;">Order Details:</h3>
                            <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order Request Number:</strong></td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $order_request_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Price:</strong></td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${{ number_format($total_price, 2) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Weight:</strong></td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $total_weight }} kg</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service Type:</strong></td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ ucfirst(str_replace('_', ' ', $service_type)) }}</td>
                                </tr>
                            </table>

                            <p style="color: #555; font-size: 16px; margin-top: 30px;">
                                Thank you for placing your order with us. You can track your order using the request number above.
                            </p>

                            <p style="margin-top: 40px; color: #555; font-size: 16px;">Best Regards,<br><strong>DParcel Team</strong></p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                            &copy; {{ date('Y') }} DParcel. All rights reserved.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
