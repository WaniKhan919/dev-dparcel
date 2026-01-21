<!DOCTYPE html>
<html>
<head>
    <title>New Offer Received</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 0;">

<table width="600" cellpadding="0" cellspacing="0"
       style="background:#ffffff; border-radius:8px; overflow:hidden;
              box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <tr>
        <td style="background:rgb(0,77,255); padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0;">DParcel</h1>
            <p style="color:#e6ecff; margin:5px 0 0; font-size:14px;">
                Parcel Delivery Service
            </p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:30px;">
            <h2 style="color:#333;">Hello {{ $user_name }},</h2>

            <p style="color:#555; font-size:16px;">
                A shipper has placed an offer for your order. 🚚
            </p>

            <!-- Order Info -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="margin:25px 0; border:1px solid #eaeaea; border-radius:6px;">
                <tr>
                    <td style="padding:12px; background:#f9faff;"><strong>Order Request #</strong></td>
                    <td style="padding:12px;">{{ $order_number }}</td>
                </tr>
                <tr>
                    <td style="padding:12px; background:#f9faff;"><strong>Request Number</strong></td>
                    <td style="padding:12px;">{{ $request_number }}</td>
                </tr>
                <tr>
                    <td style="padding:12px; background:#f9faff;"><strong>Service Type</strong></td>
                    <td style="padding:12px;">{{ $service_type }}</td>
                </tr>
                <tr>
                    <td style="padding:12px; background:#f9faff;"><strong>Offered Price</strong></td>
                    <td style="padding:12px; color:rgb(0,77,255); font-weight:bold;">
                        ${{ number_format($offer_price, 2) }}
                    </td>
                </tr>
            </table>

            @if(!empty($offer_message))
                <p style="color:#555; font-size:15px;">
                    <strong>Shipper Message:</strong><br>
                    "{{ $offer_message }}"
                </p>
            @endif

            <!-- CTA Button -->
            <div style="text-align:center; margin:35px 0;">
                <a href="{{ $dashboard_url }}"
                style="
                        background:rgb(0,77,255);
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 32px;
                        border-radius:6px;
                        font-size:16px;
                        font-weight:bold;
                        display:inline-block;
                ">
                    View Offer
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
        <td style="background:#f1f3f6; padding:15px; text-align:center;
                   font-size:12px; color:#777;">
            © {{ date('Y') }} DParcel. All rights reserved.
        </td>
    </tr>

</table>

</td>
</tr>
</table>
</body>
</html>
