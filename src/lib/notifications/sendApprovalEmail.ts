import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type ApprovalEmailPayload = {
  to: string
  cc: string
  replyTo: string
  senderName: string
  execName: string
  summary: string
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildApprovalHtml(p: ApprovalEmailPayload): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been approved</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F4F4F5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:24px;" align="center">
              <span style="font-size:17px;font-weight:700;color:#0EA5E9;letter-spacing:-0.3px;">proashield</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#FFFFFF;border-radius:12px;border:1px solid #E4E4E7;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="background-color:#0EA5E9;height:3px;"></td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:32px 32px 28px;">
                    <p style="margin:0 0 20px;font-size:14px;color:#52525B;">Hi ${escHtml(p.senderName)},</p>
                    <p style="margin:0 0 20px;font-size:15px;color:#09090B;line-height:1.65;">
                      Your outreach to <strong>${escHtml(p.execName)}</strong> has been reviewed by ProaShield — and you've been approved.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
                      <tr>
                        <td style="background-color:#F9FAFB;border-radius:8px;border-left:3px solid #0EA5E9;padding:14px 16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.4px;">Here's what stood out</p>
                          <p style="margin:0;font-size:14px;color:#09090B;line-height:1.65;">${escHtml(p.summary)}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 24px;font-size:15px;color:#09090B;line-height:1.65;">
                      <strong>${escHtml(p.execName)}</strong> has been notified and is expecting to hear from you. Reply directly to this email to start the conversation.
                    </p>
                    <hr style="border:none;border-top:1px solid #E4E4E7;margin:0 0 20px;" />
                    <p style="margin:0;font-size:13px;color:#A1A1AA;line-height:1.6;">
                      ProaShield · The Professional Front Door<br/>
                      This message was sent on behalf of ${escHtml(p.execName)} via ProaShield.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendApprovalEmail(payload: ApprovalEmailPayload): Promise<void> {
  try {
    await resend.emails.send({
      from: 'ProaShield <noreply@proashield.com>',
      to: payload.to,
      cc: payload.cc,
      replyTo: payload.replyTo,
      subject: `You've been approved — ${payload.execName} wants to connect`,
      html: buildApprovalHtml(payload),
    })
  } catch (err) {
    console.error('[sendApprovalEmail] Failed to send:', err)
  }
}
