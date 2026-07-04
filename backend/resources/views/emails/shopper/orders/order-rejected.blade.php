<!DOCTYPE html>
<html>
<head>
    <title>Order Rejected</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%">
        <tr>
            <td align="center" style="padding:30px 0;">
                <table width="600" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background:#dc2626; padding:20px; text-align:center;">
                            <h1 style="color:#fff; margin:0;">DParcel</h1>
                            <p style="color:#fecaca; margin:5px 0 0;">Order Request Rejected</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px;">
                            <h2>Hello {{ $user_name }},</h2>
                            <p style="font-size:16px; color:#555;">
                                We're sorry to inform you that your order request has been <strong style="color:#dc2626;">rejected</strong> by our admin team after review.
                            </p>
                            @if(!empty($reason))
                            <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px 16px; margin:20px 0; border-radius:4px;">
                                <strong>Reason:</strong> {{ $reason }}
                            </div>
                            @endif
                            <table width="100%" style="margin:25px 0; border:1px solid #eaeaea;">
                                <tr style="background:#f9fafb;">
                                    <td style="padding:12px;"><strong>Order Request #</strong></td>
                                    <td style="padding:12px;">{{ $request_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;"><strong>Status</strong></td>
                                    <td style="padding:12px; color:#dc2626; font-weight:bold;">Rejected</td>
                                </tr>
                            </table>
                            <p style="color:#555;">If you have any questions, please contact our support team.</p>
                            <div style="text-align:center; margin:30px 0;">
                                <a href="{{ $dashboard_url }}" style="background:#374151; color:#fff; padding:14px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                    Go to Dashboard
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
