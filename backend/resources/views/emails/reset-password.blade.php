<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" 
           style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; 
                  box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="background:#dc2626; padding:20px; text-align:center; color:#fff; font-size:20px; font-weight:bold;">
                Password Reset Request
            </td>
        </tr>
        <tr>
            <td style="padding:20px; color:#333; font-size:16px; line-height:1.6;">
                <p>Hi {{ $name }},</p>
                <p>We received a request to reset your password. You can reset it by clicking the button below:</p>

                <p style="text-align:center; margin:25px 0;">
                    <a href="{{ $url }}" 
                       style="background:#dc2626; color:#fff; font-size:18px; text-decoration:none; 
                              padding:12px 30px; border-radius:6px; display:inline-block;">
                        Reset Password
                    </a>
                </p>

                <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color:#2563eb;">{{ $url }}</p>

                <p>This link will expire in <strong>60 minutes</strong>.</p>
                <p>If you didn’t request a password reset, you can safely ignore this email.</p>
            </td>
        </tr>
        <tr>
            <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#777;">
                &copy; {{ date('Y') }} Delevering Parcel. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
