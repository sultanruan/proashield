import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, exec_profiles(user_id)')
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
    .update({ status: 'failed', resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[dismiss] DB update error:', error)
    return Response.json({ error: 'Failed to update' }, { status: 500 })
  }

  return Response.json({ success: true })
}
