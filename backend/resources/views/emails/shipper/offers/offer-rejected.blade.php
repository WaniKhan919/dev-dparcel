<!DOCTYPE html>
<html>
<head><title>Your Offer Has Been Rejected</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <tr>
                <td style="background:#dc2626;padding:20px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;">DParcel</h1>
                    <p style="color:#fee2e2;margin:5px 0 0;font-size:14px;">Offer Rejected</p>
                </td>
            </tr>

            <tr>
                <td style="padding:30px;">
                    <h2 style="color:#333;">Hello {{ $shipper_name }},</h2>
                    <p style="color:#555;font-size:16px;">
                        Unfortunately, your offer for order <strong>{{ $request_number }}</strong> has been <span style="color:#dc2626;font-weight:bold;">rejected</span> by the admin.
                    </p>

                    @if($reason)
                    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0;">
                        <strong style="color:#991b1b;">Reason:</strong>
                        <p style="color:#7f1d1d;margin:4px 0 0;">{{ $reason }}</p>
                    </div>
                    @endif

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #eaeaea;border-radius:6px;">
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Request #</strong></td>
                            <td style="padding:12px;">{{ $request_number }}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px;background:#f9faff;"><strong>Offer Price</strong></td>
                            <td style="padding:12px;">${{ number_format($offer_price, 2) }}</td>
                        </tr>
                    </table>

                    <p style="color:#555;font-size:15px;">
                        You can still place offers on other available orders from your dashboard.
                    </p>

                    <div style="text-align:center;margin:35px 0;">
                        <a href="{{ $dashboard_url }}" style="background:rgb(0,77,255);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                            Go to Dashboard
                        </a>
                    </div>

                    <p style="margin-top:30px;">Regards,<br><strong>DParcel Team</strong></p>
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
