<!DOCTYPE html>
<html>
<head><title>New Offer Awaiting Approval</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <tr>
                <td style="background:rgb(0,77,255);padding:20px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;">DParcel</h1>
                    <p style="color:#e6ecff;margin:5px 0 0;font-size:14px;">Admin — New Offer Awaiting Approval</p>
                </td>
            </tr>

            <tr>
                <td style="padding:30px;">
                    <h2 style="color:#333;">New Offer Placed</h2>
                    <p style="color:#555;font-size:15px;">
                        <strong>{{ $shipper_name }}</strong> has placed an offer on order <strong>{{ $request_number }}</strong>. Please review and approve or reject it.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #eaeaea;border-radius:6px;">
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Shopper</strong></td>
                            <td style="padding:12px;">{{ $user_name }}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Request #</strong></td>
                            <td style="padding:12px;">{{ $request_number }}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Service Type</strong></td>
                            <td style="padding:12px;">{{ $service_type }}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Offer Price</strong></td>
                            <td style="padding:12px;color:rgb(0,77,255);font-weight:bold;">${{ number_format($offer_price, 2) }}</td>
                        </tr>
                        @foreach($additional_prices as $price)
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>{{ $price['title'] }}</strong></td>
                            <td style="padding:12px;color:rgb(0,77,255);font-weight:bold;">${{ number_format($price['price'], 2) }}</td>
                        </tr>
                        @endforeach
                        <tr>
                            <td style="padding:12px;background:#f0f5ff;"><strong>Total Offer</strong></td>
                            <td style="padding:12px;color:rgb(0,77,255);font-weight:bold;">${{ number_format($total_offer_price, 2) }}</td>
                        </tr>
                    </table>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="{{ $dashboard_url }}" style="background:rgb(0,77,255);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                            Review Offer
                        </a>
                    </div>

                    <p style="margin-top:30px;">Regards,<br><strong>DParcel System</strong></p>
                </td>
            </tr>

            <tr>
                <td style="background:#f1f3f6;padding:15px;text-align:center;font-size:12px;color:#777;">
                    © {{ date('Y') }} DParcel. All rights reserved.
                </td>
            </tr>
        </table>
    </td></tr>
</table>
</body>
</html>
