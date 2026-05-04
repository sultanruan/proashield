import { Resend } from 'resend'

export type ApprovalEmailPayload = {
  to: string
  cc: string
  replyTo: string
  senderName: string
  execName: string
  summary: string
  calendarLink?: string | null
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function firstName(name: string): string {
  return name.trim().split(' ')[0] || name
}

function buildApprovalHtml(p: ApprovalEmailPayload): string {
  const sender = escHtml(firstName(p.senderName))
  const exec = escHtml(firstName(p.execName))
  const summary = escHtml(p.summary)

  const calendarSentence = p.calendarLink
    ? `If you&rsquo;d like to learn more, you can book a slot directly on <strong>${sender}</strong>&rsquo;s calendar: <a href="${escHtml(p.calendarLink)}" style="color:#0EA5E9;text-decoration:underline;">${escHtml(p.calendarLink)}</a>. Or simply reply to this email with any questions.`
    : `Simply reply to this email with any questions.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been connected</title>
</head>
<body style="margin:0;padding:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#09090B;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:540px;">

          <!-- Body -->
          <tr>
            <td style="font-size:15px;line-height:1.7;color:#09090B;">
              <p style="margin:0 0 20px;">Hi <strong>${sender}</strong> and <strong>${exec}</strong>,</p>

              <p style="margin:0 0 20px;color:#52525B;">
                ProaShield has reviewed this outreach and approved it based on your current priorities.
              </p>

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.4px;">Why it passed</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
                <tr>
                  <td style="border-left:3px solid #0EA5E9;padding:12px 16px;background:#F9FAFB;border-radius:0 6px 6px 0;font-size:14px;color:#09090B;line-height:1.65;">
                    ${summary}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;">
                <strong>${exec}</strong> &mdash; ${calendarSentence}
              </p>

              <p style="margin:0 0 32px;">
                <strong>${sender}</strong> &mdash; you&rsquo;re on. Take a moment to introduce yourself and propose a next step.
              </p>

              <hr style="border:none;border-top:1px solid #E4E4E7;margin:0 0 20px;" />

              <p style="margin:0;font-size:12px;color:#A1A1AA;line-height:1.6;">
                ProaShield &middot; The Professional Front Door
              </p>
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
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'ProaShield <noreply@proashield.com>',
      to: payload.to,
      cc: payload.cc,
      replyTo: payload.replyTo,
      subject: `You've been connected — ${firstName(payload.senderName)} · ${firstName(payload.execName)}`,
      html: buildApprovalHtml(payload),
    })
  } catch (err) {
    console.error('[sendApprovalEmail] Failed to send:', err)
  }
}
