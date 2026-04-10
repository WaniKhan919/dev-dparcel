<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
            <td style="background:#4f46e5; padding:20px; text-align:center; color:#fff; font-size:20px; font-weight:bold;">
                Delevering Parcel Platform
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding:20px; color:#333; font-size:16px; line-height:1.6;">
                <p>Hi {{ $user->name }},</p>

                @if($status === 'approved')
                    <p>🎉 Congratulations! Your account has been <strong>approved</strong>.</p>

                    <p style="text-align:center; margin:20px 0;">
                        <span style="display:inline-block; background:#10b981; color:#fff; font-size:16px; font-weight:bold; padding:10px 25px; border-radius:6px;">
                            Approved
                        </span>
                    </p>

                    <p>You can now access all features of the platform.</p>

                @elseif($status === 'rejected')
                    <p>❌ Unfortunately, your account has been <strong>rejected</strong>.</p>

                    <p style="text-align:center; margin:20px 0;">
                        <span style="display:inline-block; background:#ef4444; color:#fff; font-size:16px; font-weight:bold; padding:10px 25px; border-radius:6px;">
                            Rejected
                        </span>
                    </p>

                    <p>If you believe this is a mistake, please contact support.</p>

                @else
                    <p>🎉 Your account has been successfully verified.</p>

                    <p>
                        However, your account is currently <strong>pending admin approval</strong>.
                        Our team will review your profile shortly.
                    </p>

                    <p style="text-align:center; margin:20px 0;">
                        <span style="display:inline-block; background:#f59e0b; color:#fff; font-size:16px; font-weight:bold; padding:10px 25px; border-radius:6px;">
                            Pending Approval
                        </span>
                    </p>
                @endif
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#777;">
                &copy; {{ date('Y') }} Delevering Parcel. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>