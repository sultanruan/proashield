import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type HeldConversation = {
  id: string
  sender_name: string
  sender_company: string
  category: string
  score: number
  summary: string
  created_at: string
}

export type WeeklyDigestPayload = {
  execNotificationEmail: string
  execFirstName: string
  heldConversations: HeldConversation[]
  weekStats: {
    screened: number
    passed: number
    held: number
    failed: number
  }
  weekStart: Date
  weekEnd: Date
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildConversationRow(conv: HeldConversation): string {
  const initial = conv.sender_name ? conv.sender_name.charAt(0).toUpperCase() : '?'
  return `
    <tr>
      <td style="padding:16px 24px;border-bottom:1px solid #F4F4F5;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="vertical-align:top;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:12px;vertical-align:top;">
                    <div style="width:36px;height:36px;border-radius:50%;background-color:#0EA5E9;text-align:center;line-height:36px;">
                      <span style="color:#FFFFFF;font-size:13px;font-weight:700;">${initial}</span>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#09090B;">${escHtml(conv.sender_name || 'Unknown')}</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#52525B;">${escHtml(conv.sender_company || 'No company')}</p>
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-right:6px;">
                          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background-color:#FFFBEB;color:#D97706;font-size:11px;font-weight:600;">${escHtml(conv.category || 'General')}</span>
                        </td>
                        <td>
                          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background-color:#F4F4F5;color:#52525B;font-size:11px;font-weight:600;">${conv.score}/100</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:8px 0 0;font-size:13px;color:#52525B;line-height:1.5;">${escHtml(conv.summary || '')}</p>
                  </td>
                </tr>
              </table>
            </td>
            <td style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:16px;">
              <a href="https://proashield.com/dashboard/exec"
                style="display:inline-block;color:#0EA5E9;font-size:13px;font-weight:600;text-decoration:none;">
                Review →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function buildWeeklyDigestHtml(p: WeeklyDigestPayload): string {
  const weekRange = `${formatDate(p.weekStart)} – ${formatDate(p.weekEnd)}`
  const hasHeld = p.heldConversations.length > 0

  const convRows = hasHeld
    ? p.heldConversations.map(buildConversationRow).join('')
    : `<tr><td style="padding:32px 24px;text-align:center;">
        <p style="margin:0;font-size:14px;color:#A1A1AA;">No held conversations this week. Your AI filtered everything.</p>
       </td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your weekly Proa digest</title>
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

              <!-- Top bar -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:#0EA5E9;height:4px;"></td>
                </tr>
              </table>

              <!-- Heading -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:32px 32px 24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0EA5E9;text-transform:uppercase;letter-spacing:0.5px;">Weekly Digest</p>
                    <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#09090B;line-height:1.3;">Your weekly outreach digest</h1>
                    <p style="margin:0;font-size:14px;color:#A1A1AA;">${weekRange}</p>
                  </td>
                </tr>
              </table>

              <!-- Stats row -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 32px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F9FAFB;border-radius:10px;border:1px solid #E4E4E7;">
                      <tr>
                        <td style="padding:16px;text-align:center;border-right:1px solid #E4E4E7;" width="25%">
                          <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#09090B;">${p.weekStats.screened}</p>
                          <p style="margin:0;font-size:11px;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.3px;">Screened</p>
                        </td>
                        <td style="padding:16px;text-align:center;border-right:1px solid #E4E4E7;" width="25%">
                          <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#059669;">${p.weekStats.passed}</p>
                          <p style="margin:0;font-size:11px;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.3px;">Passed</p>
                        </td>
                        <td style="padding:16px;text-align:center;border-right:1px solid #E4E4E7;" width="25%">
                          <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#D97706;">${p.weekStats.held}</p>
                          <p style="margin:0;font-size:11px;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.3px;">Held</p>
                        </td>
                        <td style="padding:16px;text-align:center;" width="25%">
                          <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:#6B7280;">${p.weekStats.failed}</p>
                          <p style="margin:0;font-size:11px;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.3px;">Filtered</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section title -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 32px 12px;">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#A1A1AA;text-transform:uppercase;letter-spacing:0.5px;">
                      ${hasHeld ? `${p.heldConversations.length} contact${p.heldConversations.length !== 1 ? 's' : ''} to review` : 'Held conversations'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Held conversations -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #E4E4E7;">
                ${convRows}
              </table>

              <!-- View all CTA -->
              ${hasHeld ? `
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:24px 32px 32px;" align="center">
                    <a href="https://proashield.com/dashboard/exec"
                      style="display:inline-block;background-color:#0EA5E9;color:#FFFFFF;font-size:14px;font-weight:600;padding:11px 28px;border-radius:8px;text-decoration:none;">
                      Review all in dashboard →
                    </a>
                  </td>
                </tr>
              </table>` : `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="height:24px;"></td></tr></table>`}

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

export async function sendWeeklyDigest(payload: WeeklyDigestPayload): Promise<void> {
  try {
    const n = payload.heldConversations.length
    const subject = `Your Proa weekly digest — ${n} contact${n !== 1 ? 's' : ''} to review`

    await resend.emails.send({
      from: 'ProaShield <noreply@proashield.com>',
      to: payload.execNotificationEmail,
      subject,
      html: buildWeeklyDigestHtml(payload),
    })
  } catch (err) {
    console.error('[sendWeeklyDigest] Failed to send:', err)
  }
}
