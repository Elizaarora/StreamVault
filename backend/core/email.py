import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from .config import settings


def _reset_email_html(username: str, reset_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Reset your password — StreamVault</title>
</head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#1a1a2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:520px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🎬 StreamVault</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Stream &amp; create, effortlessly</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;color:#f1f1f1;font-size:22px;font-weight:600;">
              Reset your password
            </h1>
            <p style="margin:0 0 8px;color:#94a3b8;font-size:15px;line-height:1.7;">
              Hi <strong style="color:#e2e8f0;">{username}</strong>,
            </p>
            <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.7;">
              We received a request to reset your StreamVault password.
              Click the button below — this link expires in
              <strong style="color:#e2e8f0;">1 hour</strong>.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;">
                  <a href="{reset_url}"
                     style="display:inline-block;padding:14px 36px;color:#fff;font-size:15px;
                            font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                    Reset my password &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;color:#64748b;font-size:13px;">
              Button not working? Copy this URL into your browser:
            </p>
            <p style="margin:0 0 28px;word-break:break-all;">
              <a href="{reset_url}" style="color:#7c3aed;font-size:13px;">{reset_url}</a>
            </p>

            <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                Didn't request this? You can safely ignore this email —
                your password won't change.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.25);padding:18px 40px;text-align:center;">
            <p style="margin:0;color:#475569;font-size:12px;">
              &copy; 2025 StreamVault &middot; Sent because a password reset was requested.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


async def send_password_reset_email(to_email: str, username: str, reset_url: str) -> None:
    """Send a password-reset email via Gmail SMTP (TLS on port 587)."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise ValueError("SMTP_USER / SMTP_PASSWORD not set in .env")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Reset your {settings.APP_NAME} password"
    msg["From"]    = f"{settings.FROM_NAME} <{settings.SMTP_USER}>"
    msg["To"]      = to_email

    # Plain-text fallback
    plain = (
        f"Hi {username},\n\n"
        f"Reset your StreamVault password here (expires in 1 hour):\n{reset_url}\n\n"
        f"If you didn't request this, ignore this email.\n\n— StreamVault"
    )
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(_reset_email_html(username, reset_url), "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
