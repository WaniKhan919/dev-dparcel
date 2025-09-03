<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="background:#4f46e5; padding:20px; text-align:center; color:#fff; font-size:20px; font-weight:bold;">
                Welcome to Our Platform
            </td>
        </tr>
        <tr>
            <td style="padding:20px; color:#333; font-size:16px; line-height:1.6;">
                <p>Hi {{ $name }},</p>
                <p>Thank you for signing up! Please use the following verification code to activate your account:</p>
                <p style="text-align:center; margin:20px 0;">
                    <span style="display:inline-block; background:#4f46e5; color:#fff; font-size:22px; font-weight:bold; padding:12px 30px; border-radius:6px;">
                        {{ $code }}
                    </span>
                </p>
                <p>This code will expire in <strong>15 minutes</strong>.</p>
                <p>If you did not create this account, you can safely ignore this email.</p>
            </td>
        </tr>
        <tr>
            <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#777;">
                &copy; {{ date('Y') }} Our App. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
