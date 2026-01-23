<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $blog_title }}</title>
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center" style="padding:30px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

                {{-- Header --}}
                <tr>
                    <td style="background:#1f2937; padding:20px; color:#ffffff;">
                        <h2 style="margin:0;">{{ $blog_title }}</h2>
                        <p style="margin:5px 0 0; font-size:13px;">
                            By {{ $author_name }} • {{ \Carbon\Carbon::parse($published_at)->format('M d, Y') }}
                        </p>
                    </td>
                </tr>

                {{-- Body --}}
                <tr>
                    <td style="padding:25px; color:#333;">
                        <p style="font-size:14px;">Hi {{ $user_name }},</p>

                        <p style="font-size:14px; color:#555;">
                            {{ $blog_excerpt }}
                        </p>

                        <div style="margin-top:20px; font-size:14px; line-height:1.7;">
                            {!! $blog_content !!}
                        </div>

                    </td>
                </tr>

                {{-- Footer --}}
                <tr>
                    <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#777;">
                        © {{ date('Y') }} Your Company. All rights reserved.
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>
