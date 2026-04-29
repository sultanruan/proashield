import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendApprovalEmail } from '@/lib/notifications/sendApprovalEmail'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch conversation with exec profile for ownership check
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, exec_profile_id, sender_name, sender_company, sender_email, summary, exec_profiles(user_id, full_name, notification_email)')
    .eq('id', id)
    .maybeSingle()

  if (!conv) return Response.json({ error: 'Not found' }, { status: 404 })

  const execProfile = Array.isArray(conv.exec_profiles)
    ? conv.exec_profiles[0]
    : conv.exec_profiles

  if (execProfile?.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('conversations')
    .update({ status: 'passed', resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[pass] DB update error:', error)
    return Response.json({ error: 'Failed to update' }, { status: 500 })
  }

  // Send approval email to sender (non-blocking)
  if (conv.sender_email && execProfile?.notification_email) {
    sendApprovalEmail({
      to: conv.sender_email,
      cc: execProfile.notification_email,
      replyTo: execProfile.notification_email,
      senderName: conv.sender_name ?? '',
      execName: execProfile.full_name ?? '',
      summary: conv.summary ?? '',
    }).catch(() => {})
  }

  return Response.json({ success: true })
}
