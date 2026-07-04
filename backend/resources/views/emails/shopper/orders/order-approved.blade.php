<!DOCTYPE html>
<html>
<head>
    <title>Order Approved</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%">
        <tr>
            <td align="center" style="padding:30px 0;">
                <table width="600" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background:rgb(0,77,255); padding:20px; text-align:center;">
                            <h1 style="color:#fff; margin:0;">DParcel</h1>
                            <p style="color:#e6ecff; margin:5px 0 0;">Order Request Approved</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px;">
                            <h2>Hello {{ $user_name }},</h2>
                            <p style="font-size:16px; color:#555;">
                                🎉 <strong>Great news!</strong> Your order request has been reviewed and <strong style="color:#16a34a;">approved</strong> by our admin team. Shippers can now place offers on your request.
                            </p>
                            <table width="100%" style="margin:25px 0; border:1px solid #eaeaea;">
                                <tr style="background:#f9fafb;">
                                    <td style="padding:12px;"><strong>Order Request #</strong></td>
                                    <td style="padding:12px;">{{ $request_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;"><strong>Status</strong></td>
                                    <td style="padding:12px; color:#16a34a; font-weight:bold;">Approved</td>
                                </tr>
                            </table>
                            <div style="text-align:center; margin:30px 0;">
                                <a href="{{ $dashboard_url }}" style="background:rgb(0,77,255); color:#fff; padding:14px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                    View My Request
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
