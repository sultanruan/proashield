import { Resend } from 'resend'

export type PassEmailPayload = {
  execNotificationEmail: string
  execFirstName: string
  senderName: string
  senderCompany: string
  category: string
  score: number
  summary: string
  reason: string
}

function buildPassEmailHtml(p: PassEmailPayload): string {
  const scoreColor = p.score >= 70 ? '#059669' : '#D97706'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New contact passed your screening</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F4F4F5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;" align="center">
              <span style="font-size:18px;font-weight:700;color:#0EA5E9;letter-spacing:-0.3px;">proashield</span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#FFFFFF;border-radius:12px;border:1px solid #E4E4E7;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);overflow:hidden;">

              <!-- Green top bar -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:#10B981;height:4px;"></td>
                </tr>
              </table>

              <!-- Card content -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:32px 32px 0;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#059669;text-transform:uppercase;letter-spacing:0.5px;">✅ Passed Screening</p>
                    <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#09090B;line-height:1.3;">Someone passed your Proa screening</h1>
                  </td>
                </tr>

                <!-- Sender info row -->
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F9FAFB;border-radius:10px;border:1px solid #E4E4E7;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <!-- Avatar + name -->
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="vertical-align:top;padding-right:14px;">
                                <div style="width:44px;height:44px;border-radius:50%;background-color:#0EA5E9;display:inline-block;text-align:center;line-height:44px;">
                                  <span style="color:#FFFFFF;font-size:16px;font-weight:700;">${p.senderName ? p.senderName.charAt(0).toUpperCase() : '?'}</span>
                                </div>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:#09090B;">${escHtml(p.senderName || 'Unknown sender')}</p>
                                <p style="margin:0;font-size:14px;color:#52525B;">${escHtml(p.senderCompany || 'No company provided')}</p>
                              </td>
                            </tr>
                          </table>

                          <!-- Badges row -->
                          <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;">
                            <tr>
                              <td style="padding-right:8px;">
                                <span style="display:inline-block;padding:3px 10px;border-radius:9999px;background-color:#ECFDF5;color:#059669;font-size:12px;font-weight:600;">${escHtml(p.category || 'General')}</span>
                              </td>
                              <td>
                                <span style="display:inline-block;padding:3px 10px;border-radius:9999px;background-color:#F0F9FF;color:${scoreColor};font-size:12px;font-weight:700;border:1px solid #BAE6FD;">Match: ${p.score}/100</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Summary -->
                <tr>
                  <td style="padding:0 32px 16px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.5px;">AI Summary</p>
                    <p style="margin:0;font-size:14px;color:#09090B;line-height:1.6;">${escHtml(p.summary)}</p>
                  </td>
                </tr>

                <!-- Reason -->
                <tr>
                  <td style="padding:0 32px 32px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.5px;">Why they passed</p>
                    <p style="margin:0;font-size:14px;color:#52525B;line-height:1.6;font-style:italic;">"${escHtml(p.reason)}"</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 32px;">
                    <hr style="border:none;border-top:1px solid #E4E4E7;margin:0;" />
                  </td>
                </tr>

                <!-- Actions -->
                <tr>
                  <td style="padding:24px 32px 32px;">
                    <p style="margin:0 0 16px;font-size:14px;color:#52525B;">Ready to follow up? View the full conversation in your dashboard.</p>
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-right:16px;">
                          <a href="https://proashield.com/dashboard/exec"
                            style="display:inline-block;background-color:#0EA5E9;color:#FFFFFF;font-size:14px;font-weight:600;padding:11px 22px;border-radius:8px;text-decoration:none;">
                            View Full Conversation →
                          </a>
                        </td>
                        <td>
                          <a href="https://proashield.com/dashboard/exec"
                            style="display:inline-block;color:#A1A1AA;font-size:13px;text-decoration:none;padding:11px 0;">
                            Not relevant — train my AI
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px 0;" align="center">
              <p style="margin:0 0 6px;font-size:12px;color:#A1A1AA;line-height:1.6;">
                You're receiving this because someone passed your ProaShield screening.
                <a href="https://proashield.com" style="color:#A1A1AA;text-decoration:underline;">Manage your notifications</a>
              </p>
              <p style="margin:0;font-size:12px;color:#D4D4D8;font-weight:500;">ProaShield · The Professional Front Door</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendPassEmail(payload: PassEmailPayload): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const subject = payload.senderName
      ? `New contact passed your Proa screening — ${payload.senderName}${payload.senderCompany ? ` from ${payload.senderCompany}` : ''}`
      : 'New contact passed your Proa screening'

    await resend.emails.send({
      from: 'ProaShield <noreply@proashield.com>',
      to: payload.execNotificationEmail,
      subject,
      html: buildPassEmailHtml(payload),
    })
  } catch (err) {
    console.error('[sendPassEmail] Failed to send:', err)
  }
}
